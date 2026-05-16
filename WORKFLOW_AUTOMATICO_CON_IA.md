# 🤖 WORKFLOW AUTOMÁTICO DE COMPRA CON IA - DOCUMENTACIÓN COMPLETA

## 📋 Descripción General

Sistema automatizado que permite a empleados solicitar compras de forma natural (en lenguaje conversacional), mientras que una IA (Claude) interpreta el requerimiento y genera automáticamente órdenes de compra recomendando el mejor proveedor.

**Flujo:**
```
Stock bajo detectado → Empleado escribe solicitud
        ↓
LLM interpreta requerimiento
        ↓
n8n consulta proveedores y precios en BD
        ↓
LLM recomienda mejor proveedor (precio, plazo, cantidad mínima)
        ↓
Se genera orden de compra automática
        ↓
Se envía por correo/API al proveedor
        ↓
Se registra todo en la base de datos
        ↓
Panel admin muestra órdenes pendientes
```

---

## 🏗️ Arquitectura Técnica

```
┌─────────────────────────────────────────────────────┐
│  EMPLEADO (Frontend - index.html)                   │
│  Click "Solicitar Compra (IA)"                      │
│  Escribe en lenguaje natural                        │
└──────────────────────┬──────────────────────────────┘
                       │
        API POST /api/solicitudes-compra
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  SERVIDOR NODE.JS (server.js)                       │
│  Guardar solicitud en tabla solicitudes_compra      │
└──────────────────────┬──────────────────────────────┘
                       │
        WEBHOOK o POLLING
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  N8N (WORKFLOW ENGINE)                              │
│  1. Detectar nueva solicitud                        │
│  2. Extraer texto                                   │
│  3. Enviar a Claude API                             │
└──────────────────────┬──────────────────────────────┘
                       │
        HTTP POST (JSON con solicitud)
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  CLAUDE API (IA - Anthropic)                        │
│  Interpretar:                                       │
│  - Producto requerido                              │
│  - Cantidad                                         │
│  - Prioridad/urgencia                              │
│  - Presupuesto si aplica                           │
└──────────────────────┬──────────────────────────────┘
                       │
        Respuesta JSON estructurada
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  N8N (continuación)                                 │
│  3. Claude responde con estructura JSON             │
│  4. Consultar BD (proveedores, precios)            │
│  5. Evaluar opciones                               │
└──────────────────────┬──────────────────────────────┘
                       │
        API calls a /api/ordenes-compra
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  SERVIDOR NODE.JS                                   │
│  Crear orden de compra automáticamente              │
│  - INSERT en tabla ordenes_compra                   │
│  - Actualizar solicitud con estado "procesada"      │
└──────────────────────┬──────────────────────────────┘
                       │
        Respuesta con orden creada
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  N8N (continuación)                                 │
│  6. Generar email/PDF                              │
│  7. Enviar a proveedor                             │
│  8. Actualizar orden con "enviado_por_email"        │
└──────────────────────┬──────────────────────────────┘
                       │
        Notificación a usuario
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│  BASE DE DATOS (MySQL)                              │
│  Tablas:                                            │
│  - solicitudes_compra (historial)                  │
│  - ordenes_compra (órdenes generadas)             │
│  - usuarios (who requested)                        │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos - Nuevas Tablas

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: solicitudes_compra
```sql
CREATE TABLE solicitudes_compra (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  descripcion TEXT NOT NULL,              -- Texto natural que escribió el empleado
  stock_bajo_producto_id INT,            -- Producto específico (opcional)
  cantidad_requerida INT,                -- Cantidad solicitada
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, procesada, error
  respuesta_ia TEXT,                     -- Análisis de Claude en JSON
  proveedor_recomendado_id INT,         -- Proveedor elegido por IA
  orden_compra_id INT,                  -- Orden generada
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (stock_bajo_producto_id) REFERENCES productos(id),
  FOREIGN KEY (proveedor_recomendado_id) REFERENCES proveedores(id)
);
```

### Tabla: ordenes_compra
```sql
CREATE TABLE ordenes_compra (
  id INT PRIMARY KEY AUTO_INCREMENT,
  solicitud_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2),        -- Del registro de precios
  total DECIMAL(10,2),                  -- cantidad * precio_unitario
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, enviado, recibido
  respuesta_ia_justificacion TEXT,      -- Por qué eligió este proveedor
  enviado_por_email BOOLEAN DEFAULT FALSE,
  enviado_por_api BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes_compra(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

---

## 📡 API Endpoints (Ya Implementados)

### Autenticación
```
POST /api/auth/registro
POST /api/auth/login
```

### Solicitudes de Compra
```
POST /api/solicitudes-compra
  Body: {
    usuario_id: int,
    descripcion: string,           // "Necesitamos 50 camisetas Perú M"
    stock_bajo_producto_id: int?,  // Opcional
    cantidad_requerida: int
  }
  Response: { id, estado: "pendiente", mensaje }

GET /api/solicitudes-compra
  Response: Array de todas las solicitudes

GET /api/solicitudes-compra/usuario/:usuario_id
  Response: Array de solicitudes del usuario
```

### Órdenes de Compra
```
POST /api/ordenes-compra
  Body: {
    solicitud_id: int,
    proveedor_id: int,
    producto_id: int,
    cantidad: int,
    precio_unitario: decimal,
    respuesta_ia_justificacion: string  // "Este proveedor tiene mejor precio..."
  }
  Response: { id, estado: "pendiente", mensaje }

GET /api/ordenes-compra
  Response: Array de todas las órdenes

GET /api/ordenes-compra/:id
  Response: Detalle de orden

PUT /api/ordenes-compra/:id/estado
  Body: { estado, enviado_por_email, enviado_por_api }
```

---

## 🔧 Instalación de n8n

### Opción 1: Instalación Local (Recomendado para desarrollo)

```bash
# Instalar npm globalmente
npm install -g n8n

# Iniciar n8n
n8n start

# Acceder a: http://localhost:5678
```

### Opción 2: Docker (Recomendado para producción)

```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Opción 3: Cloud (n8n Cloud)
1. Ir a https://n8n.cloud
2. Crear cuenta
3. Crear nuevo workflow

---

## 🤖 Configurar Claude API

### Paso 1: Obtener API Key

1. Ir a https://console.anthropic.com/
2. Crear cuenta o iniciar sesión
3. Ir a "API Keys"
4. Crear nueva key (comenzará con `sk-ant-...`)
5. Guardar en lugar seguro

### Paso 2: En n8n

1. Click en "Credentials"
2. Click "+ New"
3. Buscar "Anthropic" o crear "HTTP Request"
4. Guardar API key

---

## 🔄 Crear Workflow en n8n

### Paso 1: Configurar Webhook (Disparador)

En n8n:
1. Click en "Trigger"
2. Buscar "Webhook"
3. Configurar:
   ```
   Method: POST
   Path: /compra-automatica
   Authentication: None (para testing)
   ```
4. Copiar URL generada (Ej: `https://tudominio.n8n.io/webhook/compra-automatica`)

### Paso 2: Llamar desde Node.js

En `server.js`, cuando se crea solicitud:

```javascript
app.post('/api/solicitudes-compra', async (req, res) => {
  try {
    const { usuario_id, descripcion, stock_bajo_producto_id, cantidad_requerida } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO solicitudes_compra (...) VALUES (...)',
      [usuario_id, descripcion, stock_bajo_producto_id, cantidad_requerida, 'pendiente']
    );
    connection.release();

    // Disparar n8n webhook
    fetch('https://tudominio.n8n.io/webhook/compra-automatica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solicitud_id: result.insertId,
        usuario_id,
        descripcion,
        cantidad_requerida
      })
    }).catch(err => console.error('n8n webhook error:', err));

    res.status(201).json({ id: result.insertId, estado: 'pendiente' });
  } catch (error) {
    // ...
  }
});
```

### Paso 3: Procesar en n8n

```json
WORKFLOW EN N8N:

1. [Webhook Trigger]
   ↓
2. [Set - Extraer datos]
   data = input.json
   descripcion = data.descripcion
   solicitud_id = data.solicitud_id
   ↓
3. [HTTP Request - Claude API]
   Method: POST
   URL: https://api.anthropic.com/v1/messages
   Headers:
     x-api-key: sk-ant-xxxxx
     anthropic-version: 2023-06-01
   Body: {
     "model": "claude-3-5-sonnet-20241022",
     "max_tokens": 1024,
     "messages": [
       {
         "role": "user",
         "content": "Eres un experto en compras. Analiza este requerimiento y extrae: producto, cantidad, urgencia, presupuesto aproximado.\n\nRequerimiento: ${descripcion}\n\nResponde en JSON con campos: producto_nombre, cantidad, urgencia (baja/media/alta), presupuesto_aproximado"
       }
     ]
   }
   ↓
4. [Parse JSON]
   data = response.content[0].text
   ↓
5. [Consultar BD - HTTP Request a tu servidor]
   GET /api/productos
   GET /api/precios/producto/:id
   GET /api/proveedores
   ↓
6. [Process - Evaluar opciones]
   Seleccionar mejor proveedor basado en:
   - Precio más bajo
   - Cantidad mínima cumplida
   - Plazo de entrega menor
   - Disponibilidad
   ↓
7. [HTTP Request - Crear Orden]
   POST /api/ordenes-compra
   Body: {
     solicitud_id,
     proveedor_id: [elegido],
     producto_id,
     cantidad,
     precio_unitario,
     respuesta_ia_justificacion: "Elegido por mejor precio..."
   }
   ↓
8. [Enviar Email]
   To: proveedor.email
   Subject: Orden de Compra Automática #${id}
   Body: Template con detalles
   ↓
9. [Actualizar Estado]
   PUT /api/ordenes-compra/:id/estado
   Body: { estado: "enviado", enviado_por_email: true }
```

---

## 📝 Ejemplo de Solicitud Natural

### Lo que escribe el empleado:
```
"Necesitamos 50 camisetas de Perú en talla M urgente. 
Stock bajo. Presupuesto máximo 8000 soles. 
Entregar antes del viernes si es posible."
```

### Lo que Claude entiende (respuesta IA):
```json
{
  "producto_nombre": "Camiseta Perú",
  "talla": "M",
  "cantidad": 50,
  "urgencia": "alta",
  "presupuesto_aproximado": 8000,
  "fecha_limite": "viernes",
  "comentarios": "Stock crítico"
}
```

### Lo que n8n hace:
1. Busca productos que coincidan con "Camiseta Perú"
2. Obtiene precios de todos los proveedores
3. Filtra por cantidad mínima ≤ 50
4. Evalúa cada opción:
   - Proveedor A: $160/uni × 50 = $8000 (perfecto) - 7 días
   - Proveedor B: $155/uni × 50 = $7750 (mejor precio) - 10 días
   - Proveedor C: $170/uni × 50 = $8500 (sobre presupuesto) - 3 días
5. Claude recomienda: "Proveedor B - Mejor precio dentro de presupuesto"
6. Se genera orden automáticamente

---

## 🎨 Panel Admin - Sección de Órdenes

Agregar a `admin.html`:

```html
<div id="ordenes-tab" class="tab-content" style="display: none;">
    <h2>📦 Órdenes de Compra Automáticas</h2>
    
    <div class="tabla-responsive">
        <table id="tabla-ordenes" border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Solicitud</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Proveedor</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Enviado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="ordenes-body"></tbody>
        </table>
    </div>
</div>
```

JavaScript para cargar:

```javascript
async function cargarOrdenes() {
    try {
        const response = await fetch('/api/ordenes-compra');
        const ordenes = await response.json();
        
        const tbody = document.getElementById('ordenes-body');
        tbody.innerHTML = '';
        
        ordenes.forEach(orden => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${orden.id}</td>
                <td>${orden.solicitud_id}</td>
                <td>${orden.producto_nombre}</td>
                <td>${orden.cantidad}</td>
                <td>${orden.proveedor_nombre}</td>
                <td>S/ ${orden.total.toFixed(2)}</td>
                <td><span class="estado-badge ${orden.estado}">${orden.estado}</span></td>
                <td>${orden.enviado_por_email ? '✓ Email' : '-'}</td>
                <td>
                    <button onclick="verDetalleOrden(${orden.id})">Ver</button>
                    <button onclick="marcarEnviada(${orden.id})">✓ Enviada</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

## 🚀 Testing del Workflow

### Test 1: Registro de usuario

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Empleado",
    "email": "juan.empleado@tienda.com",
    "telefono": "999 888 777",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Test 2: Crear solicitud de compra

```bash
curl -X POST http://localhost:3000/api/solicitudes-compra \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "descripcion": "Necesitamos 30 camisetas Perú urgente. Stock crítico.",
    "stock_bajo_producto_id": 1,
    "cantidad_requerida": 30
  }'
```

### Test 3: Crear orden de compra

```bash
curl -X POST http://localhost:3000/api/ordenes-compra \
  -H "Content-Type: application/json" \
  -d '{
    "solicitud_id": 1,
    "proveedor_id": 1,
    "producto_id": 1,
    "cantidad": 30,
    "precio_unitario": 155.00,
    "respuesta_ia_justificacion": "Mejor precio dentro del presupuesto. Entrega en 7 días."
  }'
```

### Test 4: Ver órdenes

```bash
curl http://localhost:3000/api/ordenes-compra
```

---

## 📊 Ejemplo Completo de Workflow (JSON para n8n)

Guardar como `workflow.json` e importar en n8n:

```json
{
  "nodes": [
    {
      "parameters": {
        "path": "compra-automatica",
        "responseMode": "onReceived",
        "options": {}
      },
      "id": "webhook_trigger",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsonData": "={}"
      },
      "id": "claude_call",
      "name": "Call Claude API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [450, 300],
      "credentials": {
        "httpCustomAuth": "claudeAuth"
      }
    },
    {
      "parameters": {
        "url": "http://localhost:3000/api/ordenes-compra",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "solicitud_id",
              "value": "={{ $node.webhook_trigger.json.solicitud_id }}"
            }
          ]
        }
      },
      "id": "create_order",
      "name": "Create Order",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [650, 300]
    }
  ],
  "connections": {
    "webhook_trigger": {
      "main": [
        [
          {
            "node": "claude_call",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "claude_call": {
      "main": [
        [
          {
            "node": "create_order",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 📈 Métricas y Monitoreo

### KPIs a Rastrear
- Tiempo promedio de procesamiento (desde solicitud a orden)
- % de órdenes procesadas exitosamente
- Proveedor más frecuentemente recomendado
- Ahorro vs compra manual
- Tasa de error de IA

### En n8n
```
Usar "Log" node para registrar:
- Solicitud ID
- Proveedor elegido
- Precio recomendado
- Estado de envío
```

---

## 🔐 Seguridad

### Variables de Entorno (a agregar a .env)

```
CLAUDE_API_KEY=sk-ant-xxxxx
N8N_WEBHOOK_URL=https://tudominio.n8n.io/webhook/compra-automatica
SENDGRID_API_KEY=xxxxx  # Para enviar emails
```

### En Node.js

```javascript
require('dotenv').config();

const claudeKey = process.env.CLAUDE_API_KEY;
const n8nWebhook = process.env.N8N_WEBHOOK_URL;
```

---

## 🎓 Casos de Uso Avanzados

### Caso 1: Reordenamiento Automático
```
Cron job cada noche:
SELECT * FROM inventario WHERE cantidad_stock < cantidad_minima

Para cada producto bajo stock:
POST /api/solicitudes-compra (automáticamente)
```

### Caso 2: Recomendación de Cambio de Proveedor
```
Mensualmente:
- Comparar precios históricos
- Si nuevo proveedor 10% más barato
- Generar solicitud de "Evaluación de nuevo proveedor"
```

### Caso 3: Predicción de Demanda
```
Usar Claude para:
- Analizar histórico de vendas
- Predecir demanda próximas semanas
- Generar solicitudes proactivas
```

---

## 📚 Recursos Útiles

### Documentación
- [Claude API - Anthropic](https://docs.anthropic.com/)
- [n8n - Documentation](https://docs.n8n.io/)
- [n8n - Templates](https://n8n.io/workflows/)

### Ejemplos
- [n8n - Slack Integration](https://n8n.io/workflows/slack-notifications/)
- [Claude - API Examples](https://github.com/anthropics/claude-quickstart)

---

## ✅ Checklist de Implementación

- [x] Crear tablas en BD (usuarios, solicitudes_compra, ordenes_compra)
- [x] Endpoints API implementados
- [x] Frontend con form de solicitud
- [ ] Instalar n8n
- [ ] Configurar Claude API key
- [ ] Crear workflow en n8n
- [ ] Integrar webhook Node.js ↔ n8n
- [ ] Implementar envío de emails
- [ ] Agregar panel admin para órdenes
- [ ] Testing end-to-end
- [ ] Documentación para usuarios

---

## 🚀 Próximos Pasos

1. **Instalar n8n** en servidor
2. **Obtener Claude API key** de Anthropic
3. **Crear workflow** siguiendo ejemplos
4. **Configurar email** (SendGrid o Gmail)
5. **Testing** con usuarios
6. **Monitoreo** de métricas

---

**Creado:** 2026-05-12  
**Versión:** 1.0  
**Status:** Listo para implementar  

