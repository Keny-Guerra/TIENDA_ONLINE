# 📦 TIENDA ONLINE - PROYECTO MYSQL

## ✅ Lo que hemos hecho

### 1️⃣ Backend (Node.js + Express)
- **server.js** - Servidor Express que expone API REST
- Endpoints para obtener productos de la BD MySQL
- CORS habilitado para comunicación desde el navegador

### 2️⃣ Base de Datos (MySQL)
- **database.sql** - Script SQL con:
  - Tabla `productos` con todos los campos
  - Tabla `carrito` (para futuro)
  - Tabla `pedidos` (para futuro)
  - 6 productos de ejemplo ya insertados

### 3️⃣ Frontend (HTML + CSS + JavaScript)
- **index.html** - Interfaz de usuario (sin cambios)
- **styles.css** - Estilos (sin cambios)
- **script-new.js** - JavaScript adaptado para consumir la API
  - Carga productos desde `http://localhost:3000/api/productos`
  - Funcionalidad de carrito, búsqueda, autenticación
  - Mismo comportamiento que antes pero con datos de BD

### 4️⃣ Configuración
- **.env** - Variables de entorno (BD, usuario, contraseña)
- **package.json** - Dependencias Node.js
- **.gitignore** - Archivos a ignorar en Git

### 5️⃣ Documentación
- **README.md** - Documentación principal
- **SETUP.md** - Guía de instalación por SO (Windows/Linux/Mac)
- **PROYECTO.md** - Este archivo

---

## 🚀 Cómo empezar (Resumen Rápido)

### Prerequisitos
- ✅ Node.js instalado
- ✅ MySQL instalado y ejecutándose

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos
mysql -u root -p < database.sql
# (Ingresa tu contraseña de MySQL)

# 3. Editar .env con tu contraseña MySQL
# DB_PASSWORD=tu_contraseña_aqui

# 4. Iniciar el servidor
npm start

# 5. Abrir navegador
# http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
tienda_mysql/
├── server.js                 # 🔥 API Express (Nuevo)
├── database.sql              # 🗄️ Script SQL (Nuevo)
├── package.json              # 📦 Dependencias (Nuevo)
├── .env                       # ⚙️ Configuración (Nuevo)
├── .gitignore                # 📝 Git ignore (Nuevo)
├── 
├── index.html                # 📄 Frontend (Original)
├── styles.css                # 🎨 Estilos (Original)
├── script.js                 # ❌ JavaScript viejo (Sin usar)
├── script-new.js             # ✅ JavaScript nuevo (Usar este)
│
├── README.md                 # 📖 Documentación (Nuevo)
├── SETUP.md                  # 🔧 Guía de instalación (Nuevo)
├── PROYECTO.md               # 📋 Este archivo (Nuevo)
│
├── img/                      # 📸 Imágenes de productos (Original)
│   ├── camisetas/
│   ├── zapatillas/
│   └── polos/
│
└── .git/                     # Git repo (Original)
```

---

## 🔗 Endpoints de la API

```
GET  http://localhost:3000/api/productos
GET  http://localhost:3000/api/productos/:id
GET  http://localhost:3000/api/productos/categoria/camisetas
GET  http://localhost:3000/api/deporte/futbol
```

---

## 📊 Flujo de Datos

### ANTES (Sin BD)
```
index.html → script.js → Array de productos en memoria
```

### AHORA (Con MySQL)
```
index.html
    ↓
script-new.js (carga productos)
    ↓
fetch('http://localhost:3000/api/productos')
    ↓
server.js (Express)
    ↓
mysql2 (Driver)
    ↓
MySQL BD (tabla productos)
```

---

## 🛠️ Próximas Mejoras

### Fase 2: CRUD Completo
- [x] Leer productos (GET)
- [ ] Crear productos (POST)
- [ ] Actualizar productos (PUT)
- [ ] Eliminar productos (DELETE)

### Fase 3: Carrito Persistente
- [ ] Guardar carrito en BD
- [ ] Sincronizar carrito entre sesiones
- [ ] Mostrar carrito guardado al entrar

### Fase 4: Sistema de Pedidos
- [ ] Guardar pedidos en BD
- [ ] Historial de compras por usuario
- [ ] Estado de pedidos

### Fase 5: Panel de Administrador
- [ ] Dashboard con estadísticas
- [ ] Gestión de productos
- [ ] Gestión de usuarios
- [ ] Reportes de ventas

---

## 🎯 Checklist de Verificación

- [ ] MySQL está ejecutándose
- [ ] Base de datos `tienda_online` existe
- [ ] Tabla `productos` tiene 6 registros
- [ ] Node.js instalado (`npm --version`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] `.env` configurado con contraseña correcta
- [ ] Servidor inicia sin errores (`npm start`)
- [ ] API responde: http://localhost:3000/api/productos
- [ ] Tienda carga en: http://localhost:3000
- [ ] Productos se muestran en la tienda
- [ ] Carrito funciona
- [ ] Búsqueda funciona
- [ ] Filtros por deporte funcionan

---

## 📱 Cambio en index.html (IMPORTANTE)

Antes de usar la tienda, cambia esta línea en `index.html`:

**Busca:**
```html
<script src="script.js"></script>
```

**Reemplaza por:**
```html
<script src="script-new.js"></script>
```

O simplemente:
```bash
# Renombra los archivos
mv script.js script-old.js
mv script-new.js script.js
```

---

## 🐛 Archivos para No Olvidar

1. **script-new.js** - No olvides usar este en lugar de script.js
2. **.env** - Configura tu contraseña de MySQL aquí
3. **server.js** - Este debe estar ejecutándose en terminal

---

## 📞 Soporte

Si algo no funciona:

1. **Revisa SETUP.md** - Hay soluciones para problemas comunes
2. **Abre la consola del navegador** - F12 → Console → Busca errores
3. **Verifica la terminal** - Donde ejecutaste `npm start`
4. **Prueba la API directamente** - http://localhost:3000/api/productos

---

## ✨ ¡Listo para usar!

La tienda online ahora:
- ✅ Usa datos de MySQL
- ✅ Tiene un backend con API REST
- ✅ Es escalable para agregar más funcionalidades
- ✅ Está lista para las próximas fases

**Próximo paso:** Ejecuta `npm start` y abre http://localhost:3000

---

**Fecha**: Mayo 2024 | **Stack**: Node.js + Express + MySQL | **Status**: ✅ FUNCIONAL
