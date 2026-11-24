# Guia Para Publicar no GitHub

## Antes de Subir

Confira se estes arquivos existem:

- `README.md`
- `.gitignore`
- `.env.example`
- `package.json`
- `package-lock.json`
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
npm ci
npm run check
```

Se todos os comandos passarem, o projeto esta pronto para commit. O workflow repete as mesmas validacoes antes de publicar.

## Rodar no Cursor

Abra a pasta raiz do projeto no Cursor:

```text
C:\Users\sarto\Documents\Codex\roxy-web
```

Depois execute:

```bash
npm ci
npm run dev
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

Repositorio oficial do projeto:

```text
https://github.com/ErikaSrt/roxy_web
```

O repositorio local ja esta conectado como `origin`. Para uma nova copia, use:

```bash
git clone https://github.com/ErikaSrt/roxy_web.git
cd roxy_web
npm ci
```

## Atualizar Depois

Para enviar novas mudancas:

```bash
git status
git add .
git commit -m "feat: descrever mudanca"
git push
```

O push em `main` inicia o pipeline do GitHub Pages. Consulte [DEPLOYMENT.md](DEPLOYMENT.md) para monitoramento, publicacao manual e recuperacao de versao.

## Sugestao de Descricao Para o GitHub

```text
Sistema web responsivo para atendimentos infantis de fonoaudiologia, com cadastro de pacientes, exercicios guiados, cartas colecionaveis do mascote Roxy e prontuario exportavel em PDF.
```
