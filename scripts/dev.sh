
#!/bin/bash

echo "🔧 Iniciando ambiente de desenvolvimento..."

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se tsx está instalado
if ! npm list tsx --depth=0 > /dev/null 2>&1; then
    echo "📦 Instalando tsx..."
    npm install --save-dev tsx
fi

# Verificar tipos TypeScript
echo "🔍 Verificando tipos..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ Verificação de tipos passou"
    echo "🚀 Iniciando servidor de desenvolvimento..."
    npm run dev
else
    echo "❌ Erro na verificação de tipos. Corrija os erros antes de continuar."
    exit 1
fi
