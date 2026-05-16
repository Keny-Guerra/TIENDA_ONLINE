# Implementar Prompts en n8n

Estos son los prompts exactos que vas a poner en los nodos HTTP Request de n8n.

---

## Prompt 1 — Interpretar solicitud de compra

En el Body del nodo HTTP Request a Ollama (`http://localhost:11434/api/generate`):

```json
{
  "model": "smollm2:1.7b",
  "prompt": "Eres un experto en compras. Analiza esta solicitud y extrae los datos.\n\nSOLICITUD:\nDescripcion: {{$json.descripcion}}\nCantidad: {{$json.cantidad_requerida}}\nProducto ID: {{$json.stock_bajo_producto_id}}\n\nExtrae estos campos y responde SOLO JSON sin markdown:\n{\"producto_nombre\": \"...\", \"cantidad\": 0, \"urgencia\": \"alta|media|baja\", \"comentarios\": \"...\"}",
  "stream": false,
  "options": { "temperature": 0.1 }
}
```

---

## Prompt 2 — Clasificar requerimiento

```json
{
  "model": "smollm2:1.7b",
  "prompt": "Clasifica esta solicitud de compra.\n\nSOLICITUD:\nDescripcion: {{$json.descripcion}}\nProducto: {{$json.producto_nombre}}\nCantidad: {{$json.cantidad}}\n\nResponde SOLO JSON sin markdown:\n{\"tipo\": \"reposicion_stock|emergencia|planificada\", \"urgencia\": \"critica|alta|media|baja\", \"prioridad\": 8, \"requiere_aprobacion\": false}",
  "stream": false,
  "options": { "temperature": 0.1 }
}
```

---

## Prompt 3 — Recomendar proveedor

```json
{
  "model": "smollm2:1.7b",
  "prompt": "Eres un experto en seleccion de proveedores. Elige el mejor para esta solicitud.\n\nSOLICITUD:\nProducto: {{$json.producto_nombre}}\nCantidad: {{$json.cantidad}}\nUrgencia: {{$json.urgencia}}\n\nPROVEEDORES:\n1. TextilPeru S.A. - precio bajo, entrega 3-5 dias\n2. SportGear China - precio medio, entrega 5-7 dias\n3. Confecciones Brasil - precio medio, entrega 4-6 dias\n4. Adidas Direct - precio alto, entrega 2-3 dias\n5. Nike Distribution - precio alto, entrega 1-2 dias\n\nRegla: urgencia critica o alta = prioriza entrega rapida. urgencia baja = prioriza precio.\n\nResponde SOLO JSON sin markdown:\n{\"proveedor_recomendado\": 1, \"razon\": \"...\", \"confianza\": 85}",
  "stream": false,
  "options": { "temperature": 0.1 }
}
```

---

## Prompt 4 — Generar orden de compra

```json
{
  "model": "smollm2:1.7b",
  "prompt": "Genera una orden de compra con estos datos.\n\nDATOS:\nSolicitud ID: {{$json.solicitud_id}}\nProducto: {{$json.producto_nombre}}\nCantidad: {{$json.cantidad}}\nProveedor ID: {{$json.proveedor_recomendado}}\nUrgencia: {{$json.urgencia}}\n\nResponde SOLO JSON sin markdown:\n{\"solicitud_id\": 0, \"proveedor_id\": 1, \"cantidad\": 0, \"notas\": \"resumen en 1 linea\", \"prioridad\": \"urgente|normal|baja\"}",
  "stream": false,
  "options": { "temperature": 0.1 }
}
```

---

## Code Node (va después de CADA prompt para limpiar la respuesta)

Este mismo código va en los 4 nodos Code que parsean la respuesta de Ollama:

```javascript
const text = $json.response;

// Extraer el JSON de la respuesta (Ollama a veces agrega texto extra)
let jsonText = text;
if (text.includes('```json')) {
  jsonText = text.split('```json')[1].split('```')[0];
} else if (text.includes('{')) {
  jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
}

try {
  const parsed = JSON.parse(jsonText.trim());
  return { ...parsed, solicitud_id: $json.id || $json.solicitud_id };
} catch (e) {
  return {
    error: "No se pudo parsear",
    solicitud_id: $json.id,
    proveedor_recomendado: 1,
    urgencia: "media"
  };
}
```

---

## Flujo en n8n

```
Webhook → [Prompt 1 + Code] → [Prompt 2 + Code] → [Prompt 3 + Code] → [Prompt 4 + Code] → POST /api/solicitudes-compra/generar-orden
```

El último nodo HTTP Request al backend:
- **URL**: `http://localhost:3000/api/solicitudes-compra/generar-orden`
- **Method**: POST
- **Body**: `{ "solicitud_id": {{$json.solicitud_id}} }`
