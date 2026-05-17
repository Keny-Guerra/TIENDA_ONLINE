# GOLAZO STORE

Tienda online de artículos deportivos con automatización de compras mediante IA local.

## Stack

- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **LLM local:** Ollama (`qwen2.5:3b`)
- **Automatización:** n8n

## Requisitos previos

| Software | Versión mínima | Instalación |
|----------|---------------|-------------|
| Node.js | v18+ | `sudo apt install nodejs` |
| npm | v9+ | incluido con Node.js |
| MySQL | v8+ | `sudo apt install mysql-server` |
| Ollama | última | `curl -fsSL https://ollama.com/install.sh \| sh` |
| n8n | v2+ | `npm install -g n8n` |

## Instalación

### 1. Instalar dependencias del proyecto

```bash
npm install
```

### 2. Configurar variables de entorno

Crear el archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=tienda_online
PORT=3000
```

### 3. Crear e importar la base de datos

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tienda_online;"
mysql -u root -p tienda_online < tienda_online.sql
```

### 4. Descargar el modelo de IA

```bash
ollama pull qwen2.5:3b
```

## Arrancar el proyecto

### Opción A — Todo junto (recomendado)

Levanta el backend y n8n al mismo tiempo:

```bash
./start-n8n.sh
```

### Opción B — Solo el backend

```bash
npm start
```

### Opción C — Hot-reload (desarrollo)

```bash
npm run dev
```

## Servicios y URLs

| Servicio | URL |
|----------|-----|
| Tienda (frontend) | http://localhost:3000 |
| Panel de administración | http://localhost:3000/admin.html |
| n8n (automatización) | http://localhost:5678 |
| Ollama (API) | http://localhost:11434 |

## Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tienda.com | admin123 |

## Verificar que todo funciona

```bash
# Backend
curl http://localhost:3000/api/productos

# Ollama
curl http://localhost:11434/api/tags
```

## Workflows de automatización (n8n)

Hay **dos workflows** que deben estar activos simultáneamente:

| Archivo | Nombre en n8n | Webhook | Función |
|---------|--------------|---------|---------|
| `workflow_4prompts.json` | Golazo Store - 4 Prompts LLM | `/webhook/solicitud-compra` | Genera órdenes de compra con IA |
| `workflow_chatbot_consultas.json` | Chatbot IA - Consultas | `/webhook/chatbot-consulta` | Interpreta, clasifica y recomienda via chatbot |

**Importar en n8n:**

1. Abrir http://localhost:5678
2. **Workflows** → **Import** → seleccionar `workflow_4prompts.json` → activar
3. **Workflows** → **Import** → seleccionar `workflow_chatbot_consultas.json` → activar

Los prompts exactos para cada nodo Ollama están en `prompts_n8n.txt`.  
Los prompts de prueba para el chatbot están en `prompts_chatbot.txt`.

## Documentación técnica

Ver `DOCUMENTACION.md` para la descripción completa del proyecto: arquitectura, fases de desarrollo, bugs corregidos y referencia de todos los endpoints.
