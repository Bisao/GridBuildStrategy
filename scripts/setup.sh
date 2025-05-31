
#!/bin/bash

echo "🚀 Configurando o projeto..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se o banco de dados está configurado
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL não configurada. Configure no painel de Secrets."
    echo "   Exemplo: postgresql://username:password@host:port/database"
else
    echo "✅ DATABASE_URL configurada"
fi

# Fazer push do schema do banco
echo "🗄️  Configurando banco de dados..."
npm run db:push

echo "✨ Setup concluído! Execute 'npm run dev' para iniciar o desenvolvimento."
