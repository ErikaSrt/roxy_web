# Guia Para Publicar no GitHub

## Antes de Subir

Confira se estes arquivos existem:

- `README.md`
- `.gitignore`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `src/`
- `public/`
- `supabase/schema.sql`
- `docs/`

Nao publique:

- `.env.local`
- `node_modules/`
- `dist/`
- arquivos com senhas ou chaves privadas

Esses itens ja estao protegidos pelo `.gitignore`.

## Validacao Local

Rode:

```bash
pnpm lint
pnpm build
```

Se os dois comandos passarem, o projeto esta pronto para commit.

## Rodar no Cursor

Abra a pasta raiz do projeto no Cursor:

```text
C:\Users\sarto\Documents\Codex\roxy-web
```

Depois execute:

```bash
pnpm install
pnpm dev
```

O projeto deve abrir em:

```text
http://localhost:5173/
```

## Criar Repositorio Local

Se a pasta ainda nao for um repositorio Git:

```bash
git init
git add .
git commit -m "docs: preparar projeto roxy para github"
```

## Conectar ao GitHub

Crie um repositorio vazio no GitHub e depois execute:

```bash
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/roxy-web.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuario do GitHub.

## Atualizar Depois

Para enviar novas mudancas:

```bash
git status
git add .
git commit -m "feat: descrever mudanca"
git push
```

## Sugestao de Descricao Para o GitHub

```text
Sistema web responsivo para atendimentos infantis de fonoaudiologia, com cadastro de pacientes, exercicios guiados, cartas colecionaveis do mascote Roxy e prontuario exportavel em PDF.
```
