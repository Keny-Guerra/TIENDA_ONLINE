# 🤖 INSTALACIÓN N8N + CLAUDE API - GUÍA COMPLETA

## 📋 Descripción General

Este documento te guía paso a paso para:
1. ✅ Instalar n8n (automatización sin código)
2. ✅ Obtener Claude API Key
3. ✅ Crear un workflow automático
4. ✅ Conectar Claude para análisis inteligente de compras
5. ✅ Automatizar creación de órdenes de compra

---

## 🚀 Paso 1: Instalar n8n

### Opción A: Instalación Global (Recomendado)
```bash
npm install -g n8n
```

### Opción B: Instalación Local en el Proyecto
```bash
cd /home/chorri/Documents/Trash/ll/NE/tienda_mysql
npm install n8n
```

### Verificar Instalación
```bash
n8n --version
```

---

## 🔑 Paso 2: Obtener Claude API Key

### 2.1 Ir a Anthropic Console
1. Abre: https://console.anthropic.com/
2. Inicia sesión con tu cuenta (o crea una)
3. Ve a la sección **API Keys**

### 2.2 Crear una Nueva API Key
1. Click en **"Create Key"** o **"Generate Key"**
2. Dale un nombre descriptivo: `N8N Workflow`
3. Copia la key completa (empieza con `sk-ant-`)
4. **GUARDA ESTA KEY EN UN LUGAR SEGURO** ⚠️

### 2.3 Verificar Formato
```
sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔄 Paso 3: Iniciar n8n

### Opción 1: En Terminal Separada (Recomendado)
```bash
# Terminal 1: Servidor de la tienda
cd /home/chorri/Documents/Trash/ll/NE/tienda_mysql
npm start

# Terminal 2: n8n
n8n start
```

### Resultado Esperado
```
n8n ready on http://localhost:5678
```

---

## 🎨 Paso 4: Crear el Workflow en n8n

### 4.1 Acceder a n8n
1. Abre: http://localhost:5678
2. Sign up / Login
3. Click en **"+ New"** → **"Workflow"**

### 4.2 Crear Webhook Trigger

1. **Agregar nodo inicial:**
   - Click en el área vacía
   - Busca **"Webhook"**
   - Selecciona **"Webhook"**

2. **Configurar Webhook:**
   - HTTP Method: **POST**
   - Path: **/solicitud-compra** (sin cambiar la URL base)
   - Authentication: **None** (para pruebas)
   - Copy Webhook URL completa

3. **URL webhook será algo como:**
   ```
   https://tu-instancia.n8n.cloud/webhook/solicitud-compra
   ```
   o localmente:
   ```
   http://localhost:5678/webhook/solicitud-compra
   ```

### 4.3 Procesar Datos de Entrada

1. **Agregar nodo "Set":**
   - Click derecha en Webhook → Connect → Add Node
   - Busca **"Set"**
   - Este nodo extrae datos de la solicitud

2. **Configurar campos:**
   - Input Data: **Incoming data**
   - Agrega estos campos:
     ```
     description = {{$json.descripcion}}
     producto_id = {{$json.stock_bajo_producto_id}}
     cantidad = {{$json.cantidad_requerida}}
     solicitud_id = {{$json.id}}
     ```

### 4.4 Conectar con Claude API

1. **Agregar nodo "HTTP Request":**
   - Click derecha → Add Node
   - Busca **"HTTP Request"**

2. **Configurar Claude API:**
   - Method: **POST**
   - URL: 
     ```
     https://api.anthropic.com/v1/messages
     ```
   - Authentication: **Header Auth**
     - Header Name: `x-api-key`
     - Value: Tu Claude API Key

3. **Headers:**
   - Click en "Headers"
   - Add header:
     - Name: `anthropic-version`
     - Value: `2023-06-01`

4. **Body (JSON):**
   ```json
   {
     "model": "claude-3-5-sonnet-20241022",
     "max_tokens": 1024,
     "messages": [
       {
         "role": "user",
         "content": "Analiza esta solicitud de compra:\n\nProducto ID: {{$json.producto_id}}\nCantidad: {{$json.cantidad}}\nDescripción: {{$json.description}}\n\nRecomienda el mejor proveedor (1-5) basado en:\n- Precio más bajo\n- Tiempo de entrega más rápido\n- Disponibilidad\n\nResponde SOLO en JSON:\n{\"proveedor_id\": X, \"razon\": \"...\"}"
       }
     ]
   }
   ```

### 4.5 Procesar Respuesta de Claude

1. **Agregar nodo "Code":**
   - Click derecha → Add Node
   - Busca **"Code"**

2. **Código para extraer JSON de Claude:**
   ```javascript
   // Claude devuelve en items[0].content[0].text
   const response = $json.body.content[0].text;
   
   // Buscar JSON en la respuesta
   const jsonMatch = response.match(/\{[\s\S]*\}/);
   const recomendacion = JSON.parse(jsonMatch[0]);
   
   return {
     proveedor_id: recomendacion.proveedor_id,
     razon: recomendacion.razon,
     solicitud_id: $json.solicitud_id,
     producto_id: $json.producto_id,
     cantidad: $json.cantidad
   };
   ```

### 4.6 Crear Orden de Compra

1. **Agregar nodo "HTTP Request":**
   - Conectar desde Code node
   - Method: **POST**
   - URL:
     ```
     http://localhost:3000/api/ordenes-compra
     ```

2. **Body (JSON):**
   ```json
   {
     "solicitud_id": {{$json.solicitud_id}},
     "proveedor_id": {{$json.proveedor_id}},
     "producto_id": {{$json.producto_id}},
     "cantidad": {{$json.cantidad}},
     "precio_unitario": 100,
     "estado": "pendiente",
     "respuesta_ia_justificacion": "{{$json.razon}}"
   }
   ```

### 4.7 Actualizar Estado de Solicitud

1. **Agregar nodo "HTTP Request":**
   - Method: **PUT**
   - URL:
     ```
     http://localhost:3000/api/solicitudes-compra/{{$json.solicitud_id}}/procesar
     ```

2. **Body:**
   ```json
   {
     "estado": "procesada",
     "respuesta_ia": "{{$json.razon}}"
   }
   ```

### 4.8 Enviar Email de Confirmación (Opcional)

1. **Agregar nodo "Send Email":**
   - Configura tu email (Gmail, Outlook, etc.)
   - To: email del proveedor
   - Subject: `Nueva Orden de Compra - {{$json.solicitud_id}}`
   - Body: Incluye detalles de la orden

---

## 📝 Paso 5: Guardar y Activar Workflow

1. **Guardar workflow:**
   - Click en **"Save"** (arriba a la izquierda)
   - Nombre: **"Solicitud Compra IA"**

2. **Activar workflow:**
   - Click en el toggle **"Activate Workflow"** (arriba a la derecha)
   - Debería mostrar: "Workflow is active"

3. **Copiar Webhook URL:**
   - En el nodo Webhook, verás la URL completa
   - Cópiala para el siguiente paso

---

## 🔗 Paso 6: Conectar con Backend

### 6.1 Actualizar Backend para Disparar n8n

En `server.js`, actualiza el endpoint POST `/api/solicitudes-compra`:

```javascript
app.post('/api/solicitudes-compra', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // 1. Crear solicitud en BD
    const [result] = await connection.query(
      'INSERT INTO solicitudes_compra (usuario_id, descripcion, stock_bajo_producto_id, cantidad_requerida, estado) VALUES (?, ?, ?, ?, ?)',
      [req.body.usuario_id, req.body.descripcion, req.body.producto_id, req.body.cantidad, 'pendiente']
    );

    const solicitud_id = result.insertId;

    // 2. Disparar workflow de n8n
    const solicitud = {
      id: solicitud_id,
      descripcion: req.body.descripcion,
      stock_bajo_producto_id: req.body.producto_id,
      cantidad_requerida: req.body.cantidad
    };

    try {
      await fetch('http://localhost:5678/webhook/solicitud-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitud)
      });
    } catch (err) {
      console.log('⚠️ n8n no disponible, pero solicitud creada:', err.message);
    }

    connection.release();

    res.status(201).json({
      id: solicitud_id,
      mensaje: 'Solicitud creada. n8n está procesando...'
    });
  } catch (error) {
    console.error('Error POST solicitudes-compra:', error.message);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🧪 Paso 7: Testing

### Test 1: Crear Solicitud desde Frontend

1. Abre http://localhost:3000
2. Inicia sesión como admin: admin@tienda.com / admin123
3. Click usuario → **"Solicitar Compra (IA)"**
4. Completa el formulario:
   - Descripción: "Necesitamos 50 camisetas Perú talla M"
   - Producto: Selecciona uno
   - Cantidad: 50
5. Click **"Enviar Solicitud"**

### Test 2: Verificar n8n Ejecutó el Workflow

1. Abre http://localhost:5678
2. Click en el workflow
3. Tab **"Executions"**
4. Deberías ver:
   - ✅ Webhook disparado
   - ✅ Claude API respondió
   - ✅ Orden de compra creada

### Test 3: Verificar Orden en BD

1. Ve a http://localhost:3000/admin.html
2. Tab **"Órdenes de Compra"**
3. Deberías ver la nueva orden con:
   - Proveedor recomendado por Claude
   - Justificación de IA
   - Estado: pendiente

### Test 4: Con cURL

```bash
# Crear solicitud
curl -X POST http://localhost:3000/api/solicitudes-compra \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "descripcion": "Necesitamos zapatillas de fútbol",
    "producto_id": 5,
    "cantidad": 30
  }'

# Ver solicitudes
curl http://localhost:3000/api/solicitudes-compra

# Ver órdenes creadas
curl http://localhost:3000/api/ordenes-compra
```

---

## 🔒 Seguridad

### ⚠️ API Key
- NUNCA compartas tu Claude API Key
- No la commits en Git
- Usa variables de entorno (.env)

### Firewall n8n
- Localmente: Solo accesible desde http://localhost:5678
- En producción: Usa autenticación OAuth

---

## 🐛 Troubleshooting

### Problema: "Webhook no dispara"
**Solución:**
1. Verifica que n8n esté corriendo: http://localhost:5678
2. Verifica que el workflow esté **"Active"**
3. Copia la URL webhook exacta del nodo Webhook
4. Prueba con cURL:
   ```bash
   curl -X POST http://localhost:5678/webhook/solicitud-compra \
     -H "Content-Type: application/json" \
     -d '{"id":1,"descripcion":"test","cantidad":10}'
   ```

### Problema: "Claude API error"
**Solución:**
1. Verifica tu API Key en console.anthropic.com
2. Asegúrate de que sea un modelo válido: `claude-3-5-sonnet-20241022`
3. Revisa los logs de n8n para el error exacto

### Problema: "Orden no se crea en BD"
**Solución:**
1. Verifica que el endpoint `/api/ordenes-compra` exista
2. Revisa los logs del servidor: `tail -f server.log`
3. Asegúrate de que los `proveedor_id` sean válidos (1-5)

---

## 📊 Flujo Completo

```
USUARIO ADMIN
  ↓
Click "Solicitar Compra (IA)"
  ↓
Rellenar formulario
  ↓
POST /api/solicitudes-compra
  ↓
BD: Crear solicitud (estado: pendiente)
  ↓
Webhook dispara n8n automáticamente
  ↓
N8N WORKFLOW:
  ├─ Recibe datos de solicitud
  ├─ POST Claude API con descripción
  ├─ Claude recomienda mejor proveedor
  ├─ POST /api/ordenes-compra (automático)
  ├─ PUT /api/solicitudes-compra (actualiza estado)
  └─ Email al proveedor (opcional)
  ↓
BD: Orden creada (estado: pendiente)
DB: Solicitud actualizada (estado: procesada)
  ↓
Admin ve en panel: Nueva orden con recomendación IA
```

---

## 🎓 Conceptos Clave

### Webhook
Un endpoint que n8n está escuchando. Cuando recibe datos, ejecuta el workflow automáticamente.

### Node (Nodo)
Cada paso en el workflow. Ej: Webhook → HTTP Request → Code → HTTP Request

### HTTP Request
Realiza llamadas a APIs externas (Claude, tu backend, etc.)

### Code Node
Ejecuta JavaScript para procesar datos.

### Variable Interpolation
`{{$json.campo}}` accede a datos de pasos anteriores.

---

## ✅ Checklist Final

- [ ] n8n instalado: `n8n --version`
- [ ] Claude API Key obtenida
- [ ] n8n corriendo en puerto 5678
- [ ] Workflow creado y activado
- [ ] Webhook URL copiada
- [ ] Backend actualizado con llamada a n8n
- [ ] Servidor de tienda corriendo en puerto 3000
- [ ] Test 1: Solicitud creada desde frontend
- [ ] Test 2: Workflow ejecutado en n8n
- [ ] Test 3: Orden creada en BD
- [ ] Test 4: Admin ve orden con recomendación IA

---

## 🎯 Resultado Final

✅ Sistema completamente automatizado:
- Admin crea solicitud
- Claude analiza y recomienda proveedor
- Orden se crea automáticamente
- Email enviado al proveedor
- Todo sin intervención manual

---

**Versión:** 1.0
**Fecha:** 2026-05-12
**Status:** 🚀 LISTO PARA IMPLEMENTAR

