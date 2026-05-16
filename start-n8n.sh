#!/bin/bash

echo "🚀 Iniciando Sistema Completo: Tienda + n8n + Claude"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Obtener directorio actual
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}📁 Directorio: $DIR${NC}"
echo ""

# Verificar si n8n está instalado localmente
if [ ! -d "node_modules/n8n" ]; then
    echo -e "${RED}❌ n8n no está instalado. Ejecuta:${NC}"
    echo "npm install n8n"
    exit 1
fi

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "⏹️  Deteniendo servidores..."
    pkill -f "node server.js"
    pkill -f "npx n8n"
    exit 0
}

# Trap para limpiar cuando se presiona Ctrl+C
trap cleanup SIGINT SIGTERM

# Iniciar servidor de tienda
echo -e "${GREEN}✅ Iniciando Servidor de Tienda en puerto 3000...${NC}"
npm start &
TIENDA_PID=$!
sleep 3

# Iniciar n8n
echo -e "${GREEN}✅ Iniciando n8n en puerto 5678...${NC}"
echo "   🔗 Accede a: http://localhost:5678"
echo ""

# Ejecutar n8n localmente
npx n8n start --tunnel &
N8N_PID=$!

sleep 5

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 SISTEMA LISTO${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}SERVICIOS ACTIVOS:${NC}"
echo "  🏪 Tienda:     http://localhost:3000"
echo "  🤖 n8n:        http://localhost:5678"
echo "  ⚙️  API:        http://localhost:3000/api"
echo ""
echo -e "${BLUE}PRÓXIMOS PASOS:${NC}"
echo "  1. Abre http://localhost:5678"
echo "  2. Sign up / Login"
echo "  3. Crea un nuevo Workflow"
echo "  4. Sigue la guía: N8N_CLAUDE_SETUP.md"
echo ""
echo "  Presiona Ctrl+C para detener todos los servidores"
echo ""

# Esperar a que los procesos terminen
wait
