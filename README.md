
# 3D Grid Building Game

Um jogo de construção 3D desenvolvido com React Three Fiber, Express e PostgreSQL.

## 🚀 Quick Start

### 1. Configuração Inicial
```bash
# Execute o script de setup
./scripts/setup.sh

# Ou manualmente:
npm install
npm run db:push
```

### 2. Configurar Variáveis de Ambiente
1. Configure `DATABASE_URL` no painel de Secrets do Replit
2. Copie `.env.example` para `.env` e ajuste as variáveis conforme necessário

### 3. Executar o Projeto
```bash
# Desenvolvimento
npm run dev

# Ou com verificações extras
./scripts/dev.sh

# Build e preview
npm run preview
```

## 📁 Estrutura do Projeto

```
├── client/          # Frontend React + Three.js
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── lib/        # Stores e utilitários
│   │   └── pages/      # Páginas
├── server/          # Backend Express
├── shared/          # Código compartilhado
├── scripts/         # Scripts de automação
└── migrations/      # Migrações do banco
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run type-check` - Verifica tipos TypeScript
- `npm run check:watch` - Verifica tipos em modo watch

### Build e Deploy
- `npm run build` - Build completo (client + server)
- `npm run build:client` - Build apenas do frontend
- `npm run build:server` - Build apenas do backend
- `npm run start` - Inicia em modo produção
- `npm run preview` - Build + start local

### Banco de Dados
- `npm run db:push` - Aplica schema ao banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre Drizzle Studio
- `npm run db:reset` - Reset completo do banco

### Manutenção
- `npm run clean` - Limpa arquivos de build e cache
- `npm run install:clean` - Reinstala dependências

## 🎮 Tecnologias

- **Frontend**: React + Three.js + Tailwind CSS
- **Backend**: Express + TypeScript
- **Banco**: PostgreSQL + Drizzle ORM
- **Build**: Vite + ESBuild
