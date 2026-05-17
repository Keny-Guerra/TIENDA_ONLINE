# CUMPLIMIENTO DEL PROYECTO — FASE II

**Curso:** Negocios Electrónicos  
**Proyecto:** Desarrollo de LLM para e-Procurement  
**Sistema implementado:** GOLAZO STORE — Tienda deportiva online con automatización de compras mediante IA

---

## Objetivo general

> *"Diseñar e implementar una solución digital inteligente orientada al contexto de las MYPES peruanas, que integre tecnologías actuales como modelos de lenguaje (LLM) y automatización de procesos, incorporando capacidades de interpretación de lenguaje natural, generación automatizada de contenido y apoyo a la toma de decisiones."*

**Cómo lo cumplimos:**  
GOLAZO STORE es una tienda deportiva ficticia que representa una MYPE peruana. El sistema integra Ollama (LLM local con `qwen2.5:3b`) + n8n (automatización) + MySQL (datos) + Node.js (backend), implementando un flujo completo de e-Procurement donde el administrador puede crear solicitudes de compra en lenguaje natural y el sistema las procesa, clasifica, elige proveedor y genera la orden de forma automática.

---

## Actividad 1 — Definición del caso de uso de e-Procurement

### Punto 1.1: Identificar un proceso de compras en una MYPE

> *"Identificar un proceso de compras en una MYPE (ej: compra de insumos, equipos, etc.)"*

**Cómo lo cumplimos:**  
Se modeló el proceso de reposición de stock de una tienda de artículos deportivos. Cuando un producto llega a stock bajo (camisetas, zapatillas, pantalones), el administrador genera una solicitud de compra describiendo qué necesita en lenguaje natural. El sistema procesa esa solicitud automáticamente.

---

### Punto 1.2: Definir el alcance del sistema inteligente

> *"Definir el alcance del sistema inteligente"*

**Cómo lo cumplimos:**  
El sistema inteligente cubre cuatro capacidades:

| Capacidad | Descripción |
|-----------|-------------|
| Interpretación | Entiende solicitudes escritas en lenguaje natural y extrae producto, cantidad y urgencia |
| Clasificación | Determina si la compra es emergencia, reposición de stock o compra planificada, y asigna prioridad |
| Recomendación | Elige el proveedor óptimo según la urgencia (velocidad vs. precio) |
| Generación | Crea la orden de compra formal en la base de datos |

---

### Punto 1.3: Modelar el flujo Procure-to-Pay (P2P)

> *"Modelar el flujo Procure-to-Pay (P2P) que será automatizado"*

**Cómo lo cumplimos:**  
El flujo P2P implementado va desde la detección de necesidad hasta la creación de la orden:

```
[Necesidad detectada]
        │
        ▼
Admin escribe solicitud en lenguaje natural (chatbot)
        │
        ▼
Server.js detecta intención → crea registro en solicitudes_compra (estado: pendiente)
        │
        ▼
n8n recibe webhook → ejecuta 4 prompts LLM en cadena:
  Prompt 1: interpreta la solicitud → extrae producto, cantidad, urgencia
  Prompt 2: clasifica el requerimiento → tipo, prioridad, requiere aprobación
  Prompt 3: recomienda proveedor → elige entre 5 proveedores según urgencia y precio
  Prompt 4: genera la orden estructurada → solicitud_id, proveedor_id, notas, prioridad
        │
        ▼
n8n llama al backend → POST /api/solicitudes-compra/generar-orden
        │
        ▼
Orden creada en ordenes_compra, solicitud actualizada a "orden_creada"
```

---

## Actividad 2 — Diseño de la arquitectura con n8n

### Punto 2.1: LLM como motor de inteligencia

> *"LLM (motor de inteligencia)"*

**Cómo lo cumplimos:**  
Se usa **Ollama** con el modelo **`qwen2.5:3b`** corriendo localmente. El LLM procesa lenguaje natural y produce salidas estructuradas en JSON. Está integrado en dos flujos:

- En `workflow_4prompts.json`: cuatro prompts encadenados que analizan, clasifican, recomiendan y generan la orden.
- En `workflow_chatbot_consultas.json`: tres prompts independientes que responden consultas del administrador en tiempo real.

El LLM nunca accede a la base de datos directamente — solo razona sobre los datos que n8n le envía en el prompt.

---

### Punto 2.2: n8n como orquestador de workflows

> *"n8n (orquestador de workflows)"*

**Cómo lo cumplimos:**  
Se implementaron **dos workflows activos** en n8n:

| Workflow | Webhook | Función |
|----------|---------|---------|
| `Golazo Store - 4 Prompts LLM` | `/webhook/solicitud-compra` | Orquesta los 4 prompts y genera la orden |
| `Chatbot IA - Consultas` | `/webhook/chatbot-consulta` | Orquesta los prompts de consulta del chatbot |

n8n recibe los datos del backend via webhook, los procesa a través del LLM y devuelve el resultado. El backend nunca llama a Ollama directamente para las 4 funciones del proyecto — todo pasa por n8n.

---

### Punto 2.3: Base de datos

> *"Base de datos"*

**Cómo lo cumplimos:**  
Base de datos **MySQL** (`tienda_online`) con las tablas relevantes para e-Procurement:

| Tabla | Función |
|-------|---------|
| `productos` | Catálogo con stock en tiempo real |
| `proveedores` | 5 proveedores con datos de contacto y ubicación |
| `precios` | Precio de costo y venta por producto/proveedor |
| `entregas` | Tiempos de entrega mínimo/máximo por producto/proveedor |
| `solicitudes_compra` | Registro de solicitudes con estado y proveedor recomendado |
| `ordenes_compra` | Órdenes generadas automáticamente por el workflow |

---

### Punto 2.4: Conexión de componentes mediante APIs o webhooks

> *"Definir cómo se conectarán los componentes mediante APIs o webhooks"*

**Cómo lo cumplimos:**  
La arquitectura de conexión es la siguiente:

```
[admin.html]  ──POST /api/chatbot──►  [server.js]
                                            │
                          ┌─────────────────┤
                          │                 │
                  POST /webhook/            POST /webhook/
                  chatbot-consulta          solicitud-compra
                          │                 │
                          ▼                 ▼
                    [n8n workflow     [n8n workflow
                     Consultas]       4 Prompts]
                          │                 │
                    POST /api/generate      POST /api/generate (×4)
                          │                 │
                          ▼                 ▼
                       [Ollama]          [Ollama]
                                            │
                          POST /api/solicitudes-compra/generar-orden
                                            │
                                            ▼
                                       [MySQL BD]
```

Todos los componentes se comunican exclusivamente mediante HTTP/REST y webhooks, sin dependencias directas entre ellos.

---

### Punto 2.5: Nodos utilizados dentro de n8n

> *"Especificar los nodos que utilizarán dentro de n8n"*

**Cómo lo cumplimos:**

**Workflow de generación de órdenes (`workflow_4prompts.json`):**

| Nodo | Tipo | Función |
|------|------|---------|
| Webhook | `n8n-nodes-base.webhook` | Recibe la solicitud del backend |
| Edit Fields | `n8n-nodes-base.set` | Normaliza los campos de entrada |
| Ollama Prompt 1-4 | `n8n-nodes-base.httpRequest` | Llama a Ollama con cada prompt |
| Code Parse 1-4 | `n8n-nodes-base.code` | Extrae JSON limpio y acumula campos entre nodos |
| HTTP Backend | `n8n-nodes-base.httpRequest` | Llama al backend para crear la orden en BD |

**Workflow de consultas del chatbot (`workflow_chatbot_consultas.json`):**

| Nodo | Tipo | Función |
|------|------|---------|
| Webhook | `n8n-nodes-base.webhook` | Recibe el mensaje del chatbot |
| Extraer Campos | `n8n-nodes-base.set` | Extrae `tipo` y `mensaje` |
| Es Interpretar? | `n8n-nodes-base.if` | Rutea al prompt correcto |
| Es Clasificar? | `n8n-nodes-base.if` | Segundo nivel de ruteo |
| Ollama Interpretar/Clasificar/Recomendar | `n8n-nodes-base.httpRequest` | Llama a Ollama según el tipo |
| Resp Interpretar/Clasificar/Recomendar | `n8n-nodes-base.code` | Extrae la respuesta de Ollama |

---

## Actividad 3 — Construcción del dataset

### Punto 3.1: Productos

> *"Crear datos de prueba: Productos"*

**Cómo lo cumplimos:**  
**21 productos** cargados en la tabla `productos`:
- Camisetas de selecciones (Brasil, Argentina, Perú, Francia, Alemania, España)
- Camisetas de clubes (Real Madrid, Barcelona, Lakers, Bulls)
- Zapatillas de fútbol y running
- Pantalones deportivos

Cada producto tiene: nombre, categoría, deporte, precio original, precio oferta, descuento, stock e imágenes.

---

### Punto 3.2: Proveedores

> *"Crear datos de prueba: Proveedores"*

**Cómo lo cumplimos:**  
**5 proveedores** activos en la tabla `proveedores`:

| ID | Proveedor | Ciudad | Característica |
|----|-----------|--------|----------------|
| 1 | TextilPeru S.A. | Lima | Precio bajo, entrega 3-5 días |
| 2 | SportGear China | Shanghai | Precio medio, entrega 5-7 días |
| 3 | Confecciones Brasil | São Paulo | Precio medio, entrega 4-6 días |
| 4 | Adidas Direct | Lima | Precio alto, entrega 2-3 días |
| 5 | Nike Distribution | Lima | Precio alto, entrega 1-2 días |

---

### Punto 3.3: Precios

> *"Crear datos de prueba: Precios"*

**Cómo lo cumplimos:**  
**25 registros** en la tabla `precios` — precio de costo, precio de venta y margen de ganancia para cada combinación producto/proveedor. Con restricción `UNIQUE KEY (producto_id, proveedor_id)` para garantizar integridad.

---

### Punto 3.4: Tiempos de entrega

> *"Crear datos de prueba: Tiempos de entrega"*

**Cómo lo cumplimos:**  
**25 registros** en la tabla `entregas` — días mínimos, días máximos, costo de envío y ubicación de bodega por cada combinación producto/proveedor. Estos tiempos se incluyen en los prompts de recomendación para que el LLM tome decisiones informadas.

---

### Punto 3.5: Criterios de evaluación de proveedores

> *"Definir criterios de evaluación de proveedores"*

**Cómo lo cumplimos:**  
Se definió una regla de decisión clara que el LLM aplica en el Prompt 3:

- **Urgencia crítica o alta** → priorizar velocidad de entrega (elige Adidas Direct o Nike Distribution)
- **Urgencia media o baja** → priorizar precio más bajo (elige TextilPeru S.A.)
- **Tipo emergencia** → siempre elegir el proveedor más rápido disponible

Esta lógica está embebida en el prompt del nodo "Ollama Prompt 3" de n8n.

---

### Punto 3.6: Datos preparados para ser consumidos en los workflows

> *"Preparar los datos para ser consumidos dentro de los workflows"*

**Cómo lo cumplimos:**  
El backend consulta la BD y envía los datos relevantes al webhook de n8n en formato JSON:

```json
{
  "solicitud_id": 38,
  "descripcion": "Solicita 30 camisetas Brasil urgente",
  "cantidad_requerida": 30,
  "stock_bajo_producto_id": 1
}
```

Los datos de proveedores y sus características están hardcodeados en los prompts de n8n para que el LLM los use sin necesidad de consultar la BD en tiempo real.

---

## Actividad 4 — Diseño de prompts para el LLM

### Punto 4.1: Interpretar solicitudes de compra

> *"Diseñar prompts que serán utilizados dentro de n8n para: Interpretar solicitudes de compra"*

**Cómo lo cumplimos:**  
**Prompt 1** en `workflow_4prompts.json` (nodo "Ollama Prompt 1"):

```
Eres un experto en compras. Analiza esta solicitud y extrae los datos clave.
SOLICITUD:
Descripcion: {{$json.descripcion}}
Cantidad: {{$json.cantidad_requerida}}
Producto ID: {{$json.stock_bajo_producto_id}}

Extrae estos campos y responde SOLO JSON sin markdown:
{"producto_nombre": "...", "cantidad": 0, "urgencia": "alta|media|baja", "comentarios": "..."}
```

También disponible en el chatbot via `workflow_chatbot_consultas.json` (rama "interpretar"), que devuelve la respuesta en formato texto legible para el administrador.

---

### Punto 4.2: Clasificar requerimientos

> *"Diseñar prompts que serán utilizados dentro de n8n para: Clasificar requerimientos"*

**Cómo lo cumplimos:**  
**Prompt 2** en `workflow_4prompts.json` (nodo "Ollama Prompt 2"):

```
Clasifica esta solicitud de compra.
SOLICITUD:
Descripcion: {{$json.descripcion}}
Producto identificado: {{$json.producto_nombre}}
Cantidad: {{$json.cantidad}}

Criterios:
- reposicion_stock: producto con nivel bajo, compra rutinaria
- emergencia: stock en cero o faltante crítico
- planificada: compra anticipada sin urgencia

Responde SOLO JSON sin markdown:
{"tipo": "reposicion_stock|emergencia|planificada", "urgencia": "critica|alta|media|baja",
 "prioridad": 8, "requiere_aprobacion": false}
```

También disponible en el chatbot via `workflow_chatbot_consultas.json` (rama "clasificar").

---

### Punto 4.3: Recomendar proveedores

> *"Diseñar prompts que serán utilizados dentro de n8n para: Recomendar proveedores"*

**Cómo lo cumplimos:**  
**Prompt 3** en `workflow_4prompts.json` (nodo "Ollama Prompt 3"):

```
Eres un experto en selección de proveedores.
SOLICITUD: Producto: {{$json.producto_nombre}} | Cantidad: {{$json.cantidad}} | Urgencia: {{$json.urgencia}}

PROVEEDORES DISPONIBLES:
1. TextilPeru S.A.     - precio bajo,  entrega 3-5 dias
2. SportGear China     - precio medio, entrega 5-7 dias
3. Confecciones Brasil - precio medio, entrega 4-6 dias
4. Adidas Direct       - precio alto,  entrega 2-3 dias
5. Nike Distribution   - precio alto,  entrega 1-2 dias

REGLA: urgencia critica/alta → velocidad. urgencia media/baja → precio.

Responde SOLO JSON sin markdown:
{"proveedor_recomendado": 1, "razon": "...", "confianza": 85}
```

También disponible en el chatbot via `workflow_chatbot_consultas.json` (rama "recomendar").

---

### Punto 4.4: Generar órdenes de compra

> *"Diseñar prompts que serán utilizados dentro de n8n para: Generar órdenes de compra"*

**Cómo lo cumplimos:**  
**Prompt 4** en `workflow_4prompts.json` (nodo "Ollama Prompt 4"):

```
Genera el resumen ejecutivo de una orden de compra.
DATOS:
Solicitud ID: {{$json.solicitud_id}}
Producto: {{$json.producto_nombre}}
Cantidad: {{$json.cantidad}}
Proveedor seleccionado ID: {{$json.proveedor_recomendado}}
Urgencia: {{$json.urgencia}}

Responde SOLO JSON sin markdown:
{"solicitud_id": 0, "proveedor_id": 1, "cantidad": 0,
 "notas": "resumen en 1 linea", "prioridad": "urgente|normal|baja"}
```

El nodo final ("HTTP Backend") envía este JSON al endpoint `POST /api/solicitudes-compra/generar-orden` que inserta la orden en la tabla `ordenes_compra` y actualiza el estado de la solicitud a `orden_creada`.

---

### Punto 4.5: Salidas en formato JSON para facilitar la automatización

> *"Definir salidas en formato JSON para facilitar la automatización"*

**Cómo lo cumplimos:**  
Cada prompt está diseñado para producir **exclusivamente JSON válido** sin texto adicional ni markdown. Cada nodo "Code Parse" en n8n:

1. Detecta si Ollama envolvió la respuesta en bloques ` ```json ``` ` y los elimina
2. Extrae solo el objeto JSON
3. Hace `JSON.parse()` del texto limpio
4. Combina los campos nuevos con los acumulados de nodos anteriores mediante spread: `{ ...prev, ...parsed }`
5. En caso de error de parseo, retorna valores por defecto seguros para que el flujo no se rompa

```javascript
const text = $json.response;
const prev = $('Code Parse 1').first().json;

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
  return [{ json: { ...prev, proveedor_recomendado: 1, urgencia: 'media' } }];
}
```

---

## Resumen de cumplimiento

| Actividad | Punto | Estado |
|-----------|-------|--------|
| 1. Caso de uso | Proceso de compras en MYPE identificado | ✅ |
| 1. Caso de uso | Alcance del sistema inteligente definido | ✅ |
| 1. Caso de uso | Flujo P2P modelado e implementado | ✅ |
| 2. Arquitectura | LLM como motor de inteligencia (Ollama + qwen2.5:3b) | ✅ |
| 2. Arquitectura | n8n como orquestador (2 workflows activos) | ✅ |
| 2. Arquitectura | Base de datos MySQL con tablas de e-Procurement | ✅ |
| 2. Arquitectura | Componentes conectados por APIs y webhooks | ✅ |
| 2. Arquitectura | Nodos n8n especificados e implementados | ✅ |
| 3. Dataset | Productos (21 registros) | ✅ |
| 3. Dataset | Proveedores (5 registros) | ✅ |
| 3. Dataset | Precios (25 registros) | ✅ |
| 3. Dataset | Tiempos de entrega (25 registros) | ✅ |
| 3. Dataset | Criterios de evaluación de proveedores definidos | ✅ |
| 3. Dataset | Datos preparados y consumidos en workflows | ✅ |
| 4. Prompts | Interpretar solicitudes de compra | ✅ |
| 4. Prompts | Clasificar requerimientos | ✅ |
| 4. Prompts | Recomendar proveedores | ✅ |
| 4. Prompts | Generar órdenes de compra | ✅ |
| 4. Prompts | Salidas en formato JSON para automatización | ✅ |
