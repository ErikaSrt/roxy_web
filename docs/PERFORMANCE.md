# Fase 06 — Experiência, Performance, Acessibilidade e SEO

Auditoria realizada em 24 de novembro de 2026 com Lighthouse, Pa11y, build do Vite e testes responsivos no navegador.

## Resultado antes e depois

| Métrica | Mobile antes | Mobile depois | Desktop antes | Desktop depois |
| --- | ---: | ---: | ---: | ---: |
| Performance | 79 | 100 | 97 | 98 |
| Acessibilidade | 100 | 100 | 95 | 100 |
| Boas práticas | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| FCP | 0,9 s | 1,4 s | 0,2 s | 0,2 s |
| LCP | 5,7 s | 1,4 s | 1,0 s | 0,4 s |
| TBT | 50 ms | 0 ms | 0 ms | 0 ms |
| CLS | 0 | 0 | 0,021 | 0 |
| Transferência inicial | 969 KiB | 136 KiB | 969 KiB | 136 KiB |

O pequeno aumento do FCP mobile ocorreu entre execuções com limitação simulada de rede e CPU, mas o conteúdo principal passou a aparecer 4,3 segundos antes e a pontuação total chegou a 100.

## Otimizações aplicadas

- Logo ativa convertida de PNG de 887 KB para WebP de 32 KB e dimensões adequadas à interface.
- Cartas convertidas de JPG para WebP, com carregamento tardio no prontuário.
- Imagens antigas e recursos sem uso removidos do repositório.
- Animação inicial preservada em quatro segundos, com a revelação do conteúdo principal concluída rapidamente.
- PDF continua usando importação dinâmica de `html2canvas` e `jsPDF`, evitando carregar cerca de 750 KB no primeiro acesso.
- SDK do Supabase removido do runtime enquanto a integração real ainda não existe.
- Dimensões, decodificação assíncrona e prioridade configuradas nas imagens principais.

## Acessibilidade

- Correção do atributo ARIA inválido encontrado no cadastro da foto de perfil.
- Link para pular diretamente ao conteúdo principal.
- Navegações identificadas e página ativa marcada com `aria-current`.
- Foco movido para o título ao trocar de tela.
- Modais com foco inicial, retorno do foco e contenção da tecla Tab.
- Campo de busca com nome acessível.
- Progresso do exercício com semântica de `progressbar`.
- Medidor do microfone com semântica de `meter` e retorno anunciado por leitor de tela.
- Botões de escolha com estado `aria-pressed` e reprodutores de áudio identificados.
- Auditoria Pa11y: 0 problemas.

## SEO técnico

- Título e descrição revisados.
- URL canônica definida para o GitHub Pages.
- Favicon e ícone para dispositivos Apple.
- Metadados Open Graph e Twitter Card com imagem 1200 × 630.
- Dados estruturados `SoftwareApplication` em JSON-LD.
- `robots.txt` e `sitemap.xml` publicados.
- Página pública mantida indexável.

## Responsividade validada

Foram testadas as larguras 360, 390, 768, 1024 e 1440 pixels na autenticação, dashboard e área de exercícios. Nenhuma das larguras apresentou rolagem horizontal ou conteúdo cortado.

## Comandos de validação

```bash
npm ci
npm run lint
npm test
npm run build
npm run verify:dist
```

Os relatórios JSON brutos do Lighthouse e do Pa11y são artefatos locais ignorados pelo Git em `output/phase06/`.
