# ✅ VERIFICACIÓN - n8n + Claude API

## 🔍 Checklist de Configuración

### ✅ Backend (server.js)

Verificar que el endpoint POST /api/solicitudes-compra tenga:
- ✅ Código que dispara webhook de n8n automáticamente
- ✅ Endpoint PUT /api/solicitudes-compra/:id para actualizar estado

**Comando para verificar:**
```bash
grep -n "n8n webhook" server.js
```

Resultado esperado:
```
✅ n8n webhook disparado para solicitud:
```

---

### ✅ n8n Workflow

Verificar que tu workflow tenga estos 5 nodos:

1. **Webhook** - Path: `/solicitud-compra` ✅
2. **Set** - Procesa datos ✅
3. **HTTP Request** (Claude API) - URL: `https://api.anthropic.com/v1/messages` ✅
4. **Code** - Extrae JSON de respuesta ✅
5. **HTTP Request** (Crear Orden) - URL: `http://localhost:3000/api/ordenes-compra` ✅

**Para verificar:**
- Abre http://localhost:5678
- Entra a tu workflow "Solicitud Compra IA"
- Verifica que el toggle diga "Workflow is active" ✅
- Copia la URL del webhook (nodo 1) - la necesitarás para pruebas

---

## 🧪 TEST 1: Probar Webhook Directamente

**Abrir terminal y ejecutar:**

```bash
curl -X POST http://localhost:5678/webhook/solicitud-compra \
  -H "Content-Type: application/json" \
  -d '{
    "id": 999,
    "descripcion": "Test webhook",
    "stock_bajo_producto_id": 1,
    "cantidad_requerida": 50
  }'
```

**Resultado esperado:**
- HTTP 200 OK
- n8n ejecuta el workflow (puedes verlo en Executions tab)

**Si no funciona:**
- Verifica que n8n esté corriendo: `ps aux | grep n8n`
- Verifica que el path sea exacto: `/solicitud-compra`
- Verifica que el workflow esté **Active**

---

## 🧪 TEST 2: Crear Solicitud desde Frontend

1. Abre http://localhost:3000
2. Inicia sesión: `admin@tienda.com` / `admin123`
3. Click usuario → **"Solicitar Compra (IA)"**
4. Completa:
   - **Descripción:** "Necesitamos 75 camisetas Italia S/M"
   - **Producto:** Selecciona uno (ej: Camiseta Italia 2024)
   - **Cantidad:** 75
5. Click **"Enviar Solicitud"**

**Resultado esperado:**

✅ **En n8n:**
- Abre http://localhost:5678
- Click en workflow "Solicitud Compra IA"
- Tab **"Executions"**
- Deberías ver ejecución exitosa con:
  - ✅ Webhook recibió datos
  - ✅ Claude API respondió
  - ✅ Orden de compra creada

✅ **En Frontend:**
- Notificación: "Solicitud creada"
- Ver en "Mis Solicitudes" (admin): estado "pendiente"

✅ **En BD:**
- Nueva orden en tabla `ordenes_compra`
- Solicitud actualizada con estado "procesada"

---

## 🧪 TEST 3: Verificar Orden Creada

**URL Admin Panel:**
```
http://localhost:3000/admin.html
```

**Buscar en pestaña "Órdenes de Compra":**
- Nueva orden con:
  - ✅ Proveedor recomendado (1-5)
  - ✅ Justificación de IA en la descripción
  - ✅ Estado: "pendiente"
  - ✅ Cantidad correcta

---

## 🧪 TEST 4: Ver Logs de n8n

**En http://localhost:5678:**

1. Click en workflow "Solicitud Compra IA"
2. Tab **"Executions"**
3. Click en la ejecución más reciente
4. Deberías ver en cada nodo:
   - ✅ **Webhook:** Datos recibidos
   - ✅ **Set:** Datos procesados
   - ✅ **HTTP (Claude):** Response con JSON de Claude
   - ✅ **Code:** JSON parseado correctamente
   - ✅ **HTTP (Orden):** Orden creada exitosamente

**Si hay error en algún nodo:**
- Click en el nodo
- Verás el error exacto
- Arregla el código/configuración
- Prueba de nuevo (botón play)

---

## 🐛 Debugging - Problemas Comunes

### Problema: "Webhook no dispara"

**Soluciones:**
1. ¿n8n está corriendo?
   ```bash
   ps aux | grep n8n
   ```

2. ¿Workflow está activo?
   - Abre http://localhost:5678
   - Tab Workflows
   - Verifica toggle azul

3. ¿Path del webhook es correcto?
   - Nodo Webhook → Settings
   - Path debe ser: `/solicitud-compra`
   - URL completa: `http://localhost:5678/webhook/solicitud-compra`

4. Prueba manual:
   ```bash
   curl -X POST http://localhost:5678/webhook/solicitud-compra \
     -H "Content-Type: application/json" \
     -d '{"id":1,"descripcion":"test"}'
   ```

---

### Problema: "Claude API error"

**Soluciones:**
1. ¿API Key es correcta?
   - Abre nodo HTTP (Claude)
   - Header: `x-api-key`
   - Value: Tu API Key completa (sk-ant-...)

2. ¿Modelo correcto?
   - Body → messages
   - model: `claude-3-5-sonnet-20241022`

3. ¿Headers correctos?
   - `x-api-key`: Tu key
   - `anthropic-version`: `2023-06-01`

4. Prueba con cURL:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: sk-ant-..." \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
   ```

---

### Problema: "Orden no se crea en BD"

**Soluciones:**
1. ¿Endpoint existe?
   ```bash
   curl http://localhost:3000/api/ordenes-compra
   ```
   Debería retornar un array (vacío o con órdenes)

2. ¿Datos correctos en nodo HTTP (Orden)?
   - Body JSON válido
   - Todos los campos requeridos presentes

3. Revisa logs del servidor:
   ```bash
   tail -f server.log | grep "ordenes"
   ```

4. ¿Proveedor existe?
   - proveedor_id debe ser 1-5
   - Verifica en `/api/proveedores`

---

### Problema: "JSON Parse error en Code node"

**Soluciones:**
1. La respuesta de Claude a veces tiene texto extra
2. El código usa regex para extraer JSON: `{[\s\S]*}`
3. Verifica en Executions:
   - Mira exactamente qué retornó Claude
   - Asegúrate de que tenga `{...}` formato JSON

4. Prueba el código en el nodo:
   ```javascript
   const response = $json.body.content[0].text;
   console.log("Raw response:", response);
   const jsonMatch = response.match(/\{[\s\S]*\}/);
   console.log("Matched JSON:", jsonMatch);
   const rec = JSON.parse(jsonMatch[0]);
   return rec;
   ```

---

## ✅ Flujo Esperado Paso a Paso

```
1. Admin crea solicitud en frontend
   ↓
2. POST /api/solicitudes-compra creado
   ↓
3. Backend dispara webhook a n8n
   ↓
4. n8n recibe en Webhook node
   ↓
5. Set node procesa datos
   ↓
6. HTTP node envía a Claude API
   ↓
7. Claude responde con JSON (proveedor recomendado)
   ↓
8. Code node parsea respuesta
   ↓
9. HTTP node crea orden en /api/ordenes-compra
   ↓
10. Orden aparece en admin panel ✅
```

---

## 📊 Comando Master para Testear Todo

```bash
# Test 1: ¿Servidor corriendo?
curl -s http://localhost:3000/api/productos | head -c 50

# Test 2: ¿n8n corriendo?
curl -s http://localhost:5678 | grep "n8n" | head -1

# Test 3: ¿Webhook responde?
curl -X POST http://localhost:5678/webhook/solicitud-compra \
  -H "Content-Type: application/json" \
  -d '{"id":1,"descripcion":"test"}'

# Test 4: ¿Órdenes endpoint existe?
curl -s http://localhost:3000/api/ordenes-compra | head -c 50

echo ""
echo "✅ Si ves respuestas en los 4 tests, todo está conectado"
```

---

## 🎯 Resumen

| Componente | Estado | Ubicación |
|-----------|--------|-----------|
| **Servidor Tienda** | ✅ 3000 | http://localhost:3000 |
| **n8n** | ✅ 5678 | http://localhost:5678 |
| **Webhook** | ✅ | POST /webhook/solicitud-compra |
| **Claude API** | ✅ | Configurada en nodo HTTP |
| **Orden Creación** | ✅ | POST /api/ordenes-compra |

---

## 🚀 Próximo Paso

Cuando TODO esté verificado ✅, haz un test completo:

1. Frontend → Crea solicitud
2. n8n → Procesa automáticamente
3. Admin Panel → Ve la orden creada

¡Listo para producción! 🎉

---

**Última actualización:** 2026-05-12
**Estado:** Verificación Completada

