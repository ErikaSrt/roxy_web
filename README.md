# Roxy - Fonoaudiologia Infantil

Roxy e um sistema web responsivo para apoiar atendimentos infantis de fonoaudiologia. A plataforma permite que a fonoaudiologa cadastre pacientes, conduza exercicios durante a consulta, avalie manualmente o desempenho da crianca e acompanhe a evolucao no prontuario.

O projeto foi inspirado no prototipo visual da Roxy, mantendo a identidade com tons de roxo, azul, lilas, interface leve e o mascote gato como elemento de recompensa.

## Funcionalidades

- Login e cadastro simples para a fonoaudiologa.
- Cadastro de profissional com nome, e-mail, CRFa e telefone.
- Cadastro de pacientes com dados clinicos e agenda de sessoes.
- Dashboard clinico com visao geral de todos os pacientes.
- Reproducao e exclusao individual de audios salvos diretamente pelo dashboard.
- Troca de paciente ativo diretamente pelo menu lateral.
- Lista de pacientes com busca, abertura de prontuario e modo de exclusao.
- Busca por nome, ID, responsaveis, telefone, diagnostico, agenda e exercicios.
- Oito exercicios organizados em cards, com mecanicas de fala, escolha, narrativa, memoria auditiva e respiracao.
- Fluxo de pratica com gravacao de microfone, deteccao local de som e avaliacao manual pela fonoaudiologa.
- Avaliacao manual como correta, incorreta ou parcial, sempre avancando ao proximo card.
- Registro de pontuacao real, percentual e itens que precisam ser retomados.
- Resultado final com carta/figurinha surpresa do mascote Roxy.
- Prontuario em Relatorios com historico, progresso, emblemas colecionaveis, audios das sessoes e exportacao em PDF.
- Persistencia local via `localStorage`.
- Estrutura de banco preparada para Supabase.
- Tela inicial com apresentacao da Roxy, suporte por e-mail e contato com consultor via WhatsApp.

## Stack

- React
- TypeScript
- Vite
- Supabase JS
- Lucide React
- jsPDF
- html2canvas
- Oxlint

## Requisitos

- Node.js instalado
- pnpm instalado

Para verificar:

```bash
node -v
pnpm -v
```

## Como Rodar

Instale as dependencias:

```bash
pnpm install
```

Crie o arquivo de ambiente local:

```bash
copy .env.example .env.local
```

Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Abra o endereco exibido no terminal, normalmente:

```text
http://127.0.0.1:5173/
```

 instale pelo npm:

```bash
npm install -g pnpm
```

O arquivo `package.json` precisa aparecer na raiz da aba Explorer do Cursor.

## Scripts

```bash
pnpm dev
```

Executa o app em modo desenvolvimento.

```bash
pnpm build
```

Valida TypeScript e gera a pasta `dist`.

```bash
pnpm lint
```

Executa o Oxlint.

```bash
pnpm preview
```

Abre uma previa local da build de producao.

## Variaveis de Ambiente

O app funciona em modo local sem Supabase. Para conectar ao Supabase, preencha:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPPORT_EMAIL=suporteroxy256@gmail.com
VITE_CONSULTANT_WHATSAPP=554298104857
```

Use o arquivo `supabase/schema.sql` para criar as tabelas iniciais.

Em `VITE_CONSULTANT_WHATSAPP`, informe o numero com codigo do pais e DDD, usando somente digitos. Exemplo: `5511999990000`.

## Estrutura

```text
roxy-web/
  public/
    assets/              # Logo e cartas do mascote Roxy
  src/
    App.tsx              # Telas, fluxos e interacoes principais
    App.css              # Estilos responsivos
    data.ts              # Exercicios, cartas e pacientes de exemplo
    storage.ts           # Persistencia local
    supabase.ts          # Cliente Supabase opcional
    types.ts             # Tipos centrais do dominio
  supabase/
    schema.sql           # Estrutura inicial do banco
  docs/
    REQUISITOS.md
    ARQUITETURA.md
    SUPABASE.md
    GITHUB.md
```

## Documentacao

- [Requisitos do produto](docs/REQUISITOS.md)
- [Arquitetura tecnica](docs/ARQUITETURA.md)
- [Banco de dados Supabase](docs/SUPABASE.md)
- [Guia para GitHub](docs/GITHUB.md)
- [Planejamento Scrum para o Trello](docs/TRELLO_SCRUM.md)

## Privacidade

Este projeto lida com dados clinicos e infantis. Antes de uso real, e necessario finalizar autenticacao, permissoes por usuario, politicas de acesso no banco, termos de uso, politica de privacidade, exclusao de dados, backups e revisao de conformidade com LGPD.

## Status

Versao funcional de apresentacao/prototipo avancado, com telas responsivas, dashboard clinico, fluxo de atendimento, gravacao de audio, cartas colecionaveis e exportacao de prontuario em PDF.
