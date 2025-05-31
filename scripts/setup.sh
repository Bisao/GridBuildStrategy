
#!/bin/bash

echo "🚀 Configurando o projeto..."

# Limpar instalação anterior se necessário
if [ "$1" = "--clean" ]; then
    echo "🧹 Limpando instalação anterior..."
    rm -rf node_modules package-lock.json
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Instalar tsx se não estiver presente
if ! npm list tsx --depth=0 > /dev/null 2>&1; then
    echo "📦 Instalando tsx..."
    npm install --save-dev tsx
fi

# Verificar se o banco de dados está configurado
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL não configurada. Configure no painel de Secrets."
    echo "   Exemplo: postgresql://username:password@host:port/database"
    echo "   Ou use SQLite local: sqlite:./local.db"
else
    echo "✅ DATABASE_URL configurada"
fi

# Fazer push do schema do banco
echo "🗄️  Configurando banco de dados..."
npm run db:push

# Verificar tipos
echo "🔍 Verificando tipos TypeScript..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ Verificação de tipos passou"
else
    echo "⚠️  Há alguns erros de tipo, mas o projeto pode rodar"
fi

echo "✨ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   • Execute 'npm run dev' para iniciar o desenvolvimento"
echo "   • Use './scripts/dev.sh' para desenvolvimento com verificações"
echo "   • Configure DATABASE_URL se necessário"
echo ""
