# Barber Connect Admin

Painel administrativo para gerenciamento de barbearias, desenvolvido como projeto acadêmico.

## Descrição

O **Barber Connect Admin** é um dashboard completo que permite ao proprietário de uma barbearia gerenciar barbeiros, serviços, horários, agendamentos e pagamentos — tudo integrado à API REST do backend.

---

## Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18 | Biblioteca de UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 5 | Bundler / Dev Server |
| React Router | 6 | Roteamento SPA |
| Axios | 1 | Requisições HTTP |
| React Hook Form | 7 | Gerenciamento de formulários |
| Zod | 3 | Validação de schemas |
| Material UI | 5 | Biblioteca de componentes |

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/RafaMendess/barber-connect.git
cd barber-connect

# 2. Acesse a pasta do frontend (se aplicável)
# cd frontend

# 3. Instale as dependências
npm install
```

---

## Execução

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

A aplicação estará disponível em: `http://localhost:5173`

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── shared/          # Componentes reutilizáveis (PageHeader, LoadingState, etc.)
│   └── ui/              # Componentes de UI base
├── contexts/
│   ├── AuthContext.tsx      # Contexto de autenticação JWT
│   └── BarbershopContext.tsx # Contexto da barbearia selecionada
├── hooks/
│   ├── useApi.ts            # Hook genérico para chamadas à API
│   └── useNotification.ts   # Hook para notificações (Snackbar)
├── layouts/
│   └── MainLayout.tsx       # Layout principal com sidebar
├── pages/
│   ├── auth/                # Login
│   ├── dashboard/           # Dashboard com indicadores
│   ├── barbershops/         # CRUD de barbearias
│   ├── barbers/             # Gestão de barbeiros
│   ├── services/            # CRUD de serviços
│   ├── availabilities/      # Disponibilidades dos barbeiros
│   ├── schedule-blocks/     # Bloqueios de agenda
│   ├── appointments/        # Listagem e gestão de agendamentos
│   └── payments/            # Listagem e gestão de pagamentos
├── routes/
│   ├── AppRoutes.tsx        # Definição de todas as rotas
│   └── ProtectedRoute.tsx   # Rota protegida por autenticação
├── schemas/
│   └── index.ts             # Schemas Zod para validação de formulários
├── services/
│   ├── api.ts               # Instância Axios com interceptors JWT
│   ├── authService.ts       # Serviço de autenticação
│   ├── barbershopService.ts # Serviço de barbearias
│   ├── barberService.ts     # Serviço de barbeiros
│   ├── offeredServiceService.ts # Serviço de serviços oferecidos
│   ├── availabilityService.ts   # Serviço de disponibilidades
│   ├── scheduleBlockService.ts  # Serviço de bloqueios de agenda
│   ├── appointmentService.ts    # Serviço de agendamentos
│   └── paymentService.ts        # Serviço de pagamentos
├── types/
│   └── api.ts               # Tipos TypeScript gerados da spec OpenAPI
└── utils/
    ├── format.ts            # Utilitários de formatação (data, moeda, etc.)
    ├── jwtDecode.ts         # Decodificação de JWT sem biblioteca externa
    └── theme.ts             # Tema customizado Material UI
```

---

## Rotas da Aplicação

| Rota | Página | Protegida |
|---|---|---|
| `/login` | Tela de Login | Não |
| `/dashboard` | Dashboard com indicadores | Sim |
| `/barbershops` | Gerenciamento de barbearias | Sim |
| `/barbers` | Gerenciamento de barbeiros | Sim |
| `/services` | Gerenciamento de serviços | Sim |
| `/availabilities` | Disponibilidades dos barbeiros | Sim |
| `/schedule-blocks` | Bloqueios de agenda | Sim |
| `/appointments` | Agendamentos | Sim |
| `/payments` | Pagamentos | Sim |

---

## API

- **Base URL:** `https://barber-connect-production-e6e0.up.railway.app`
- **Swagger:** [https://barber-connect-production-e6e0.up.railway.app/swagger-ui/index.html](https://barber-connect-production-e6e0.up.railway.app/swagger-ui/index.html)
- **Autenticação:** JWT Bearer Token (armazenado no `localStorage`)
- **Refresh Token:** Renovado automaticamente via interceptor Axios

---

## Funcionalidades

- ✅ Autenticação JWT com refresh automático
- ✅ Navegação protegida (rotas privadas)
- ✅ Dashboard com indicadores da barbearia
- ✅ CRUD completo de barbearias
- ✅ Gestão de barbeiros (cadastro, edição, ativar/inativar)
- ✅ CRUD de serviços oferecidos
- ✅ Gestão de disponibilidades por barbeiro
- ✅ Gestão de bloqueios de agenda por barbeiro
- ✅ Listagem e cancelamento de agendamentos (com filtro por status)
- ✅ Listagem e atualização de status de pagamentos
- ✅ Sidebar responsiva (colapsa em mobile)
- ✅ Feedback visual: loading, empty state, error state
- ✅ Notificações de sucesso e erro (Snackbar)
- ✅ Diálogos de confirmação para ações destrutivas
