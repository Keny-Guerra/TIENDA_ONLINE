# Requisitos para correr GOLAZO STORE

---

## 1. Software requerido

| Software | Versión mínima | Para qué sirve |
|----------|---------------|----------------|
| **Node.js** | v18+ | Correr el backend |
| **npm** | v9+ | Instalar dependencias |
| **MySQL** | v8+ | Base de datos |
| **Ollama** | última | Correr el modelo LLM local |
| **n8n** | v2+ | Flujo de automatización de compras |

---

## 2. Instalación del software

### Node.js y npm
```bash
# Ubuntu/Debian/Kali
sudo apt update
sudo apt install nodejs npm

# Verificar
node -v
npm -v
```

### MySQL
```bash
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh

# Descargar el modelo usado por el proyecto
ollama pull smollm2:1.7b

# Verificar
ollama list
```

### n8n
```bash
npm install -g n8n

# Verificar
n8n --version
```

---

## 3. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd tienda_mysql

# Instalar dependencias del proyecto
npm install
```

---

## 4. Configurar el archivo .env

El `.env` **no está en el repositorio**. Créalo en la raíz del proyecto:

```bash
touch .env
```

Con este contenido (ajusta usuario y contraseña de MySQL):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=tienda_online
PORT=3000
```

---

## 5. Importar la base de datos

El repositorio incluye el archivo `tienda_online.sql` con toda la estructura y datos.

```bash
# Crear la base de datos
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tienda_online;"

# Importar el dump
mysql -u root -p tienda_online < tienda_online.sql

# Verificar que las tablas existen
mysql -u root -p tienda_online -e "SHOW TABLES;"
```

Tablas que deben aparecer:
- `usuarios`
- `productos`
- `proveedores`
- `pedidos`
- `solicitudes_compra`
- `ordenes_compra`
- `entregas`
- `precios`

---

## 6. Correr el proyecto

```bash
# Opción A — script automático (inicia Node.js + n8n juntos)
./start-n8n.sh

# Opción B — solo el backend
npm start

# Opción C — backend con hot-reload (desarrollo)
npm run dev
```

Servicios y puertos:

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend Node.js | 3000 | http://localhost:3000 |
| Tienda (frontend) | 3000 | http://localhost:3000/index.html |
| Panel Admin | 3000 | http://localhost:3000/admin.html |
| Ollama | 11434 | http://localhost:11434 |
| n8n | 5678 | http://localhost:5678 |

---

## 7. Verificar que todo funciona

```bash
# Backend
curl http://localhost:3000/api/productos

# Ollama
curl http://localhost:11434/api/tags

# n8n (abrir en navegador)
# http://localhost:5678
```

---

## 8. Credenciales de acceso

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tienda.com | admin123 |
| Usuario de prueba | (ver tabla usuarios en la BD) | - |

---

## 9. Importar el flujo n8n

El flujo de automatización de compras con 4 prompts LLM **no se guarda en el repositorio**.

Debes reconstruirlo manualmente en n8n siguiendo las instrucciones de:
- `implementa_n8n.md` — prompts exactos y código de cada nodo
- `CHATBOT_ADMIN.md` — arquitectura completa del flujo

---

## Resumen rápido

```bash
# Todo en orden:
sudo apt install nodejs npm mysql-server
curl -fsSL https://ollama.com/install.sh | sh
ollama pull smollm2:1.7b
npm install -g n8n

git clone <URL_DEL_REPO> && cd tienda_mysql
npm install
cp .env.example .env  # editar con tu password de MySQL
mysql -u root -p -e "CREATE DATABASE tienda_online;"
mysql -u root -p tienda_online < tienda_online.sql
./start-n8n.sh
```
