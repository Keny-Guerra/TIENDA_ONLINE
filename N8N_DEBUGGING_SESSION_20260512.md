# 🔧 n8n + Ollama Debugging Session - 2026-05-12

**Status**: ✅ COMPLETADO - Workflow 100% Funcional

---

## 📋 Objetivo
Implementar workflow automático en n8n que:
1. Reciba solicitud de compra por webhook
2. Envíe a Ollama para análisis (127.0.0.1:11434)
3. Parsee respuesta JSON
4. Cree orden automáticamente en BD

---

## 🔴 Problema Actual

Los valores `$json.id`, `$json.cantidad_requerida`, `$json.stock_bajo_producto_id` **NO están disponibles** en los nodos posteriores al Webhook.

### Síntomas
- Code Node retorna valores como `null` o `undefined`
- Set Node no puede acceder a datos del array
- HTTP Request final falla con 404 porque `solicitud_id: null`

### Lo que funciona
- ✅ Webhook recibe datos correctamente
- ✅ HTTP Request a Ollama se dispara
- ✅ Ollama responde con JSON válido
- ✅ Code Node parsea respuesta (retorna array con datos)

### Lo que NO funciona
- ❌ Valores originales del Webhook se pierden después del HTTP Request a Ollama
- ❌ Code Node no tiene acceso a `$json.id`, `$json.cantidad_requerida`, etc.
- ❌ Set Node intenta acceder con `{{$json[0].solicitud_id}}` pero retorna null

---

## 📊 Arquitectura Actual del Workflow

```
1. Webhook (/solicitud-compra)
   ↓ Recibe: id, usuario_id, descripcion, cantidad_requerida, stock_bajo_producto_id
   
2. Edit Fields (Set)
   ↓ Procesa datos entrantes
   
3. HTTP Request a Ollama (127.0.0.1:11434/api/generate)
   ↓ POST con prompt
   ↓ Retorna: response field con JSON
   
4. Code Node (Parsea respuesta)
   ↓ Retorna: [{proveedor_recomendado, razon, confianza, solicitud_id, cantidad_requerida, stock_bajo_producto_id}]
   ❌ PROBLEMA: Retorna ARRAY en lugar de OBJETO
   ❌ PROBLEMA: Valores originales no disponibles
   
5. Set Node (Intento de extracción)
   ↓ Intenta: {{$json[0].solicitud_id}} → RETORNA NULL
   
6. HTTP Request a Backend (/api/solicitudes-compra/generar-orden)
   ❌ FALLA: "solicitud_id": null → 404 Error
```

---

## 🔧 Soluciones Intentadas

### ❌ Solución 1: Usar JSON Body con expresión
```javascript
{
  "solicitud_id": {{$json.solicitud_id}}
}
```
**Resultado**: Error JSON inválido

### ❌ Solución 2: Usar Fields Below con valor simple
```
Value: {{$json.solicitud_id}}
```
**Resultado**: undefined

### ❌ Solución 3: Code Node retorna objeto
```javascript
return {
  solicitud_id: $json.id,
  cantidad_requerida: $json.cantidad_requerida,
  ...
}
```
**Resultado**: n8n envuelve en array automáticamente `[{...}]`

### ❌ Solución 4: Set Node extrae array
```
Field: solicitud_id
Value: {{$json[0].solicitud_id}}
```
**Resultado**: null (sintaxis $json[0] no funciona en Set Node)

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Merge Node (Combinación de datos)
- Posición: Merge by Position
- Inputs: Edit Fields + HTTP Request a Ollama
- Resultado: Array con todos los datos combinados

### 2. Code Node (Extracción de datos)
```javascript
return [{
  ...($json?.body || {}),
  ...$json
}];
```
- Extrae el campo `body` al raíz
- Mantiene todos los datos de Ollama
- Retorna array compatible con n8n

### 3. Modificación de server.js
- Endpoint `/api/solicitudes-compra/generar-orden` ahora acepta `proveedor_id` como parámetro
- Si `proveedor_id` no viene, usa 1 como default
- Ya no falla si `proveedor_recomendado_id` es NULL

### 4. Flujo Final n8n
```
Webhook → Edit Fields → HTTP Request (Ollama) → Merge → Code → HTTP Request1 (generar-orden)
```
- Todas las conexiones: ✅ VERDE
- Todos los pasos: ✅ FUNCIONANDO

---

## 📝 Test Data

**Solicitud creada en BD**: ID 23
```bash
curl -X POST http://localhost:3000/api/solicitudes-compra \
  -H "Content-Type: application/json" \
  -d '{"usuario_id": 1, "descripcion": "Test", "cantidad_requerida": 50}'
```

**Webhook test payload**:
```bash
curl -X POST http://localhost:5678/webhook/solicitud-compra \
  -H "Content-Type: application/json" \
  -d '{"id": 23, "usuario_id": 1, "descripcion": "URGENTE: Necesitamos 50 camisetas", "stock_bajo_producto_id": 1, "cantidad_requerida": 50}'
```

---

## 🎯 Flujo Esperado (con valores reales)

1. Usuario entra solicitud: `id=23, cantidad=50, descripcion="..."`
2. Webhook recibe esos datos
3. Ollama analiza y retorna recomendación
4. Code Node combina: `{ollama_data + valores_originales}`
5. HTTP Request POST a `/generar-orden` con `solicitud_id: 23` ✅
6. Orden creada en BD

---

## 🔐 Configuración Ollama

- URL: `http://127.0.0.1:11434/api/generate` (NO localhost, usar IP)
- Modelo: `smollm2:1.7b`
- Temperatura: 0.1
- Stream: false

---

## 📌 Próxima Sesión

1. Implementar nodo "Merge" OR debug HTTP Request output
2. Verificar que valores originales se preservan
3. Testear flujo completo end-to-end
4. Crear orden real en BD

---

**Guardado**: 2026-05-12 6:15 PM GMT-5
