# 👥 SISTEMA DE ROLES - GUÍA COMPLETA

## 🎯 Descripción General

El sistema ahora tiene **dos tipos de usuarios** con permisos diferentes:

| Aspecto | CLIENTE | ADMIN |
|---------|---------|-------|
| **Comprar productos** | ✅ | ✅ |
| **Ver mis pedidos** | ✅ | ❌ |
| **Mi perfil** | ✅ | ❌ |
| **Mis favoritos** | ✅ | ❌ |
| **Direcciones** | ✅ | ❌ |
| **Solicitar Compra (IA)** | ❌ | ✅ |
| **Ver solicitudes pendientes** | ❌ | ✅ |
| **Ver reportes y analíticas** | ❌ | ✅ |
| **Gestionar proveedores** | ❌ | ✅ |
| **Panel admin** | ❌ | ✅ |

---

## 👤 USUARIOS DISPONIBLES

### 1️⃣ Usuario CLIENTE (Comprador)
```
Email: carlos@example.com
o chorri@chorri.com
Contraseña: password123 (o la que registraste)
Rol: cliente
```

**Lo que ve al iniciar sesión:**
- Mi Perfil
- Mis Pedidos
- Mis Favoritos
- Direcciones
- Cerrar Sesión

### 2️⃣ Usuario ADMIN (Gestor de Compras)
```
Email: admin@tienda.com
Contraseña: admin123
Rol: admin
```

**Lo que ve al iniciar sesión:**
- 🔴 **Panel de Administración** (redirige a admin.html)
- 🟠 **Solicitar Compra (IA)** (para requerir proveedores)
- 📋 **Solicitudes Pendientes** (ver requests de empleados)
- 📊 **Reportes y Analíticas** (estadísticas de ventas)
- 🏢 **Gestionar Proveedores** (ver todos los proveedores)
- Cerrar Sesión

---

## 🧪 CÓMO PROBAR

### Test 1: Iniciar sesión como CLIENTE
```
1. Abre http://localhost:3000
2. Click en icono usuario (👤)
3. Click "Iniciar Sesión"
4. Email: carlos@example.com
5. Contraseña: password123
6. Click "Ingresar"

RESULTADO:
✓ Verás menú CLIENTE (Perfil, Pedidos, Favoritos, etc.)
✓ NO verás "Reportes" ni "Solicitar Compra (IA)"
✓ Puedes comprar normalmente
```

### Test 2: Iniciar sesión como ADMIN
```
1. Abre http://localhost:3000
2. Click en icono usuario (👤)
3. Click "Iniciar Sesión"
4. Email: admin@tienda.com
5. Contraseña: admin123
6. Click "Ingresar"

RESULTADO:
✓ Recibes mensaje: "¡Bienvenido Admin [ADMIN]!"
✓ AUTOMÁTICAMENTE redirige a /admin.html
✓ En panel admin ves todo: CRUD productos, precios, entregas, etc.
```

### Test 3: Solicitar Compra como ADMIN
```
1. Como admin, en http://localhost:3000
2. Click usuario → "Solicitar Compra (IA)"
3. Abre modal para escribir solicitud natural
4. Ejemplo:
   "Necesitamos 100 camisetas Perú M para stock crítico"
5. Seleccionar producto
6. Cantidad: 100
7. Click "Enviar Solicitud"

RESULTADO:
✓ Se guarda en BD tabla solicitudes_compra
✓ Estado: "pendiente"
✓ Listo para que n8n procese con IA
```

### Test 4: Ver Proveedores como ADMIN
```
1. Como admin, en http://localhost:3000
2. Click usuario → "Gestionar Proveedores"
3. Se carga lista de todos los proveedores con:
   - Nombre
   - Contacto
   - Email (clickeable)
   - Teléfono
   - Ciudad/País
   - Estado (Activo/Inactivo)

RESULTADO:
✓ Ves todas las 5 proveedores
✓ Puedes contactar directo por email
```

### Test 5: Ver Reportes como ADMIN
```
1. Como admin, en http://localhost:3000
2. Click usuario → "Reportes y Analíticas"
3. Se carga dashboard con:
   - 💰 Ventas totales
   - 📊 Cantidad de pedidos
   - 💵 Ticket promedio
   - 🏆 Top 10 productos
   - 🚚 Estadísticas proveedores

RESULTADO:
✓ Ves datos agregados de todo el sistema
✓ Cliente NUNCA puede ver esto
```

---

## 🔒 Seguridad Implementada

### ✅ Implementado:
- ✓ Roles almacenados en BD
- ✓ Role devuelto en endpoint login
- ✓ Menús diferentes según rol
- ✓ Redirección automática a admin.html
- ✓ Opciones ocultas para clientes

### ⚠️ Para PRODUCCIÓN agregar:
- Hash de contraseñas (bcrypt)
- Validación de roles en backend
- Proteger endpoints admin
- JWT tokens con role incluido

---

## 🔄 Cambios Implementados Hoy

### Base de Datos
```sql
ALTER TABLE usuarios ADD COLUMN role VARCHAR(50) DEFAULT 'cliente';
INSERT INTO usuarios (...) VALUES (..., 'admin');
```

### Backend (server.js)
- Endpoint login ahora devuelve `role` del usuario

### Frontend (script-new.js)
- `iniciarSesion()` - Guarda role, redirija admins a /admin.html
- `actualizarUIUsuario()` - Muestra menú según role
- `toggleUserSidebar()` - Maneja menús separados
- `verProveedores()` - Nueva función para admin

### HTML (index.html)
- Nuevo menú admin con opciones exclusivas
- Menú cliente sin opciones admin

---

## 📊 Flujo de Datos

```
CLIENTE:
  ↓
Click usuario → Iniciar Sesión
  ↓
Email: cliente@email.com
  ↓
BD devuelve role: "cliente"
  ↓
Frontend muestra MENÚ CLIENTE
  ↓
Puede: Comprar, Perfil, Pedidos, Favoritos

ADMIN:
  ↓
Click usuario → Iniciar Sesión
  ↓
Email: admin@tienda.com
  ↓
BD devuelve role: "admin"
  ↓
Frontend redirige a /admin.html
  ↓
Panel admin para gestionar todo
```

---

## 🎯 Casos de Uso

### Caso 1: Empleado compra como cliente
```
Juan (cliente) entra:
- Ve carrito completo
- Puede agregar/eliminar productos
- Puede ver sus pedidos previos
- NO ve reportes
- NO ve solicitudes de compra IA
```

### Caso 2: Gestor de compras busca proveedor
```
María (admin) entra:
- Redirigida a /admin.html automáticamente
- Accede a "Gestionar Proveedores"
- Ve todos los proveedores disponibles
- Ve contacto, email, estado
- Puede contactar directo
```

### Caso 3: IA procesa solicitud de compra
```
Admin escribe: "Necesitamos 50 camisetas Perú"
  ↓
Guarda en solicitudes_compra
  ↓
n8n webhook dispara
  ↓
Claude IA analiza
  ↓
Recomienda mejor proveedor
  ↓
Se crea orden_compra automáticamente
  ↓
Email enviado al proveedor
```

---

## 🔐 Protecciones Actuales

### ✅ Frontend:
```javascript
if (usuarioActual.role === 'admin') {
    // Mostrar menú admin
} else {
    // Mostrar menú cliente
}
```

### ⚠️ Backend (NECESARIO):
```javascript
// Validar role en endpoint antes de procesar
if (req.body.userRole !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
}
```

---

## 🚀 Próximos Pasos

1. **Proteger endpoints admin en backend**
   - Validar role antes de modificar datos
   - Devolver 403 si no es admin

2. **Encriptar contraseñas**
   ```javascript
   npm install bcrypt
   // En registro: hash = bcrypt.hash(password)
   // En login: bcrypt.compare(password, hash)
   ```

3. **JWT tokens con rol**
   ```javascript
   const token = jwt.sign({ id, role }, SECRET);
   // Validar role del token en cada request
   ```

4. **Auditoría**
   - Registrar quién hizo qué cambio
   - Logs de acceso admin

---

## 📱 Interfaz Visual

### Menú Cliente (blanco con acento azul)
```
┌──────────────────────────┐
│ 👤 Mi Perfil             │
│ 📦 Mis Pedidos           │
│ ❤️ Mis Favoritos         │
│ 📍 Direcciones           │
│ ─────────────────────    │
│ 🚪 Cerrar Sesión         │
└──────────────────────────┘
```

### Menú Admin (blanco con acento rojo)
```
┌─────────────────────────────────┐
│ 🔧 Panel de Administración      │
│ 🟠 Solicitar Compra (IA)        │
│ 📋 Solicitudes Pendientes       │
│ 📊 Reportes y Analíticas        │
│ 🏢 Gestionar Proveedores        │
│ ─────────────────────────────── │
│ 🚪 Cerrar Sesión                │
└─────────────────────────────────┘
```

---

## ✅ Checklist Completado

- [x] Agregar columna `role` a BD
- [x] Crear usuario admin
- [x] Endpoint login devuelve role
- [x] Frontend muestra menú según role
- [x] Admin redirige a panel automático
- [x] Cliente NO ve opciones admin
- [x] Función `verProveedores()` implementada
- [x] Estilos diferenciados por rol
- [ ] Validar role en backend endpoints
- [ ] Encriptar contraseñas (bcrypt)
- [ ] JWT con rol incluido

---

## 🎓 Resumen

El sistema ahora tiene **segmentación clara**:
- **CLIENTES:** Solo compran y ven su info
- **ADMINS:** Gestiona todo incluyendo IA y proveedores

Fácil de expandir para agregar más roles (supervisor, contador, etc.)

---

**Versión:** 7.0  
**Fecha:** 2026-05-12  
**Status:** ✅ IMPLEMENTADO

