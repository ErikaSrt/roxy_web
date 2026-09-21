# Arquitetura Tecnica

## Visao Geral

O Roxy foi construido como uma aplicacao web responsiva em React com TypeScript. A primeira versao funciona com dados locais no navegador e ja possui estrutura preparada para evoluir para Supabase.

## Camadas

```text
Interface React
  App.tsx
  App.css

Dados e dominio
  data.ts
  types.ts

Persistencia local
  storage.ts

Banco opcional
  supabase.ts
  supabase/schema.sql
```

## Principais Arquivos

### `src/App.tsx`

Concentra as telas e fluxos principais:

- Splash inicial da logo.
- Login e cadastro profissional simples.
- Layout com navegacao lateral/responsiva.
- Dashboard clinico.
- Lista de pacientes.
- Cadastro e edicao de paciente.
- Cards de exercicios.
- Tela de pratica.
- Resultado com carta conquistada.
- Prontuario/relatorios.
- Exportacao de PDF.

### `src/App.css`

Define a identidade visual, responsividade, estados visuais, cards, navegacao, splash e layout das telas.

### `src/data.ts`

Contem:

- Caminho da logo Roxy.
- Exercicios disponiveis.
- Prompts/cards de cada exercicio.
- Cartas/emblemas do mascote.
- Pacientes de exemplo.

### `src/types.ts`

Centraliza os tipos TypeScript do dominio:

- `Professional`
- `Patient`
- `Exercise`
- `ExercisePrompt`
- `Badge`
- `SessionRecord`
- `Rating`
- `AppView`

### `src/storage.ts`

Implementa persistencia local com `localStorage`, usada para manter dados no navegador durante o uso do prototipo funcional.

### `src/supabase.ts`

Cria o cliente Supabase apenas quando as variaveis de ambiente existem. Isso permite rodar o app localmente sem backend.

## Persistencia Atual

Na versao atual, os dados ficam no navegador por meio de `localStorage`.

Chaves usadas:

- `roxy-professional`
- `roxy-patients`
- `roxy-sessions`

Esse modelo facilita apresentacao e testes sem backend, mas nao deve ser usado sozinho em producao com dados reais. Os audios gravados tambem ficam em `localStorage` como data URL dentro dos registros de sessao.

### Consequencias do Modo Local

- Os dados nao sao sincronizados entre computadores ou navegadores.
- Nao existe isolamento real entre contas profissionais.
- O espaco disponivel para audio e limitado pelo navegador.
- A exclusao do armazenamento do site apaga os dados locais.
- O modo atual e adequado para demonstracao academica, nao para atendimento clinico em producao.

## Evolucao Para Producao

Para uso real, os proximos passos recomendados sao:

- Ativar Supabase Auth.
- Relacionar cada paciente a uma fonoaudiologa autenticada.
- Criar policies de Row Level Security por usuario.
- Persistir sessoes e prontuarios no banco.
- Salvar arquivos exportados apenas quando houver consentimento.
- Criar termos de uso e politica de privacidade.
- Adicionar testes automatizados para fluxos principais.

### Arquitetura Alvo

```text
React + TypeScript
  |
  +-- Supabase Auth
  +-- PostgreSQL com Row Level Security
  +-- Supabase Storage para audios
  +-- Exportacao local de PDF
```

O acesso aos dados deve ser sempre associado ao identificador da profissional autenticada. Audios devem ser armazenados em bucket privado e disponibilizados por URL temporaria, com consentimento e politica de retencao definidos.

## Decisoes de Produto

- A crianca nao possui login proprio.
- A fonoaudiologa controla a avaliacao dos exercicios.
- O microfone grava a resposta da crianca e salva o audio no historico local da sessao.
- O menu permite trocar o paciente ativo sem mudar de tela.
- O dashboard mostra o progresso geral da fonoaudiologa.
- As cartas aparecem de surpresa apenas no resultado final.
- O prontuario fica dentro do menu Relatorios.
- O app preserva a estetica original do prototipo, com melhorias de cor, logo e responsividade.
