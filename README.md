# 🛍️ TIENDA ONLINE - MySQL + Node.js

Conversión de la MYPE ficticia a arquitectura con **Base de Datos MySQL** y **API REST con Node.js**.

## 📋 Requisitos Previos

- **Node.js** (versión 14 o superior): [Descargar](https://nodejs.org/)
- **MySQL** (versión 5.7 o superior): [Descargar](https://www.mysql.com/downloads/)

## 🚀 Instalación Rápida

### Paso 1: Instalar dependencias Node.js

```bash
npm install
```

Esto instalará:
- `express` - Framework web
- `mysql2` - Driver de MySQL
- `cors` - Para permitir requests desde el navegador
- `dotenv` - Para variables de entorno

### Paso 2: Crear la Base de Datos MySQL

1. Abre **MySQL Workbench** o línea de comandos MySQL
2. Ejecuta el siguiente comando para usar tu usuario root:

```bash
mysql -u root -p < database.sql
```

Si tu MySQL no tiene contraseña, simplemente:

```bash
mysql -u root < database.sql
```

### Paso 3: Configurar variables de entorno

Edita el archivo `.env` con tus credenciales MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=tienda_online
PORT=3000
```

### Paso 4: Iniciar el servidor

```bash
npm start
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:3000
📊 API disponible en http://localhost:3000/api/productos
```

### Paso 5: Abre en tu navegador

```
http://localhost:3000
```

## 📚 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Obtiene todos los productos |
| GET | `/api/productos/:id` | Obtiene un producto por ID |
| GET | `/api/productos/categoria/:categoria` | Filtra por categoría (camisetas, zapatillas, polos) |
| GET | `/api/deporte/:deporte` | Filtra por deporte (futbol, basquet, voley) |

### Ejemplos de uso:

```bash
# Obtener todos los productos
curl http://localhost:3000/api/productos

# Obtener producto con ID 1
curl http://localhost:3000/api/productos/1

# Obtener solo camisetas
curl http://localhost:3000/api/productos/categoria/camisetas

# Obtener productos de fútbol
curl http://localhost:3000/api/deporte/futbol
```

## 🗄️ Estructura de la Base de Datos

### Tabla: `productos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Identificador único (auto_increment) |
| `nombre` | VARCHAR(255) | Nombre del producto |
| `categoria` | VARCHAR(100) | Categoría (camisetas, zapatillas, polos) |
| `deporte` | VARCHAR(100) | Deporte (futbol, basquet, voley) |
| `descripcion` | TEXT | Descripción detallada |
| `especificaciones` | TEXT | Especificaciones técnicas |
| `precioOriginal` | DECIMAL(10,2) | Precio sin descuento |
| `precioOferta` | DECIMAL(10,2) | Precio con descuento |
| `descuento` | INT | Porcentaje de descuento |
| `stock` | INT | Cantidad disponible |
| `vistaFrente` | VARCHAR(255) | URL imagen frontal |
| `vistaEspalda` | VARCHAR(255) | URL imagen trasera |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Tablas adicionales (para futuro):
- `carrito` - Sesiones de carrito
- `pedidos` - Historial de compras

## 📝 Notas de Desarrollo

### Para usar el nuevo script.js:

1. Reemplaza la referencia en `index.html`:

```html
<!-- Cambiar esto: -->
<script src="script.js"></script>

<!-- A esto: -->
<script src="script-new.js"></script>
```

2. O simplemente renombra los archivos:

```bash
mv script.js script-old.js
mv script-new.js script.js
```

### Agregar más productos a la BD:

Edita el archivo `database.sql` y agrega más INSERT:

```sql
INSERT INTO productos (nombre, categoria, deporte, descripcion, especificaciones, precioOriginal, precioOferta, descuento, stock, vistaFrente, vistaEspalda) VALUES
('Nombre Producto', 'camisetas', 'futbol', 'Descripción...', 'Especificaciones...', 100.00, 80.00, 20, 50, 'img/path1.jpg', 'img/path2.jpg');
```

Luego vuelve a ejecutar:

```bash
mysql -u root tienda_online < database.sql
```

## 🔧 Solucionar problemas

### "Error: getaddrinfo ENOTFOUND localhost"
- Asegúrate que MySQL está ejecutándose
- En Windows: Abre Services y busca MySQL

### "Error: ER_ACCESS_DENIED_FOR_USER"
- Verifica tu contraseña en `.env`
- Prueba: `mysql -u root -p` (con tu contraseña)

### "Error: ER_NO_DB_SELECTED"
- La BD no existe. Ejecuta:
```bash
mysql -u root -p < database.sql
```

### Producto no carga en la tienda
- Abre la consola del navegador (F12)
- Verifica que la API responde: http://localhost:3000/api/productos
- Revisa que el servidor Node está corriendo

## 📱 Próximas fases

- [ ] Fase 1: ✅ Migrar datos a MySQL (HECHO)
- [ ] Fase 2: Agregar operaciones CRUD (crear, actualizar, eliminar productos)
- [ ] Fase 3: Sistema de carrito persistente en BD
- [ ] Fase 4: Gestión de pedidos
- [ ] Fase 5: Panel de administrador

---

**Creado**: Mayo 2024 | **Stack**: Node.js + Express + MySQL
