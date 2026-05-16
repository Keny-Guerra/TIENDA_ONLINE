# 🔧 GUÍA COMPLETA DE CONFIGURACIÓN

## Sistema Operativo Específico

### Windows

#### 1. Instalar MySQL
1. Descarga MySQL Community Server desde: https://dev.mysql.com/downloads/mysql/
2. Ejecuta el instalador `.msi`
3. En "Type and Networking", selecciona "Development Default"
4. En "MySQL Server Port Configuration", usa el puerto **3306** (default)
5. En "MySQL Server Configuration", selecciona "Standalone MySQL Server"
6. En "Accounts and Roles", ingresa la contraseña para root
7. En "Windows Service", selecciona "Install as Windows Service" y "Configure MySQL Server as a Windows Service"
8. Completa la instalación

#### 2. Verificar instalación
Abre PowerShell y ejecuta:
```powershell
mysql -u root -p
```
Ingresa tu contraseña. Deberías ver `mysql>`

#### 3. Instalar Node.js
1. Descarga desde: https://nodejs.org/ (versión LTS)
2. Ejecuta el instalador `.msi`
3. Sigue los pasos por defecto

#### 4. Verificar Node.js
```powershell
node --version
npm --version
```

---

### Linux (Ubuntu/Debian)

#### 1. Instalar MySQL
```bash
sudo apt update
sudo apt install mysql-server mysql-client
sudo mysql_secure_installation
```

#### 2. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

#### 3. Verificar instalación
```bash
mysql --version
node --version
npm --version
```

---

### macOS

#### 1. Instalar Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Instalar MySQL
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### 3. Instalar Node.js
```bash
brew install node
```

#### 4. Verificar instalación
```bash
mysql --version
node --version
npm --version
```

---

## Configuración del Proyecto

### Paso 1: Clonar/Descargar proyecto

```bash
# Si está en GitHub
git clone <URL-del-repositorio>
cd tienda_mysql

# O si es una carpeta local
cd tienda_mysql
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Espera a que termine (puede tomar 1-2 minutos)

### Paso 3: Crear la BD

#### Opción A: Automática (Recomendado)
```bash
mysql -u root -p < database.sql
```
Ingresa tu contraseña de MySQL

#### Opción B: Manual
1. Abre MySQL Workbench
2. Nuevo Query Tab
3. Copia todo el contenido de `database.sql`
4. Ejecuta (Ctrl+Shift+Enter)

### Paso 4: Configurar variables de entorno

Edita el archivo `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=tienda_online

# Servidor
PORT=3000
```

**Importante**: La contraseña debe ser exactamente la que usaste en MySQL

### Paso 5: Iniciar el servidor

```bash
npm start
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:3000
📊 API disponible en http://localhost:3000/api/productos
```

### Paso 6: Probar en el navegador

Abre: **http://localhost:3000**

---

## Verificar que todo funciona

### 1. Verificar API

Abre en el navegador:
```
http://localhost:3000/api/productos
```

Deberías ver un JSON con los productos.

### 2. Verificar BD directamente

```bash
mysql -u root -p tienda_online
```

Dentro de MySQL:
```sql
SELECT COUNT(*) as total_productos FROM productos;
SELECT * FROM productos LIMIT 5;
```

### 3. Verificar Node

```bash
# En otra terminal (sin cerrar el servidor)
npm list
```

---

## Reemplazar script.js

En `index.html`, cambia:

```html
<!-- DE ESTO: -->
<script src="script.js"></script>

<!-- A ESTO: -->
<script src="script-new.js"></script>
```

O en terminal:
```bash
# Windows
move script.js script-old.js
move script-new.js script.js

# Linux/Mac
mv script.js script-old.js
mv script-new.js script.js
```

---

## Desarrollo en modo watch

Para que Node reinicie automáticamente al hacer cambios:

```bash
npm install -g nodemon
nodemon server.js
```

O si tienes nodemon instalado localmente:
```bash
npx nodemon server.js
```

---

## Troubleshooting

### "Cannot find module 'mysql2'"
```bash
npm install
```

### "Error: connect ECONNREFUSED 127.0.0.1:3306"
- MySQL no está ejecutándose
- Windows: Abre Services y busca "MySQL80" o similar
- Linux: `sudo service mysql start`
- Mac: `brew services start mysql`

### "ER_ACCESS_DENIED_FOR_USER"
- Contraseña incorrecta en `.env`
- Prueba acceder directamente: `mysql -u root -p`

### "ER_NO_DATABASE_SELECTED"
- BD no existe. Ejecuta: `mysql -u root -p < database.sql`

### Puerto 3000 ya en uso
Cambia en `.env`:
```env
PORT=3001
```
O mata el proceso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

---

## Siguiente Paso

Una vez funcione, el proyecto está listo para:
- Agregar más productos a la BD
- Crear operaciones CRUD (crear/actualizar/eliminar)
- Implementar carrito persistente
- Agregar autenticación de usuarios
- Crear panel de administración
