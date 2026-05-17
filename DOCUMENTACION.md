# GOLAZO STORE — Documentación Completa

**Proyecto:** Tienda deportiva online para MYPE ficticia  
**Stack:** Node.js + Express · MySQL · Ollama (`qwen2.5:3b`) · n8n  
**Estado:** Funcional y en producción local

---

## Tabla de contenidos

1. [Qué es el proyecto](#1-qué-es-el-proyecto)
2. [Instalación y arranque](#2-instalación-y-arranque)
3. [Base de datos](#3-base-de-datos)
4. [Fase 1 — API básica](#4-fase-1--api-básica)
5. [Fase 2 — CRUD y panel admin](#5-fase-2--crud-y-panel-admin)
6. [Fase 3 — Carrito persistente](#6-fase-3--carrito-persistente)
7. [Fase 4 — Sistema de pedidos](#7-fase-4--sistema-de-pedidos)
8. [Fase 5 — Reportes](#8-fase-5--reportes)
9. [Autenticación con BD](#9-autenticación-con-bd)
10. [Workflow de compras con IA](#10-workflow-de-compras-con-ia)
11. [Chatbot IA en el panel admin](#11-chatbot-ia-en-el-panel-admin)
12. [Dashboard del admin (reescrito)](#12-dashboard-del-admin-reescrito)
13. [Bugs corregidos — historial completo](#13-bugs-corregidos--historial-completo)
14. [API endpoints — referencia completa](#14-api-endpoints--referencia-completa)

---

## 1. Qué es el proyecto

GOLAZO STORE es una tienda online de artículos deportivos (camisetas, zapatillas, pantalones de distintas selecciones y clubes). Fue construida como proyecto académico de una MYPE ficticia, implementando todo el stack de manera progresiva en fases.

**Servicios y puertos:**

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend Node.js | 3000 | http://localhost:3000 |
| Tienda (frontend) | 3000 | http://localhost:3000/index.html |
| Panel Admin | 3000 | http://localhost:3000/admin.html |
| Ollama (LLM local) | 11434 | http://localhost:11434 |
| n8n (automatización) | 5678 | http://localhost:5678 |

**Credenciales:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin web | admin@tienda.com | admin123 |
| MySQL | root | 080100 |

---

## 2. Instalación y arranque

### Requisitos

```bash
node -v   # v18+
npm -v    # v9+
mysql     # v8+
ollama    # última versión
n8n       # v2+ (npm install -g n8n)
```

### Instalar dependencias del proyecto

```bash
cd /home/chorri/Documents/Trash/TIENDA_ONLINE
npm install
```

### Configurar `.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=080100
DB_NAME=tienda_online
PORT=3000
```

### Importar la BD

```bash
mysql -u root -p080100 -e "CREATE DATABASE IF NOT EXISTS tienda_online;"
mysql -u root -p080100 tienda_online < tienda_online.sql
```

### Arrancar todo

```bash
# Opción A — script que levanta Node.js + n8n juntos
./start-n8n.sh

# Opción B — solo el backend
npm start
```

### Verificar servicios

```bash
curl http://localhost:3000/api/productos    # Backend OK
curl http://localhost:11434/api/tags        # Ollama OK
# n8n: abrir http://localhost:5678 en el navegador
```

---

## 3. Base de datos

Base de datos: `tienda_online` (MySQL).

### Tablas principales

```sql
-- Catálogo
productos (id, nombre, categoria, deporte, descripcion, precioOriginal, precioOferta,
           descuento, stock, vistaFrente, vistaEspalda, created_at)

-- Proveedores (5 activos)
proveedores (id, nombre, contacto, email, telefono, ciudad, pais, activo)

-- Precios por proveedor
precios (id, producto_id FK, proveedor_id FK, precio_costo, precio_venta,
         margen_ganancia, cantidad_minima)
-- UNIQUE KEY (producto_id, proveedor_id)

-- Tiempos de entrega por proveedor
entregas (id, producto_id FK, proveedor_id FK, dias_minimos, dias_maximos,
          costo_envio, ubicacion_bodega)

-- Stock por proveedor
inventario (id, producto_id FK, proveedor_id FK, cantidad_stock, cantidad_reservada)

-- Carrito (por sesión anónima)
carrito (id, producto_id FK, cantidad, sesion_id)

-- Pedidos de clientes
pedidos (id, cliente_nombre, cliente_email, cliente_telefono, proveedor_id FK,
         total, estado, fecha_entrega_estimada, created_at)

-- Usuarios registrados
usuarios (id, nombres, apellidos, email UNIQUE, telefono, password, estado, created_at)

-- Solicitudes de compra (escritas por empleados en lenguaje natural)
solicitudes_compra (id, usuario_id FK, descripcion, stock_bajo_producto_id FK,
                    cantidad_requerida, estado, respuesta_ia, proveedor_recomendado_id FK,
                    orden_compra_id, created_at, updated_at)

-- Órdenes generadas automáticamente por el workflow de IA
ordenes_compra (id, solicitud_id FK, proveedor_id FK, producto_id FK, cantidad,
                precio_unitario, total, estado, respuesta_ia_justificacion,
                enviado_por_email, enviado_por_api, created_at)
```

**Datos iniciales:** 21 productos, 5 proveedores, 25 registros de precios, 25 de entregas, 25 de inventario.

---

## 4. Fase 1 — API básica

**Objetivo:** Crear el esquema de BD, poblar datos y exponer endpoints GET básicos.

**Por qué esta fase:** El proyecto arrancó con datos estáticos en el frontend. La primera prioridad fue crear una fuente de verdad en MySQL y conectar el frontend a ella vía API REST.

**Qué se hizo:**
- `database.sql` con 7 tablas + datos semilla
- `server.js` — Express + mysql2 con pool de conexiones
- Endpoints GET para catálogo

```bash
GET /api/productos
GET /api/productos/:id
GET /api/productos/categoria/:categoria
GET /api/deporte/:deporte
GET /api/proveedores
GET /api/precios/producto/:id
GET /api/entregas/producto/:id
```

---

## 5. Fase 2 — CRUD y panel admin

**Objetivo:** Operaciones de escritura sobre el catálogo + interfaz visual de administración.

**Por qué:** El cliente necesitaba poder gestionar productos, precios y entregas sin tocar SQL directamente.

**Qué se hizo:**
- `admin.html` — panel con tabs: Productos · Proveedores · Precios · Entregas
- Endpoints POST / PUT / DELETE para productos, precios y entregas
- Modales de creación y edición con validación de formulario
- Sincronización en tiempo real (las tablas se recargan al guardar)

**Acceso:** http://localhost:3000/admin.html

---

## 6. Fase 3 — Carrito persistente

**Objetivo:** Que el carrito sobreviva a cerrar el navegador.

**Por qué:** El carrito original vivía solo en memoria JavaScript. Al cerrar o refrescar, se perdía. Para una tienda real esto es inaceptable.

**Solución:** Cada usuario recibe un `sesion_id` único al entrar (se guarda en `localStorage`). Cada operación de carrito hace un llamado a la API que lo sincroniza con la tabla `carrito` en MySQL.

```bash
GET  /api/carrito/:sesionId   → recuperar items al volver
POST /api/carrito             → { producto_id, cantidad, sesion_id }
DELETE /api/carrito/:id       → eliminar item específico
```

La función `cargarCarrioDelaBD()` se ejecuta al cargar la página y restaura el estado del carrito desde la BD.

---

## 7. Fase 4 — Sistema de pedidos

**Objetivo:** Checkout completo de 3 pasos con creación de orden en BD.

**Por qué:** Antes no había forma de "completar" una compra. El carrito era el destino final. La fase 4 agregó el flujo de conversión real.

### Flujo de 3 pasos

**Paso 1 — Resumen:** muestra los items del carrito, subtotal + envío (S/ 15.00), total.

**Paso 2 — Método de pago:** 5 opciones disponibles:
- Tarjeta de crédito (con formateo automático de número)
- Yape (muestra QR)
- Plin (muestra número)
- Transferencia bancaria (muestra cuenta y CCI)
- Efectivo contra entrega

**Paso 3 — Confirmación:** animación de checkmark verde, código `GOL-{id}`, total pagado, método, fecha. El pedido se crea en BD con `estado = 'confirmado'`, fecha entrega = hoy + 5 días. El carrito se vacía.

```bash
POST /api/pedidos    → { cliente_nombre, cliente_email, cliente_telefono, items[], proveedor_id }
GET  /api/pedidos
GET  /api/pedidos/:id
PUT  /api/pedidos/:id/estado
```

---

## 8. Fase 5 — Reportes

**Objetivo:** Dashboard de ventas para el frontend del cliente.

**Por qué:** El cliente necesitaba visibilidad sobre el negocio sin entrar al admin.

```bash
GET /api/reportes/ventas          → { totalVentas, totalPedidos, ticketPromedio }
GET /api/reportes/productos-top   → top 10 productos más vendidos
GET /api/reportes/proveedores     → estadísticas por proveedor
```

La vista de reportes se abre desde el menú de usuario. Muestra tarjetas con métricas clave + tabla de top productos + info de proveedores.

---

## 9. Autenticación con BD

**Problema inicial:** Los usuarios se guardaban solo en `localStorage`. Al usar otro navegador o dispositivo, el usuario "no existía".

**Por qué se migró:** Para un sistema multi-usuario real (empleados de una MYPE), la autenticación debe estar en servidor.

**Solución:**
- Tabla `usuarios` en MySQL
- `POST /api/auth/registro` — valida email único, guarda en BD
- `POST /api/auth/login` — valida contra BD, responde con datos del usuario
- El frontend guarda los datos en `localStorage` solo después de un login exitoso en BD

```bash
POST /api/auth/registro   → { nombres, apellidos, email, telefono, password }
POST /api/auth/login      → { email, password }
```

---

## 10. Workflow de compras con IA

### Contexto y evolución

El workflow nació con la idea de usar **Claude API + n8n** para automatizar solicitudes de compra. La arquitectura era:

```
Empleado escribe solicitud → n8n Webhook → Claude API → Crear orden
```

Se abandonó Claude API por costo ($50-100 USD/mes). Se migró a **Ollama local**. El modelo inicial fue `smollm2:1.7b` pero se reemplazó por `qwen2.5:3b` (mejor seguimiento de instrucciones, respuestas más precisas, 100% gratis y privado).

### Qué hace el workflow

1. Empleado crea una solicitud describiendo en lenguaje natural qué necesita comprar
2. El backend guarda la solicitud en `solicitudes_compra` y dispara el webhook de n8n
3. n8n envía la descripción a Ollama para análisis
4. Ollama recomienda un proveedor
5. El backend crea una orden en `ordenes_compra`

### Endpoints del backend para el flujo

```bash
POST /api/solicitudes-compra                       → crear solicitud
GET  /api/solicitudes-compra                       → listar todas
POST /api/solicitudes-compra/procesar              → Ollama interpreta texto → JSON estructurado
POST /api/solicitudes-compra/recomendar-proveedor  → Ollama elige proveedor de la BD
POST /api/solicitudes-compra/generar-orden         → INSERT en ordenes_compra
GET  /api/ordenes-compra                           → listar órdenes
```

### Configuración de Ollama en server.js

```javascript
const OLLAMA_HOST = 'http://localhost:11434';
const OLLAMA_MODEL = 'qwen2.5:3b';

async function callOllama(systemPrompt, userPrompt) {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      system: systemPrompt,
      prompt: userPrompt,
      stream: false,
      options: { temperature: 0.1 }
    }),
    signal: AbortSignal.timeout(60000)   // 60s — Ollama puede tardar en cold start
  });
  const data = await response.json();
  return data.response;
}
```

### Dos workflows en n8n

El proyecto usa **dos workflows activos simultáneamente**:

| Archivo | Nombre | Webhook path | Función |
|---------|--------|-------------|---------|
| `workflow_4prompts.json` | Golazo Store - 4 Prompts LLM | `solicitud-compra` | Genera la orden de compra real |
| `workflow_chatbot_consultas.json` | Chatbot IA - Consultas | `chatbot-consulta` | Responde consultas del chatbot (pasos 1-3) |

### workflow_4prompts.json — pipeline de generación de orden

Se activa cuando el chatbot detecta una intención de crear orden. Recibe los datos de la solicitud y ejecuta 4 prompts en cadena para decidir el proveedor y generar la orden.

```
Webhook → Edit Fields → Ollama Prompt 1 → Code Parse 1
                                        → Ollama Prompt 2 → Code Parse 2
                                                          → Ollama Prompt 3 → Code Parse 3
                                                                            → Ollama Prompt 4 → Code Parse 4
                                                                                              → HTTP Backend
```

**Los 4 prompts:**

| Prompt | Qué hace | Campos que extrae |
|--------|----------|-------------------|
| 1 | Interpreta la solicitud | `producto_nombre`, `cantidad`, `urgencia`, `comentarios` |
| 2 | Clasifica el requerimiento | `tipo`, `urgencia`, `prioridad`, `requiere_aprobacion` |
| 3 | Recomienda proveedor | `proveedor_recomendado` (1-5), `razon`, `confianza` |
| 4 | Genera orden estructurada | `solicitud_id`, `proveedor_id`, `cantidad`, `notas`, `prioridad` |

**Code Parse — por qué es necesario:** Ollama puede incluir markdown en su respuesta (`\`\`\`json...\`\`\``). Cada nodo Code extrae el JSON limpio y **recupera los campos de nodos anteriores** con `$('NombreNodo').first().json` + spread. Sin esto, los datos originales se pierden entre nodos.

**HTTP Backend (nodo final):** POST a `http://localhost:3000/api/solicitudes-compra/generar-orden` → crea la orden en BD y actualiza la solicitud a `orden_creada`.

### workflow_chatbot_consultas.json — consultas del chatbot

Se activa cuando el chatbot recibe un mensaje de tipo interpretar, clasificar o recomendar. Usa dos IF nodes encadenados para rutear al prompt correcto:

```
Webhook → Extraer Campos → ¿Es Interpretar?
                              ├─ true  → Ollama Interpretar → Resp Interpretar
                              └─ false → ¿Es Clasificar?
                                           ├─ true  → Ollama Clasificar  → Resp Clasificar
                                           └─ false → Ollama Recomendar  → Resp Recomendar
```

Devuelve la respuesta de Ollama como texto formateado directamente al chatbot (`responseMode: lastNode`).

### Bugs encontrados durante la implementación de n8n

**Bug 1 — localhost vs 127.0.0.1:** n8n resuelve `localhost` como IPv6 (`::1`). Ollama escucha en IPv4. Solución: usar `http://127.0.0.1:11434/api/generate` en todos los nodos HTTP de n8n.

**Bug 2 — pérdida de datos entre nodos:** El nodo HTTP Request devuelve solo la respuesta de Ollama, descartando los datos de entrada. Solución: cada Code Parse referencia el nodo anterior con `$('NombreNodo').first().json` y hace spread: `{ ...prev, ...parsed }`.

**Bug 3 — proveedor_recomendado vs proveedor_id:** El LLM devuelve un número 1-5 como `proveedor_recomendado`, pero el backend espera `proveedor_id`. Code Parse 4 hace la asignación explícita.

**Bug 4 — Switch node incompatible:** `typeVersion: 3.2` del Switch node no es compatible con n8n 2.20.6. Se reemplazó por dos IF nodes con `typeVersion: 1`.

### Cómo importar los workflows en n8n

1. Abrir http://localhost:5678
2. **Workflows** → **Import** → seleccionar `workflow_4prompts.json` → activar
3. **Workflows** → **Import** → seleccionar `workflow_chatbot_consultas.json` → activar
4. Verificar que ambos estén activos (toggle verde)

Los prompts exactos para cada nodo Ollama están documentados en `prompts_n8n.txt`.

---

## 11. Chatbot IA en el panel admin

### Qué hace

Botón flotante 🤖 en la esquina inferior derecha de `admin.html`. El administrador puede:
- Hacer preguntas sobre el negocio ("¿productos con stock bajo?")
- Analizar solicitudes en lenguaje natural ("Analiza esta solicitud: necesito 30 camisetas Brasil urgente")
- Clasificar requerimientos ("Clasifica si es emergencia o reposición")
- Pedir recomendaciones de proveedor ("¿Qué proveedor recomiendas para entrega urgente?")
- Crear órdenes reales ("Solicita 25 camisetas Brasil")

### Endpoint

```bash
POST /api/chatbot
Body: { "mensaje": "...", "historial": [...], "usuario_id": 3 }
```

### Arquitectura de routing — n8n como orquestador

El chatbot clasifica cada mensaje con `detectarTipoMensaje()` y lo enruta según el tipo:

```
Mensaje del chatbot
  ├─ interpretar  → POST /webhook/chatbot-consulta (n8n) → Ollama → respuesta texto
  ├─ clasificar   → POST /webhook/chatbot-consulta (n8n) → Ollama → respuesta texto
  ├─ recomendar   → POST /webhook/chatbot-consulta (n8n) → Ollama → respuesta texto
  ├─ crear_orden  → INSERT en BD (solicitudes_compra)
  │                → POST /webhook/solicitud-compra (n8n) → 4 prompts → genera orden
  └─ general      → Ollama directo (server.js) con contexto de BD en tiempo real
```

**n8n es el motor de inteligencia para los 4 pasos del proyecto.** El server.js solo enruta y gestiona la BD.

### Función detectarTipoMensaje()

```javascript
function detectarTipoMensaje(msg) {
  const m = msg.toLowerCase();
  if (['solicita ', 'genera una orden', 'crea una orden',
       'quiero pedir', 'necesito que pidas'].some(p => m.includes(p))) return 'crear_orden';
  if (['clasifica', 'clasificar', 'es emergencia',
       'que tipo', 'prioridad'].some(p => m.includes(p)))             return 'clasificar';
  if (['que proveedor', 'recomiendas', 'mejor proveedor',
       'cual proveedor'].some(p => m.includes(p)))                    return 'recomendar';
  if (['analiza', 'interpreta', 'extrae',
       'que datos'].some(p => m.includes(p)))                         return 'interpretar';
  return 'general';
}
```

### Algoritmo de matching de producto (scoring)

Al crear una orden, el chatbot busca el producto con más palabras coincidentes en el mensaje, evitando falsos positivos por primera letra:

```javascript
const scored = productos.map(p => {
  const palabras = p.nombre.toLowerCase().split(' ');
  const coincidencias = palabras.filter(w => w.length > 2 && mensajeLower.includes(w)).length;
  return { p, coincidencias };
});
scored.sort((a, b) => b.coincidencias - a.coincidencias);
const productoMatch = (scored[0].coincidencias > 0 ? scored[0].p : null) || productos[0];
```

### Limpieza de respuesta de Ollama

Ollama repite el prompt en la respuesta ("Admin:", "Asistente:", etc.). La función `limpiarRespuestaOllama()` extrae solo el texto útil después del último marcador `Asistente:` y elimina líneas que empiezan con `Admin:`.

### Prompts de prueba para el chatbot

Ver `prompts_chatbot.txt` — contiene ejemplos listos para pegar en el chatbot que demuestran los 4 pasos del proyecto.

---

## 12. Dashboard del admin (reescrito)

### Por qué se reescribió

El dashboard original mostraba 4 cajas grises con `totalProductos`, `totalProveedores`, `totalStock` y `precioPromedio`. El endpoint hacía JOIN con tablas (`inventario.cantidad_disponible`, `precios`) que tenían inconsistencias de esquema, causando un 500 en producción.

### Qué muestra ahora

**6 KPI cards** con gradientes de color:
- Total productos
- Proveedores activos
- Pedidos totales
- Ingresos totales (S/)
- Solicitudes pendientes
- Órdenes de compra

**Alertas de stock bajo:** lista de productos con `stock < 10` en rojo/naranja.

**Solicitudes por estado:** barras de progreso para pendiente, procesada, orden_creada, etc.

**Últimas órdenes de compra:** tabla con las 5 órdenes más recientes.

**Top 5 productos:** ranking con medallas 🥇🥈🥉 por precio de venta.

### Endpoint reescrito

```bash
GET /api/dashboard
Response: {
  kpis: { totalProductos, totalProveedores, totalPedidos, ingresoTotal, solicitudesPendientes, totalOrdenes },
  stockBajo: [ { id, nombre, stock } ],
  solicitudesPorEstado: [ { estado, count } ],
  ultimasOrdenes: [ { id, proveedor_nombre, producto_nombre, cantidad, total, estado } ],
  topProductos: [ { nombre, precioOferta } ]
}
```

---

## 13. Bugs corregidos — historial completo

### Bug A — Timeout de Ollama silencioso

**Síntoma:** El chatbot respondía "Error de conexión" sin hacer ningún POST al backend.

**Causa raíz:** `callOllama()` usaba `fetch(..., { timeout: 30000 })`. En Node.js 18+, la opción `timeout` del segundo argumento de `fetch()` es ignorada silenciosamente. La llamada colgaba indefinidamente y el pool de conexiones MySQL se agotaba.

**Fix:**
```javascript
// MAL — silenciosamente ignorado
const response = await fetch(url, { timeout: 30000 });

// BIEN — AbortSignal.timeout() es el estándar en Node.js 18+
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
```

### Bug B — Connection leak en el catch del chatbot

**Síntoma:** Después de varios errores, el servidor dejaba de responder (pool de conexiones agotado).

**Causa raíz:** El bloque `catch` del endpoint `/api/chatbot` no liberaba la conexión MySQL si se lanzaba una excepción antes de `connection.release()`.

**Fix:**
```javascript
// ANTES — connection nunca se libera si hay error
const connection = await pool.getConnection();
try {
  // ...
} catch (error) {
  res.status(500).json({ error: 'Error al procesar mensaje' });
}

// DESPUÉS — pattern correcto
let connection = null;
try {
  connection = await pool.getConnection();
  // ...
} catch (error) {
  if (connection) connection.release();   // siempre libera
  res.status(500).json({ error: '...' });
}
```

### Bug C — `usuarioActual` no declarado (ReferenceError silencioso)

**Síntoma:** Todos los mensajes del chatbot respondían "Error de conexión" pero el Network tab del navegador no mostraba ningún POST a `/api/chatbot`.

**Causa raíz:** La función `enviarMensaje()` en `admin.html` usaba `usuarioActual?.id || 1`. El operador `?.` previene errores con `null` o `undefined`, pero **NO previene `ReferenceError`** cuando la variable nunca fue declarada. El error se lanzaba dentro del bloque `try` y el `catch` mostraba "Error de conexión" antes de que se hiciera cualquier fetch.

**Fix:** Agregar al bloque `<script>` del chatbot:
```javascript
const chatHistorial = [];
const usuarioActual = { id: 3 };  // usuario admin
```

### Bug D — Producto incorrecto en solicitud de chatbot

**Síntoma:** Al decir "pide 10 polos Lakers", la orden se generaba para "Polo Argentina" en lugar de "Polo Lakers".

**Causa raíz:** El algoritmo original usaba `productos.find(p => mensajeLower.includes(primeraPalabra))`. Como "polos".includes("polo") es true, encontraba "Polo Argentina" (primer producto alfabéticamente) antes de llegar a "Polo Lakers".

**Fix:** Algoritmo de scoring por palabras coincidentes (ver sección 11).

### Bug E — Dashboard 500

**Síntoma:** El tab Dashboard del admin mostraba 4 cajas grises vacías.

**Causa raíz:** El endpoint `/api/dashboard` original consultaba `inventario.cantidad_disponible` (columna que no existe en el esquema real, que usa `cantidad_stock`) y `precios` (con JOINs que fallaban).

**Fix:** Reescritura completa del endpoint usando solo las columnas que existen en las tablas correctas.

### Bug F — Chatbot: typingId null

**Síntoma:** A veces el chat se bloqueaba con un error de JS sin mostrar mensaje de error.

**Causa raíz:** El código hacía `document.getElementById(typingId).remove()` en el bloque catch. Si el elemento del indicador de "escribiendo..." ya había sido removido o nunca se agregó al DOM, esto lanzaba un error.

**Fix:**
```javascript
const el = document.getElementById(typingId);
if (el) el.remove();
```

---

## 14. API endpoints — referencia completa

### Catálogo

```
GET  /api/productos
GET  /api/productos/:id
GET  /api/productos/categoria/:categoria
GET  /api/deporte/:deporte
POST /api/productos
PUT  /api/productos/:id
DELETE /api/productos/:id
```

### Proveedores

```
GET /api/proveedores
GET /api/proveedores/:id
```

### Precios y entregas

```
GET    /api/precios/producto/:id
POST   /api/precios
PUT    /api/precios/:id
DELETE /api/precios/:id

GET    /api/entregas/producto/:id
POST   /api/entregas
PUT    /api/entregas/:id
DELETE /api/entregas/:id
```

### Inventario

```
GET /api/inventario
GET /api/inventario/producto/:id
```

### Carrito

```
GET    /api/carrito/:sesionId
POST   /api/carrito                   → { producto_id, cantidad, sesion_id }
DELETE /api/carrito/:id
```

### Autenticación

```
POST /api/auth/registro   → { nombres, apellidos, email, telefono, password }
POST /api/auth/login      → { email, password }
```

### Pedidos

```
GET  /api/pedidos
GET  /api/pedidos/:id
GET  /api/pedidos/cliente/:email
POST /api/pedidos         → { cliente_nombre, cliente_email, cliente_telefono, items[], proveedor_id }
PUT  /api/pedidos/:id/estado
```

### Reportes

```
GET /api/reportes/ventas
GET /api/reportes/productos-top
GET /api/reportes/proveedores
```

### Dashboard (admin)

```
GET /api/dashboard    → kpis, stockBajo, solicitudesPorEstado, ultimasOrdenes, topProductos
```

### Chatbot

```
POST /api/chatbot     → { mensaje, historial[], usuario_id }
```

### Solicitudes y órdenes de compra

```
GET  /api/solicitudes-compra
POST /api/solicitudes-compra          → { usuario_id, descripcion, cantidad_requerida, stock_bajo_producto_id }
POST /api/solicitudes-compra/procesar → { solicitud_id }
POST /api/solicitudes-compra/recomendar-proveedor → { solicitud_id }
POST /api/solicitudes-compra/generar-orden        → { solicitud_id }

GET  /api/ordenes-compra
GET  /api/ordenes-compra/:id
PUT  /api/ordenes-compra/:id/estado
```

---

## Archivos clave del proyecto

| Archivo | Descripción |
|---------|-------------|
| `server.js` | Todo el backend: endpoints, chatbot, callOllama, pool MySQL |
| `admin.html` | Panel administrador (dashboard, CRUD, chatbot, tabs de órdenes) |
| `index.html` | Tienda pública (catálogo, carrito, checkout) |
| `script-new.js` | Lógica del frontend de la tienda |
| `workflow_4prompts.json` | Workflow n8n — genera órdenes de compra (4 prompts encadenados) |
| `workflow_chatbot_consultas.json` | Workflow n8n — responde consultas del chatbot (interpretar/clasificar/recomendar) |
| `prompts_n8n.txt` | Prompts exactos para cada nodo Ollama en n8n |
| `prompts_chatbot.txt` | Prompts de prueba para demostrar el chatbot |
| `test_workflow.sh` | Script para probar el flujo completo de n8n |
| `start-n8n.sh` | Inicia Node.js + n8n simultáneamente |
| `.env` | Credenciales MySQL y configuración de puertos |
| `tienda_online.sql` | Dump completo de la BD con estructura y datos semilla |
