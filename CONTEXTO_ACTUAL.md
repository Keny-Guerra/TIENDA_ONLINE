# Contexto Actual del Proyecto — GOLAZO STORE

**Fecha**: 2026-05-16  
**Para retomar**: Lee este archivo primero, luego `CHATBOT_ADMIN.md` e `implementa_n8n.md`

---

## Estado del proyecto

El proyecto es una tienda deportiva full-stack (Node.js + MySQL + n8n + Ollama) con un panel de administrador en `admin.html`.

Stack:
- **Backend**: `server.js` (Express, puerto 3000)
- **BD**: MySQL, base de datos `tienda_online`
- **LLM**: Ollama local con modelo `smollm2:1.7b` (puerto 11434)
- **Automatización**: n8n (puerto 5678)
- **Inicio**: `./start-n8n.sh`

---

## Lo que ya está implementado y funcionando

### 1. Chatbot IA en el panel admin
- Botón flotante 🤖 en `admin.html` (esquina inferior derecha)
- Endpoint: `POST /api/chatbot` en `server.js`
- Responde preguntas sobre productos, stock, pedidos, proveedores y órdenes
- Fix de repetición de respuestas ya aplicado
- Ver detalles: `CHATBOT_ADMIN.md`

### 2. Tabs nuevos en admin.html
Se agregaron hoy dos tabs al panel:
- **Solicitudes de Compra** → `GET /api/solicitudes-compra`
- **Órdenes de Compra** → `GET /api/ordenes-compra`

Sirven para verificar visualmente que el flujo n8n generó órdenes correctamente.

### 3. Endpoints del backend (ya existen en server.js)
| Endpoint | Función |
|----------|---------|
| `POST /api/solicitudes-compra` | Crear solicitud |
| `GET /api/solicitudes-compra` | Listar solicitudes |
| `POST /api/solicitudes-compra/generar-orden` | Crear orden desde solicitud |
| `GET /api/ordenes-compra` | Listar órdenes (con JOIN a proveedor y producto) |

---

## Lo que FALTA implementar — PRÓXIMA TAREA

### Flujo n8n de 4 prompts (pendiente)

El workflow n8n actual del usuario es:
```
Webhook → Edit Fields → HTTP Request (Ollama, 1 prompt) → Merge → Code JS → HTTP Request (backend)
```

Hay que expandirlo a esto:
```
Webhook → Edit Fields → [Prompt1+Parse] → [Prompt2+Parse] → [Prompt3+Parse] → [Prompt4+Parse] → HTTP backend
```

**Pasos pendientes en n8n:**
1. Eliminar el nodo **Merge**
2. Modificar el HTTP Request existente con el **Prompt 1** (Interpretar)
3. Agregar Code Node → Parse1
4. Agregar HTTP Request con **Prompt 2** (Clasificar) + Code Node Parse2
5. Agregar HTTP Request con **Prompt 3** (Recomendar proveedor) + Code Node Parse3
6. Agregar HTTP Request con **Prompt 4** (Generar orden) + Code Node Parse4
7. El último HTTP Request apunta a `http://localhost:3000/api/solicitudes-compra/generar-orden`

**Los prompts completos y el Code Node universal están en**: `implementa_n8n.md`

**Detalle importante**: En el Code Node del Prompt 4, mapear `proveedor_recomendado` → `proveedor_id` antes de enviar al backend.

---

## Archivos clave del proyecto

| Archivo | Contenido |
|---------|-----------|
| `server.js` | Todo el backend (endpoints, chatbot, lógica) |
| `admin.html` | Panel administrador con chatbot y tabs |
| `implementa_n8n.md` | Prompts exactos + Code Node JS para n8n |
| `CHATBOT_ADMIN.md` | Documentación completa del chatbot y flujo n8n |
| `PROMPTS_LLM_DESIGN.md` | Diseño de los 4 prompts LLM |
| `.env` | Credenciales MySQL y configuración |

---

## Credenciales y acceso

- **Admin web**: `admin@tienda.com` / `admin123`
- **BD**: ver `.env` en la raíz del proyecto
- **Ollama modelo**: `smollm2:1.7b`
- **Webhook n8n**: `http://localhost:5678/webhook/...` (ver en n8n)
