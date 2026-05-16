# 🧪 GUÍA DE TESTING - FASES 3, 4 Y 5

## Inicio Rápido

```bash
cd /home/chorri/Documents/Trash/ll/NE/tienda_mysql
npm start
```

Luego abre: **http://localhost:3000**

---

## ✅ TEST 1: Carrito Persistente (FASE 3)

### Test de Persistencia Local

1. **Abrir la tienda**
   - Abre http://localhost:3000
   - Abre DevTools (F12)
   - Ve a Console

2. **Verificar sesionId**
   ```
   Deberías ver: "Sesión ID: ses_XXXXXXXX"
   ```

3. **Agregar al carrito sin registrarte**
   - Encuentra un producto
   - Click en producto → "Agregar al Carrito"
   - Verás: "✓ {Producto} agregado al carrito"

4. **Verificar sincronización**
   - En DevTools Console:
   ```javascript
   console.log(carrito);
   // Debe mostrar: Array con [{ id: X, nombre: "...", cantidad: Y }]
   ```

5. **Verificar en BD**
   ```bash
   mysql -u root -p080100 tienda_online
   SELECT * FROM carrito WHERE sesion_id = 'ses_XXXXXXXX';
   ```

6. **Test de Persistencia**
   - Cierra el navegador completamente
   - Reabre http://localhost:3000
   - **ESPERADO**: El carrito sigue ahí

---

## ✅ TEST 2: Operaciones de Carrito

### Agregar Múltiples Productos

1. Agrega 3 productos diferentes
2. El contador debe mostrar: 3

3. Haz click en cada producto:
   - Deberías ver la cantidad incrementarse
   - O crear un nuevo item

### Modificar Cantidades

1. Click en producto en el carrito
2. Usa botones +/- para cambiar cantidad
3. El total se actualiza en tiempo real

### Eliminar del Carrito

1. Click en icono de basura (🗑️) en item
2. Verás: "✗ {Producto} eliminado del carrito"
3. El item desaparece

---

## ✅ TEST 3: Pedidos (FASE 4)

### Flujo de Compra Completo

1. **Agregar productos al carrito**
   - Mínimo 1 producto
   - Total debe ser > 0

2. **Iniciar sesión/Registrarse**
   - Click en usuario (arriba derecha)
   - Click en "Iniciar Sesión" o "Registrarse"

3. **Registrar nuevo usuario**
   ```
   Nombres: Juan
   Apellidos: Pérez
   Email: juan@example.com
   Teléfono: 999 999 999
   Contraseña: password123
   Confirmar: password123
   ✓ Aceptar términos
   ```
   - Click en "Registrarse"

4. **Procesar pago**
   - Carrito visible en sidebar
   - Click en "Procesar Pago"
   - Se abre modal de pago (3 pasos)

5. **Step 1: Resumen**
   - Verifica items y total
   - Click en "Continuar"

6. **Step 2: Método de Pago**
   - Selecciona "Tarjeta de Crédito" (o cualquiera)
   - Click en "Continuar"

7. **Step 3: Confirmación**
   - Se crea el pedido automáticamente
   - Verás código: GOL-{numero}
   - Total y método confirmado
   - **ESPERADO**: Notificación "¡Pago realizado!"

### Verificar Pedido en BD

```bash
mysql -u root -p080100 tienda_online
SELECT * FROM pedidos WHERE cliente_email = 'juan@example.com';
```

Deberías ver:
- id: auto-incrementado
- cliente_nombre: Juan Pérez
- cliente_email: juan@example.com
- total: suma de productos
- estado: confirmado
- fecha_entrega_estimada: hoy + 5 días

### Ver Mis Pedidos

1. Usuario registrado → Click en usuario
2. Click en "📦 Mis Pedidos"
3. Se carga página con todos tus pedidos
4. Verás:
   - Número de pedido
   - Estado actual
   - Total
   - Fecha entrega estimada

---

## ✅ TEST 4: Reportes (FASE 5)

### Generar Reportes

1. **Crear algunos pedidos primero**
   - Realiza 2-3 compras diferentes
   - Cambia usuario entre compras

2. **Acceder a reportes**
   - Usuario registrado → Click en usuario
   - Click en "📊 Reportes"

3. **Verificar contenido**
   - Deberías ver tarjeta con:
     - 💰 Ventas totales (suma de todos)
     - Total de pedidos (cantidad)
     - Ticket promedio
   - Top 10 productos (si hay compras)
   - Tabla de proveedores

### API de Reportes

```bash
# Ventas totales
curl http://localhost:3000/api/reportes/ventas

# Top productos
curl http://localhost:3000/api/reportes/productos-top

# Proveedores
curl http://localhost:3000/api/reportes/proveedores
```

---

## 🔍 TESTS DETALLADOS POR ENDPOINT

### POST /api/carrito

```bash
curl -X POST http://localhost:3000/api/carrito \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "cantidad": 2,
    "sesion_id": "test_123"
  }'
```

**Respuesta esperada:**
```json
{"mensaje":"Producto agregado al carrito"}
```

### GET /api/carrito/:sesionId

```bash
curl http://localhost:3000/api/carrito/test_123
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "producto_id": 1,
    "cantidad": 2,
    "sesion_id": "test_123",
    "nombre": "Camiseta...",
    "precio": "159.90",
    "imagen": "img/..."
  }
]
```

### POST /api/pedidos

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Test User",
    "cliente_email": "test@example.com",
    "cliente_telefono": "+51 999 999 999",
    "items": [
      {"producto_id": 1, "cantidad": 1, "precio": 159.90}
    ],
    "proveedor_id": 1
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "codigoPedido": "GOL-1",
  "total": 159.90,
  "estado": "confirmado",
  "fechaEntrega": "2026-05-17"
}
```

### GET /api/pedidos

```bash
curl http://localhost:3000/api/pedidos
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "cliente_nombre": "Test User",
    "cliente_email": "test@example.com",
    "total": "159.90",
    "estado": "confirmado",
    "fecha_entrega_estimada": "2026-05-17"
  }
]
```

### GET /api/reportes/ventas

```bash
curl http://localhost:3000/api/reportes/ventas
```

**Respuesta esperada:**
```json
{
  "totalVentas": "319.80",
  "totalPedidos": 2,
  "ticketPromedio": "159.900000"
}
```

---

## 🚨 CASOS DE ERROR A PROBAR

### Test 1: Carrito Vacío
- Abre carrito vacío
- Click en "Procesar Pago"
- **ESPERADO**: "El carrito está vacío" (error)

### Test 2: No Autenticado
- Agrega producto al carrito
- Click en "Procesar Pago" sin estar registrado
- **ESPERADO**: Se abre modal de login
- Después de registrarse, se muestra el pago

### Test 3: Múltiples Sesiones
- Abre tienda en 2 navegadores diferentes
- Cada uno debe tener sesionId diferente
- Los carritos son independientes

### Test 4: Stock Máximo
- Intenta agregar más cantidad que el stock
- **ESPERADO**: "Stock máximo alcanzado" (error)

---

## 📊 VALIDACIONES DE BD

### Verificar Sesiones
```sql
SELECT DISTINCT sesion_id FROM carrito;
```

### Verificar Pedidos de Usuario
```sql
SELECT * FROM pedidos WHERE cliente_email = 'tu@email.com' ORDER BY id DESC;
```

### Contar Vendidos
```sql
SELECT COUNT(*) as total_pedidos, SUM(total) as ingresos FROM pedidos;
```

### Verificar Inventario
```sql
SELECT * FROM inventario ORDER BY id;
```

---

## 🎯 CHECKLIST DE TESTING

### Carrito Persistente (FASE 3)
- [ ] Sesión ID generada y guardada
- [ ] Productos se guardan en BD
- [ ] Carrito persiste después de cerrar navegador
- [ ] Múltiples productos se pueden agregar
- [ ] Cantidades se pueden modificar
- [ ] Items se pueden eliminar

### Pedidos (FASE 4)
- [ ] Modal de pago abre correctamente
- [ ] Resumen de compra es correcto
- [ ] Método de pago se puede seleccionar
- [ ] Pedido se crea en BD
- [ ] Código GOL-X se genera
- [ ] Carrito se vacía después de compra
- [ ] "Mis Pedidos" muestra el historial
- [ ] Datos del cliente se guardan correctamente

### Reportes (FASE 5)
- [ ] Reportes página carga sin errores
- [ ] Ventas totales se calculan correctamente
- [ ] Top productos se listan
- [ ] Información de proveedores se muestra
- [ ] Diseño es responsive

---

## 📝 NOTAS DE TESTING

- Usar emails diferentes para cada usuario de prueba
- Verificar BD después de cada operación
- Revisar console (F12) para errores
- Probar en diferentes navegadores (Chrome, Firefox, Safari)
- Probar en móvil (F12 → Device Mode)

---

## 🔧 DEBUGGING

### Ver Carrito en Consola
```javascript
// En DevTools Console
console.log(carrito);
console.log(sesionId);
```

### Ver Errores de API
```javascript
// En DevTools Network tab
// Busca requests a /api/
// Verifica respuesta (status, body)
```

### Ver BD Directamente
```bash
mysql -u root -p080100 tienda_online
SHOW TABLES;
DESC carrito;
DESC pedidos;
SELECT * FROM carrito;
SELECT * FROM pedidos;
```

---

**Última actualización:** 2026-05-12
**Versión:** 1.0
