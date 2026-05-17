#!/bin/bash
# Test del workflow n8n de 4 prompts
# Uso: ./test_workflow.sh <WEBHOOK_URL>
# Ejemplo: ./test_workflow.sh http://localhost:5678/webhook/solicitud-compra

WEBHOOK_URL="${1:-http://localhost:5678/webhook/solicitud-compra}"

echo "=== PASO 1: Crear solicitud de compra ==="
SOLICITUD=$(curl -s -X POST http://localhost:3000/api/solicitudes-compra \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 3,
    "descripcion": "Necesitamos 25 camisetas Brasil talla M urgente para stock critico",
    "cantidad_requerida": 25,
    "stock_bajo_producto_id": 1
  }')

echo "$SOLICITUD"
SOLICITUD_ID=$(echo "$SOLICITUD" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$SOLICITUD_ID" ]; then
  echo "ERROR: No se pudo crear la solicitud"
  exit 1
fi

echo ""
echo "=== PASO 2: Enviar al webhook n8n (solicitud_id=$SOLICITUD_ID) ==="
echo "URL: $WEBHOOK_URL"
echo ""

RESULTADO=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"solicitud_id\": $SOLICITUD_ID,
    \"descripcion\": \"Necesitamos 25 camisetas Brasil talla M urgente para stock critico\",
    \"cantidad_requerida\": 25,
    \"stock_bajo_producto_id\": 1
  }")

echo "Respuesta del workflow:"
echo "$RESULTADO" | python3 -m json.tool 2>/dev/null || echo "$RESULTADO"

echo ""
echo "=== PASO 3: Verificar resultado en el backend ==="
sleep 2
curl -s "http://localhost:3000/api/solicitudes-compra" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for s in data:
    if s['id'] == $SOLICITUD_ID:
        print('Solicitud ID:', s['id'])
        print('Estado:', s['estado'])
        print('Orden ID:', s.get('orden_compra_id'))
        print('Proveedor:', s.get('proveedor_nombre'))
        break
"

echo ""
echo "=== PASO 4: Ver última orden creada ==="
curl -s "http://localhost:3000/api/ordenes-compra" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data:
    o = data[0]
    print('Orden #' + str(o.get('id', '?')))
    print('Proveedor:', o.get('proveedor_nombre', '?'))
    print('Producto:', o.get('producto_nombre', '?'))
    print('Cantidad:', o.get('cantidad', '?'))
    print('Estado:', o.get('estado', '?'))
else:
    print('Sin ordenes aun')
"
