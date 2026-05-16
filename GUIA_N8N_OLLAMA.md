# 🚀 GUÍA: Workflow n8n + Ollama (Sustituyendo Claude API)

**Versión**: 1.0  
**Fecha**: 2026-05-12  
**Objetivo**: Crear el mismo flujo de n8n que tenían con Claude, pero usando **Ollama local** (gratis, sin API keys)

---

## 📋 COMPARACIÓN: Claude API vs Ollama

| Aspecto | Claude API (Antes) | Ollama (Ahora) |
|---------|-------------------|----------------|
| **Costo** | $$$$ (pago por uso) | Gratis (local) |
| **API Key** | Requerida (`sk-ant-...`) | NO requerida |
| **URL** | `https://api.anthropic.com/v1/messages` | `http://localhost:11434/api/generate` |
| **Setup** | Cuenta Anthropic + configuración | YA INSTALADO ✅ |
| **Privacidad** | Datos a Anthropic | 100% local |

---

## ✅ PRE-REQUISITOS

- [ ] **Ollama instalado** → `ollama list | grep smollm2` → debe mostrar `smollm2:1.7b`
- [ ] **Servidor Node.js corriendo** → `npm start` en tienda_mysql
- [ ] **n8n instalado** → `npx n8n start` (lo haremos en este paso)

---

## 🔧 PASO 1: Instalar y Arrancar n8n (5 minutos)

### 1.1 Instalar n8n (si no está)

```bash
cd /home/chorri/Documents/Trash/ll/NE/tienda_mysql
npm install -g n8n
```

### 1.2 Arrancar n8n en una terminal nueva

```bash
# Terminal 2 (dejar corriendo)
npx n8n start
```

Verás:
```
n8n is ready to be used on: http://localhost:5678
```

**Mantén esta terminal abierta** ⚠️

---

## 🎨 PASO 2: Crear el Workflow en n8n (10 minutos)

### 2.1 Acceder a n8n

1. Abre el navegador: **http://localhost:5678**
2. Sign up con cualquier email (ej: `test@tienda.com`)
3. Contraseña: cualquiera
4. Click **"+ New"** → **"Workflow"**

### 2.2 Agregar Nodos (Copiar exactamente)

#### **NODO 1: Webhook (Disparador)**

1. Click en el canvas vacío
2. Search: **"Webhook"**
3. Select: **Webhook**
4. Click en el nodo Webhook y configura:
   - **HTTP Method**: `POST`
   - **Path**: `/solicitud-compra` (exactamente así)
5. Copy el **Webhook URL** completo (algo como: `http://tupc:5678/webhook/solicitud-compra`)
   - **Guárdalo**, lo necesitarás después ⚠️

---

#### **NODO 2: Set (Procesar datos)**

1. Click derecha en el nodo Webhook → **"Connect"** (o arrastra)
2. Click **"Add node"**
3. Search: **"Set"**
4. Select: **Set**
5. Click en el nodo Set y deja **los defaults** (auto-pasa los datos)

---

#### **NODO 3: HTTP Request a Ollama (⭐ IMPORTANTE)**

1. Click derecha en Set → **"Add node"**
2. Search: **"HTTP Request"**
3. Select: **HTTP Request**
4. Click en el nodo HTTP y configura EXACTAMENTE así:

```
Method: POST
URL: http://localhost:11434/api/generate
Authentication: None
Headers tab → agregar:
  - Name: Content-Type
    Value: application/json
Body tab → select "JSON":
```

En el campo **Body**, pega EXACTAMENTE esto:

```json
{
  "model": "smollm2:1.7b",
  "prompt": "Eres un experto en compras. Analiza esta solicitud:\nProducto ID: {{$json.stock_bajo_producto_id}}\nCantidad: {{$json.cantidad_requerida}}\nDescripción: {{$json.descripcion}}\n\nRecomienda el mejor proveedor (1-5) basado en precio y tiempo de entrega.\nResponde SOLO JSON válido sin markdown, sin comillas extras:\n{\"proveedor_recomendado\": X, \"razon\": \"Por qué lo elegiste\", \"confianza\": 85}",
  "stream": false,
  "options": {
    "temperature": 0.1
  }
}
```

---

#### **NODO 4: Parse Respuesta Ollama (Code)**

1. Click derecha en HTTP → **"Add node"**
2. Search: **"Code"**
3. Select: **Code** (node.js)
4. Click en el nodo Code y en el campo de código, pega:

```javascript
// Ollama devuelve la respuesta en $json.response
const text = $json.response;

// Extraer JSON de la respuesta (puede tener markdown)
let jsonText = text;
if (text.includes('```json')) {
  jsonText = text.split('```json')[1].split('```')[0];
} else if (text.includes('{')) {
  jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
}

try {
  const parsed = JSON.parse(jsonText.trim());
  return {
    proveedor_recomendado: parsed.proveedor_recomendado || 1,
    razon: parsed.razon || "Recomendación de Ollama",
    confianza: parsed.confianza || 50,
    solicitud_id: $json.id,
    cantidad_requerida: $json.cantidad_requerida,
    stock_bajo_producto_id: $json.stock_bajo_producto_id
  };
} catch (e) {
  return {
    proveedor_recomendado: 1,
    razon: "Error parsing, default proveedor",
    confianza: 0,
    solicitud_id: $json.id,
    cantidad_requerida: $json.cantidad_requerida,
    stock_bajo_producto_id: $json.stock_bajo_producto_id
  };
}
```

---

#### **NODO 5: Crear Orden (HTTP Request)**

1. Click derecha en Code → **"Add node"**
2. Search: **"HTTP Request"**
3. Select: **HTTP Request**
4. Click en el nodo y configura:

```
Method: POST
URL: http://localhost:3000/api/solicitudes-compra/generar-orden
Authentication: None
Headers:
  - Name: Content-Type
    Value: application/json
Body → JSON:
```

En el campo **Body**:

```json
{
  "solicitud_id": {{$json.solicitud_id}}
}
```

---

#### **NODO 6: Email/Notificación (Opcional)**

Si quieres notificaciones, busca **"Send Email"** y configura. Por ahora lo saltamos.

---

### 2.3 Conectar Webhook en Backend

El servidor ya está configurado automáticamente ✅

Pero verifica que en `/home/chorri/Documents/Trash/ll/NE/tienda_mysql/server.js` línea ~940, exista código que dispara n8n cuando se crea una solicitud:

```javascript
// Busca esto en el POST /api/solicitudes-compra:
(async () => {
  try {
    const n8n_response = await fetch('http://localhost:5678/webhook/solicitud-compra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...})
    });
  } catch (error) {
    // Error handling
  }
})();
```

Si no está, avísame y lo agrego.

---

### 2.4 Guardar y Activar Workflow

1. Click **Save** (arriba izquierda)
2. Nombre: `Solicitud Compra - Ollama`
3. Click el toggle **"Activate Workflow"** (arriba derecha)
4. Debe cambiar a azul y decir "Workflow is active"

---

## 🧪 PASO 3: Testing (5 minutos)

### 3.1 Test Manual con cURL

Abre terminal 3 y ejecuta:

```bash
curl -X POST http://localhost:5678/webhook/solicitud-compra \
  -H "Content-Type: application/json" \
  -d '{
    "id": 999,
    "descripcion": "Necesitamos 50 camisetas Perú M urgente",
    "stock_bajo_producto_id": 1,
    "cantidad_requerida": 50,
    "usuario_id": 1
  }'
```

**Resultado esperado**: Response JSON indicando que se procesó

### 3.2 Test desde el Frontend

1. Abre: **http://localhost:3000**
2. Login: `admin@tienda.com` / `admin123`
3. Click el botón **"Solicitar Compra (IA)"**
4. Completa:
   - Descripción: `Necesitamos 30 camisetas Argentina talla L, stock bajo`
   - Producto: selecciona cualquiera
   - Cantidad: `30`
5. Click **"Enviar Solicitud"**

### 3.3 Verificar Ejecución en n8n

1. En n8n (http://localhost:5678)
2. Click en el nombre del workflow: `Solicitud Compra - Ollama`
3. Tab **"Executions"** (abajo)
4. Debe haber una ejecución reciente (verde = éxito, rojo = error)

---

## 📊 FLUJO FINAL

```
Usuario en Frontend
  ↓ Click "Solicitar Compra (IA)"
  ↓ Completa formulario
Servidor Node.js (3000)
  ↓ POST /api/solicitudes-compra
  ↓ Dispara webhook n8n
n8n (5678)
  ↓ Recibe en Webhook
  ↓ HTTP POST a Ollama (11434)
Ollama
  ↓ Analiza solicitud con IA
  ↓ Retorna JSON con recomendación
n8n
  ↓ Parsea respuesta
  ↓ HTTP POST a /api/solicitudes-compra/generar-orden
Servidor Node.js
  ↓ Crea orden en BD
✅ ORDEN CREADA
```

---

## 🐛 DEBUGGING (Si algo no funciona)

### Problema: "Webhook no recibe datos"

1. Verifica que n8n esté corriendo: `ps aux | grep n8n`
2. Verifica que el workflow esté **Activado** (toggle azul)
3. En n8n, el nodo Webhook debe mostrar su URL

### Problema: "Error en Ollama node"

1. Verifica que Ollama esté corriendo: `ollama list`
2. Prueba Ollama directamente:
   ```bash
   curl http://localhost:11434/api/generate -X POST \
     -H "Content-Type: application/json" \
     -d '{"model":"smollm2:1.7b","prompt":"Hola","stream":false}'
   ```

### Problema: "Error al crear orden"

1. Verifica que el servidor esté corriendo: `ps aux | grep "node server"`
2. Revisa logs: `tail -f server.log`
3. Verifica que la BD tenga datos de proveedores: 
   ```bash
   mysql -u root -p080100 tienda_online -e "SELECT * FROM proveedores LIMIT 3;"
   ```

### Ver Logs Detallados

**Terminal donde corre n8n:**
- Puedes ver errores en tiempo real

**Terminal donde corre Node.js:**
- `tail -f server.log`

---

## 📝 RESUMEN DE LO QUE HACE n8n

1. **Webhook**: Escucha cuando se crea solicitud
2. **Set**: Prepara los datos
3. **HTTP to Ollama**: Envía a modelo local para análisis
4. **Code**: Parsea la respuesta JSON
5. **HTTP to Backend**: Crea la orden automáticamente

**TODO SIN PAGAR** ✅

---

## 💡 TIPS

- **Ollama tarda 2-4 segundos**: Es normal, está procesando IA localmente
- **Si Ollama responde lentamente**: Verifica RAM disponible (`free -h`)
- **Para debugging**: En cada nodo hay un botón "Test" que ejecuta con datos ficticios
- **Logs completos**: En n8n, "Executions" muestra cada paso y errores

---

## ✅ CHECKLIST FINAL

- [ ] Ollama corriendo con modelo `smollm2:1.7b`
- [ ] Servidor Node.js corriendo en puerto 3000
- [ ] n8n corriendo en puerto 5678
- [ ] Workflow creado con 5 nodos
- [ ] Workflow **ACTIVADO** (toggle azul)
- [ ] Test cURL funciona
- [ ] Test desde frontend funciona
- [ ] Orden creada en BD

---

## 🚀 SIGUIENTE PASO

Una vez que TÚ crees el workflow siguiendo estos pasos, avísame y:

1. **Probaré** que todo funcione end-to-end
2. **Documentaré** todo lo que sucedió
3. **Crearemos** el documento final: `IMPLEMENTACION_OLLAMA_COMPLETADA.md`

---

**¿DUDAS?**

- Para cualquier paso, avísame el número (ej: "stuck en paso 2.2")
- Puedo ajustar el JSON del Body si Ollama no responde bien
- Podemos agregar más nodos (email, SMS, etc.) después

---

**Status**: 🟢 **LISTO PARA QUE TÚ CREES EL WORKFLOW**

Cuando termines, escribe: **"Workflow creado en n8n, listo para testing"**
