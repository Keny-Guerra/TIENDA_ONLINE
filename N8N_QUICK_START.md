# ⚡ INICIO RÁPIDO - n8n + Claude

## 🔑 Paso 1: Obtener Claude API Key (5 min)

1. Ve a: https://console.anthropic.com/
2. Inicia sesión / Crea cuenta
3. Ve a **API Keys** (menú izquierdo)
4. Click **"Create Key"**
5. Dale nombre: `n8n-workflow`
6. Copia la key (empieza con `sk-ant-`)
7. **Guárdala en bloc de notas** ⚠️

---

## 🚀 Paso 2: Iniciar Sistemas (1 min)

Abre una terminal y corre:

```bash
cd /home/chorri/Documents/Trash/ll/NE/tienda_mysql
bash start-n8n.sh
```

O manualmente en 2 terminales separadas:

**Terminal 1:**
```bash
cd /home/chorri/Documents/Trash/ll/NE/tienda_mysql
npm start
```

**Terminal 2:**
```bash
cd /home/chorri/Documents/Trash/ll/NE/tienda_mysql
npx n8n start
```

Verás:
```
✅ Tienda en http://localhost:3000
✅ n8n en http://localhost:5678
```

---

## 🎨 Paso 3: Crear Workflow (10 min)

### 3.1 Acceder a n8n
- Abre: http://localhost:5678
- Sign up con email
- Click **"+ New"** → **"Workflow"**

### 3.2 Agregar Nodos (copiar el workflow)

**Nodo 1: Webhook (Trigger)**
- Search: "Webhook"
- Select: **Webhook**
- Settings:
  - HTTP Method: **POST**
  - Path: **/solicitud-compra**
  - Copy the full URL (necesitarás después)

**Nodo 2: Set (Procesar)**
- Click derecha Webhook → Connect → Add Node
- Search: "Set"
- Keep defaults (usará incoming data)

**Nodo 3: Claude API**
- Click derecha Set → Add Node
- Search: "HTTP Request"
- Settings:
  - Method: **POST**
  - URL: `https://api.anthropic.com/v1/messages`
  - Auth Type: **Header Auth**
    - Header: `x-api-key`
    - Value: **TU CLAUDE API KEY** (pégala aquí)
  - Headers tab → Add:
    - Name: `anthropic-version`
    - Value: `2023-06-01`
  
  - Body (JSON):
  ```json
  {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Producto {{$json.stock_bajo_producto_id}}, Cantidad: {{$json.cantidad_requerida}}. Recomienda proveedor (1-5) basado en precio y tiempo entrega. Responde SOLO JSON: {\"proveedor_id\": X, \"razon\": \"...\"}"
      }
    ]
  }
  ```

**Nodo 4: Parse Claude Response**
- Click derecha HTTP → Add Node
- Search: "Code"
- Code:
  ```javascript
  const response = $json.body.content[0].text;
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  const rec = JSON.parse(jsonMatch[0]);
  return {
    proveedor_id: rec.proveedor_id,
    razon: rec.razon,
    solicitud_id: $json.id
  };
  ```

**Nodo 5: Create Order**
- Click derecha Code → Add Node
- Search: "HTTP Request"
- Settings:
  - Method: **POST**
  - URL: `http://localhost:3000/api/ordenes-compra`
  - Body (JSON):
  ```json
  {
    "solicitud_id": {{$json.solicitud_id}},
    "proveedor_id": {{$json.proveedor_id}},
    "producto_id": {{$json.stock_bajo_producto_id}},
    "cantidad": {{$json.cantidad_requerida}},
    "precio_unitario": 100,
    "estado": "pendiente",
    "respuesta_ia_justificacion": "{{$json.razon}}"
  }
  ```

### 3.3 Guardar y Activar

- Click **Save** (arriba izquierda)
- Nombre: `Solicitud Compra IA`
- Click **Activate Workflow** (toggle arriba derecha)
- ✅ Debería decir "Workflow is active"

---

## 🔗 Paso 4: Conectar Backend (2 min)

El servidor ya está configurado ✅ 

Pero verifica que en `server.js` está el código para disparar n8n:

```javascript
// En POST /api/solicitudes-compra, después de crear la solicitud:
try {
  await fetch('http://localhost:5678/webhook/solicitud-compra', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: solicitud_id,
      descripcion: req.body.descripcion,
      stock_bajo_producto_id: req.body.producto_id,
      cantidad_requerida: req.body.cantidad
    })
  });
} catch (err) {
  console.log('⚠️ n8n no disponible');
}
```

---

## 🧪 Paso 5: Probar (2 min)

### Test desde Frontend:

1. Abre: http://localhost:3000
2. Login: `admin@tienda.com` / `admin123`
3. Click usuario → **"Solicitar Compra (IA)"**
4. Completa:
   - Descripción: "Necesitamos 100 camisetas Perú M"
   - Producto: Cualquiera
   - Cantidad: 100
5. Click **"Enviar Solicitud"**

### Resultado Esperado:

1. **n8n** (http://localhost:5678) debe mostrar execution exitosa
2. **BD** debe tener nueva orden con recomendación IA
3. **Admin Panel** (http://localhost:3000/admin.html) debe mostrar la orden

---

## 🐛 Debugging

### Si no funciona, revisa:

1. **¿n8n está corriendo?**
   ```bash
   ps aux | grep n8n
   ```

2. **¿Workflow está activado?**
   - Abre http://localhost:5678
   - Tab "Workflows"
   - Verifica que tenga toggle azul (active)

3. **¿Webhook URL es correcta?**
   - En n8n, nodo Webhook
   - Copia URL completa
   - Prueba con cURL:
   ```bash
   curl -X POST http://localhost:5678/webhook/solicitud-compra \
     -H "Content-Type: application/json" \
     -d '{"id":1,"descripcion":"test","cantidad":10}'
   ```

4. **¿API Key funciona?**
   - Abre n8n HTTP node (Claude)
   - Verifica que `x-api-key` tenga tu key
   - Prueba la request (play button)

5. **¿Logs del servidor?**
   ```bash
   tail -f server.log
   ```

---

## 📊 Resultado Final

✅ Flujo completamente automatizado:

```
Admin: "Solicitar Compra"
  ↓
Backend dispara n8n
  ↓
Claude analiza automáticamente
  ↓
Orden creada automáticamente
  ↓
Admin ve: "Orden creada por IA"
```

---

## 💡 Tips

- **Prueba sin Claude:** En nodo Code, retorna un `proveedor_id` fijo para verificar que el flujo funciona
- **Logs n8n:** Tab "Executions" muestra cada ejecución y errores
- **API Key:** Si error de autenticación, verifica en console.anthropic.com que la key sea válida
- **JSON válido:** Claude a veces responde con texto extra, por eso usamos regex `{[\s\S]*}`

---

## 🆘 Contacto / Ayuda

Si algo no funciona:
1. Lee los logs de n8n (Executions tab)
2. Verifica errores en consola del navegador (F12)
3. Revisa `server.log` del backend
4. Asegúrate que los puertos 3000, 5678 estén libres

---

**Estado:** ✅ Listo para implementar
**Tiempo Total:** ~20 minutos

