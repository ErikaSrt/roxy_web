# Supabase

## Status

O projeto ja possui estrutura inicial de banco em `supabase/schema.sql`, mas a aplicacao ainda funciona em modo local quando as variaveis do Supabase nao estao preenchidas.

## Variaveis de Ambiente

Crie um arquivo `.env.local` com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

Nunca publique `.env.local` no GitHub.

## Tabelas

### `professionals`

Armazena dados da fonoaudiologa:

- `id`
- `name`
- `email`
- `crfa`
- `phone`
- `created_at`

### `patients`

Armazena pacientes vinculados a uma profissional:

- `id`
- `professional_id`
- `name`
- `birth_date`
- `guardians`
- `phone`
- `diagnosis`
- `exercises`
- `session_day`
- `session_time`
- `created_at`

### `session_records`

Armazena resultados de exercicios:

- `id`
- `patient_id`
- `exercise_id`
- `exercise_name`
- `score`
- `total`
- `notes`
- `badge_id`
- `badge_name`
- `badge_image`
- `attempts`
- `created_at`

## Como Criar as Tabelas

1. Abra o painel do Supabase.
2. Entre no projeto.
3. Acesse SQL Editor.
4. Copie o conteudo de `supabase/schema.sql`.
5. Execute o script.

## Seguranca

O arquivo SQL ativa Row Level Security nas tabelas, mas ainda nao cria policies finais. Antes de producao, crie policies conectadas ao Supabase Auth para garantir que cada fonoaudiologa veja apenas seus proprios dados.

Exemplo de regra desejada:

- Profissional autenticada acessa apenas o proprio registro.
- Pacientes sao acessados apenas pela profissional dona.
- Sessoes sao acessadas apenas por meio dos pacientes da profissional dona.

## Observacao Sobre Dados Infantis

Dados de criancas e prontuarios clinicos devem ser tratados como dados sensiveis. Antes de uso real, revise LGPD, consentimento dos responsaveis, tempo de retencao, backup, exclusao e auditoria de acesso.
