# Chatbot IA - Panel Administrador

**Fecha**: 2026-05-15  
**Status**: Funcionando  
**Solo visible para**: Usuarios con rol `admin`

---

## Descripción

Chatbot conversacional integrado en `admin.html` que responde preguntas sobre la tienda en tiempo real usando datos de la BD MySQL y el modelo Ollama local (`smollm2:1.7b`).

---

## Cómo usarlo

1. Ingresar como admin: `admin@tienda.com` / `admin123`
2. El sistema redirige automáticamente a `/admin.html`
3. Click en el botón flotante 🤖 (esquina inferior derecha)
4. Escribir la pregunta y presionar Enter o el botón de enviar

---

## Ejemplos de preguntas

- "¿Cuántos productos hay y cuáles tienen stock bajo?"
- "¿Qué proveedores tenemos disponibles?"
- "¿Cuántas órdenes de compra están pendientes?"
- "¿Cuánto es el total de ingresos en pedidos?"
- "¿Cuál es el producto más caro?"

---

## Arquitectura

```
Admin escribe pregunta
        ↓
Frontend (admin.html)
  POST /api/chatbot  { mensaje, historial[] }
        ↓
server.js - Endpoint /api/chatbot
  1. Consulta MySQL: productos, pedidos, stock bajo, proveedores, órdenes
  2. Construye contexto con datos reales
  3. Llama a Ollama (smollm2:1.7b)
        ↓
Ollama (localhost:11434)
  Procesa con contexto de la tienda
        ↓
Respuesta al admin en el chat
```

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `server.js` | Nuevo endpoint `POST /api/chatbot` (al final del archivo) |
| `admin.html` | Widget flotante de chat (antes del cierre `</body>`) |

---

## Endpoint API

**`POST /api/chatbot`**

```json
// Request
{
  "mensaje": "¿Cuántos productos hay?",
  "historial": [
    { "rol": "usuario", "texto": "mensaje anterior" },
    { "rol": "bot", "texto": "respuesta anterior" }
  ]
}

// Response
{
  "respuesta": "Hay 20 productos en catálogo..."
}
```

El historial acepta hasta los últimos 6 mensajes para mantener contexto conversacional sin saturar el modelo.

---

## Contexto que el chatbot conoce

- Total de productos y lista con precios y stock
- Total de pedidos e ingresos acumulados
- Productos con stock bajo (< 10 unidades)
- Proveedores activos
- Órdenes de compra pendientes

---

## Fix: Repetición de respuestas (2026-05-15)

**Problema**: `smollm2:1.7b` tendía a repetir el historial de conversación dentro de su respuesta.

**Causa**: El modelo incluía el prompt completo (historial + pregunta) en su output.

**Solución aplicada en `server.js`**:
1. El prompt termina con `Asistente:` para forzar al modelo a continuar desde ahí.
2. Post-procesamiento: se busca el último `Asistente:` en el output y se extrae solo lo que viene después.
3. Se eliminan líneas espurias que empiecen con `Admin:`.

```javascript
// Extraer solo la última respuesta del Asistente
const marcador = 'Asistente:';
const ultimoIdx = respuesta.lastIndexOf(marcador);
if (ultimoIdx !== -1) {
  respuesta = respuesta.slice(ultimoIdx + marcador.length);
}
respuesta = respuesta.split('\n').filter(l => !l.startsWith('Admin:')).join('\n').trim();
```

---

## Datos técnicos

| Parámetro | Valor |
|-----------|-------|
| Modelo | smollm2:1.7b |
| Host Ollama | localhost:11434 |
| Temperatura | 0.1 |
| Historial máximo | 6 mensajes |
| Timeout | 30 segundos |

---

## Flujo n8n con LLM — 4 Prompts en cadena (2026-05-16)

El chatbot puede disparar un flujo n8n completo que usa 4 prompts encadenados con Ollama para gestionar solicitudes de compra de forma automática.

### Arquitectura del flujo

```
Webhook → Edit Fields → [Prompt1 HTTP] → Parse1
                                              → [Prompt2 HTTP] → Parse2
                                                                      → [Prompt3 HTTP] → Parse3
                                                                                              → [Prompt4 HTTP] → Parse4
                                                                                                                      → POST /api/solicitudes-compra/generar-orden
```

### Los 4 prompts

| Nodo | Nombre | Función | Salida JSON |
|------|--------|---------|-------------|
| Prompt 1 | Interpretar | Extrae producto, cantidad y urgencia de la solicitud | `{producto_nombre, cantidad, urgencia, comentarios}` |
| Prompt 2 | Clasificar | Determina tipo, urgencia final y prioridad | `{tipo, urgencia, prioridad, requiere_aprobacion}` |
| Prompt 3 | Recomendar proveedor | Elige el mejor proveedor según urgencia y precio | `{proveedor_recomendado, razon, confianza}` |
| Prompt 4 | Generar orden | Consolida todos los datos para crear la orden | `{solicitud_id, proveedor_id, cantidad, notas, prioridad}` |

### Nodos en n8n

Cada prompt usa un nodo **HTTP Request** a Ollama seguido de un **Code Node** que limpia la respuesta:

**HTTP Request (Ollama)**:
- URL: `http://127.0.0.1:11434/api/generate`
- Method: POST
- Body: JSON con `model`, `prompt`, `stream: false`, `options: {temperature: 0.1}`

**Code Node (parseo universal)**:
```javascript
const text = $input.first().json.response;
let jsonText = text;
if (text.includes('```json')) {
  jsonText = text.split('```json')[1].split('```')[0];
} else if (text.includes('{')) {
  jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
}
try {
  const parsed = JSON.parse(jsonText.trim());
  return [{ json: { ...prev, ...parsed } }];
} catch (e) {
  return [{ json: { ...prev } }]; // fallback con datos anteriores
}
```

### Nodo final — HTTP Request al backend

- **URL**: `http://localhost:3000/api/solicitudes-compra/generar-orden`
- **Method**: POST
- **Body**:
```json
{ "solicitud_id": "{{ $json.solicitud_id }}", "proveedor_id": "{{ $json.proveedor_id }}" }
```

> Ver prompts completos en `implementa_n8n.md`

---

## Tabs nuevos en admin.html (2026-05-16)

Se agregaron 2 tabs al panel administrador para verificar el resultado del flujo n8n sin usar la terminal:

### Tab: Solicitudes de Compra
- Lista todas las solicitudes con estado en colores:
  - 🟡 Amarillo = `pendiente`
  - 🔵 Azul = `procesando`
  - 🟢 Verde = `orden_creada`
  - 🔴 Rojo = `rechazada`
- Muestra si ya tiene una orden vinculada (`Orden #ID`)
- Endpoint: `GET /api/solicitudes-compra`

### Tab: Órdenes de Compra
- Lista todas las órdenes generadas por el LLM
- Muestra: proveedor, producto, cantidad, total y estado
- Botón **Actualizar** para refrescar sin recargar la página
- Endpoint: `GET /api/ordenes-compra`

### Cómo verificar que el flujo funcionó

1. Usa el chatbot o envía una solicitud desde la web
2. El flujo n8n procesa los 4 prompts (~10-20 segundos)
3. Ve al tab **Órdenes de Compra** → clic en **Actualizar**
4. Debe aparecer una nueva fila con estado `pendiente` y el proveedor asignado por el LLM
