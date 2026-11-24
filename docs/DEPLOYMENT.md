# Publicacao do Roxy Web

Este documento descreve como o Roxy e validado, publicado no GitHub Pages e recuperado se uma versao apresentar problema.

## Endereco de producao

```text
https://erikasrt.github.io/roxy_web/
```

O projeto e publicado pelo workflow `.github/workflows/deploy-pages.yml`. A origem do GitHub Pages deve permanecer configurada como **GitHub Actions** nas configuracoes do repositorio.

## Estrutura da build

- O Vite usa `VITE_BASE_PATH=/roxy_web/` no ambiente de producao.
- Imagens do diretorio `public/assets` sao referenciadas com `import.meta.env.BASE_URL`.
- CSS e JavaScript recebem caminhos com o mesmo prefixo durante a build.
- `npm run build` gera a pasta `dist`.
- `npm run verify:dist` confirma que o HTML, o bundle, o CSS e a logo existem e que nenhum recurso foi gerado como `/assets/...` fora do repositorio.
- A pasta `dist` e um artefato temporario e nao deve ser commitada.

## Rotas

O Roxy nao usa React Router. A aplicacao possui uma unica rota publica e alterna as telas por estado interno do React (`AppView`). Assim:

- o acesso direto a `/roxy_web/` funciona;
- atualizar a pagina volta para a entrada da aplicacao sem causar 404;
- o link compartilhavel e `https://erikasrt.github.io/roxy_web/`;
- nao existem URLs internas como `/pacientes` ou `/relatorios` para serem abertas diretamente.

Se URLs internas forem adicionadas no futuro, use `HashRouter` no GitHub Pages (por exemplo, `/roxy_web/#/pacientes`) ou migre para uma hospedagem com fallback de SPA. Nao adicione `BrowserRouter` sem configurar esse fallback.

## Validacao local obrigatoria

Use Node.js 24 e npm 12. Na raiz do repositorio:

```bash
npm ci
npm run lint
npm test
```

No PowerShell, gere e confira exatamente a build do GitHub Pages:

```powershell
$env:VITE_BASE_PATH = "/roxy_web/"
npm run build
$env:EXPECTED_BASE_PATH = "/roxy_web/"
npm run verify:dist
Remove-Item Env:VITE_BASE_PATH
Remove-Item Env:EXPECTED_BASE_PATH
```

Opcionalmente, abra a build local:

```bash
npm run preview
```

## Pipeline de publicacao

Um push na branch `main` ou uma execucao manual inicia estas etapas:

1. baixa o repositorio com uma versao fixa do `actions/checkout`;
2. prepara Node.js 24 e restaura o cache do npm a partir de `package-lock.json`;
3. instala dependencias de forma reproduzivel com `npm ci`;
4. executa o Oxlint;
5. executa os testes automatizados;
6. gera a build com base `/roxy_web/`;
7. valida todo o conteudo da pasta `dist`;
8. envia a `dist` como artefato do GitHub Pages;
9. publica somente se o job de build terminou com sucesso;
10. faz um teste HTTP na pagina publicada e no bundle JavaScript.

O deploy depende do job de build. Qualquer falha em instalacao, lint, testes, build ou verificacao da `dist` impede a publicacao. O workflow nao cancela uma publicacao em andamento para evitar deploys incompletos.

## Permissoes

O `GITHUB_TOKEN` usa apenas as permissoes necessarias:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

O job de deploy usa o ambiente protegido `github-pages`. Nenhuma chave pessoal precisa ser salva no repositorio.

## Publicacao manual

1. Abra o repositorio no GitHub.
2. Entre em **Actions**.
3. Escolha **Publicar Roxy no GitHub Pages**.
4. Clique em **Run workflow** e selecione `main`.
5. Aguarde os jobs `build`, `deploy` e `Testar site publicado` ficarem verdes.

Uma execucao manual sempre publica o conteudo atual da branch `main`; ela nao ignora testes.

## Recuperar uma versao anterior

Use um commit de reversao para preservar o historico:

1. encontre o ultimo commit estavel na pagina de commits ou no workflow verde anterior;
2. identifique o commit que introduziu o problema;
3. atualize sua copia local com `git pull --ff-only`;
4. crie a reversao com `git revert <hash-do-commit-com-problema>`;
5. execute `npm ci` e `npm run check`;
6. envie o commit de reversao com `git push origin main`;
7. acompanhe os tres jobs no GitHub Actions;
8. confirme o endereco de producao em uma janela anonima.

Nao use `git reset --hard` nem force push na `main` para recuperar producao. Se o GitHub Pages estiver temporariamente indisponivel, aguarde o servico voltar e execute novamente o workflow verde; nao altere codigo apenas para forcar uma publicacao.

## Diagnostico rapido

- **404 em arquivos JS/CSS:** confira `VITE_BASE_PATH=/roxy_web/` e rode `npm run verify:dist`.
- **`npm ci` falhou:** confirme que `package.json` e `package-lock.json` foram atualizados juntos.
- **build passou e deploy falhou:** verifique o ambiente `github-pages`, as permissoes do workflow e se Pages esta com origem GitHub Actions.
- **site abriu sem estilos:** abra o codigo-fonte da pagina e confirme que os recursos iniciam com `/roxy_web/`.
- **teste final falhou:** abra a URL do ambiente exibida no job `deploy` e teste o arquivo JavaScript informado no HTML.
