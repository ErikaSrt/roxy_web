# Planejamento Scrum para o Trello - Projeto Roxy

> Organizacao incremental: listas, cartoes, comentarios, anexos e datas existentes representam o historico real do projeto e nao devem ser removidos. Quando ja existir um cartao equivalente, complemente-o com descricao, checklist, etiqueta e evidencia em vez de criar uma duplicata.

## Configuracao do quadro

Nome sugerido: `Roxy - Desenvolvimento do TCC`

Listas:

1. Visao do Produto
2. Sprint 0 - Descoberta e Prototipo
3. Sprint 1 - Fundacao e Pacientes
4. Sprint 2 - Exercicios e Prontuario
5. Sprint 3 - Dashboard, Busca e Audio
6. Sprint 4 - UX e Novos Exercicios
7. Sprint 5 - Qualidade e Responsividade
8. Backlog de Producao

Etiquetas:

- `UX/UI` - roxo
- `Frontend` - azul
- `Dados` - verde
- `Exercicios` - amarelo
- `Relatorios` - laranja
- `Qualidade` - vermelho
- `Documentacao` - cinza
- `Concluido` - verde-escuro

## Visao do Produto

### Card: Objetivo do Roxy

**Descricao:** Sistema web responsivo para apoiar atendimentos infantis de fonoaudiologia. A fonoaudiologa cadastra pacientes, conduz atividades, avalia respostas e acompanha resultados, audios e cartas colecionaveis no prontuario.

**Usuarios:** fonoaudiologa como usuaria principal; crianca como participante acompanhada durante os exercicios.

**Valor entregue:** organizacao clinica, atividades ludicas, historico de sessoes e incentivo infantil por recompensas visuais.

### Card: Definicao de Pronto

- Fluxo funciona sem erro no navegador.
- Interface se adapta a desktop e celular.
- Dados da sessao aparecem no prontuario correto.
- Exercicios possuem instrucao, avaliacao e resultado.
- `pnpm lint` e `pnpm build` passam.
- Alteracao e registrada no Git.

## Sprint 0 - Descoberta e Prototipo

**Objetivo:** definir problema, usuarios, escopo e identidade visual antes da implementacao.

### Card: Levantar requisitos do TCC

**Historia:** Como equipe, queremos entender o atendimento fonoaudiologico para construir um produto coerente com a rotina clinica.

**Tarefas realizadas:**

- Definicao de site responsivo.
- Identificacao da fonoaudiologa como usuaria principal.
- Definicao dos dados profissionais e do paciente.
- Definicao de avaliacao manual pela profissional.
- Definicao de gravacao de audio durante a sessao.
- Definicao de relatorios, historico e exportacao em PDF.

**Criterios de aceite:** requisitos documentados e validados com o fluxo do prototipo.

### Card: Criar fluxo e casos de uso

**Tarefas realizadas:** autenticacao, gestao de pacientes, cadastro, perfil, exercicios, conclusao, recompensas e navegacao foram organizados no diagrama de casos de uso.

**Criterios de aceite:** todos os fluxos principais possuem ator e resultado identificados.

### Card: Construir prototipo no Figma

**Tarefas realizadas:** telas de entrada, login, pacientes, cadastro, exclusao, categorias de exercicio, pratica, resultado e prontuario.

**Criterios de aceite:** identidade infantil-profissional com roxo, lilas, azul e mascote Roxy; navegacao consistente entre telas.

### Card: Definir sistema de cartas colecionaveis

**Historia:** Como crianca, quero receber uma carta surpresa ao finalizar uma atividade para me sentir recompensada.

**Criterios de aceite:** carta aparece somente no resultado e permanece visivel no prontuario.

## Sprint 1 - Fundacao e Pacientes

**Objetivo:** criar a base tecnica e permitir o cadastro e gerenciamento de pacientes.

### Card: Preparar projeto React e TypeScript

**Tarefas realizadas:** Vite, React, TypeScript, estilos globais, tipos de dominio, dados iniciais e scripts de desenvolvimento.

**Criterios de aceite:** projeto inicia com `pnpm dev` e gera build de producao.

**Evidencia:** commit `33c4430`.

### Card: Implementar autenticacao simples

**Tarefas realizadas:** splash animada, entrada, login por e-mail e cadastro da profissional com nome, e-mail, CRFa e telefone.

**Criterios de aceite:** profissional consegue criar perfil e acessar o sistema localmente.

### Card: Implementar gestao de pacientes

**Tarefas realizadas:** listagem, cadastro, edicao, exclusao, avatar padrao e selecao de paciente.

**Criterios de aceite:** todos os campos obrigatorios sao salvos e o paciente aparece na lista.

### Card: Implementar persistencia local

**Tarefas realizadas:** profissionais, pacientes e sessoes persistidos em `localStorage` para demonstracao sem backend.

**Criterios de aceite:** dados permanecem depois de atualizar a pagina.

### Card: Preparar estrutura do Supabase

**Tarefas realizadas:** cliente opcional, variaveis de ambiente e esquema SQL inicial.

**Criterios de aceite:** aplicacao funciona sem Supabase e possui caminho documentado para conexao futura.

## Sprint 2 - Exercicios e Prontuario

**Objetivo:** entregar o fluxo clinico principal, da atividade ao registro de resultado.

### Card: Criar catalogo inicial de exercicios

**Tarefas realizadas:** Repete Comigo, Rimas Divertidas, Monte Historias e Sons e Mais organizados em cards.

**Criterios de aceite:** fonoaudiologa escolhe um exercicio e inicia a pratica para o paciente ativo.

### Card: Implementar pratica com avaliacao manual

**Tarefas realizadas:** fila de quatro cards, instrucao, controle de microfone e botoes de avaliacao correto, incorreto e parcial.

**Criterios de aceite:** cada avaliacao e registrada e a pratica chega ao resultado final.

### Card: Entregar carta surpresa no resultado

**Tarefas realizadas:** carta associada ao exercicio, pontuacao, mensagem de conclusao e salvamento automatico.

**Criterios de aceite:** carta nao aparece antes do fim e fica associada a sessao.

### Card: Criar prontuario em Relatorios

**Tarefas realizadas:** dados clinicos, agenda, metricas, progresso, historico por sessao, cartas e exportacao em PDF.

**Criterios de aceite:** resultado do exercicio aparece no prontuario do paciente correto.

### Card: Criar modo de exclusao de pacientes

**Criterios de aceite:** modo de exclusao altera as acoes da lista e remove paciente e sessoes vinculadas.

## Sprint 3 - Dashboard, Busca e Audio

**Objetivo:** melhorar a operacao da fonoaudiologa e ampliar o acompanhamento clinico.

### Card: Criar dashboard clinico

**Tarefas realizadas:** total de pacientes, evolucao media, cartas, audios, progresso individual, sessoes recentes e atalhos de pratica.

**Criterios de aceite:** dashboard resume dados de todos os pacientes sem abrir cada prontuario.

**Evidencia:** commit `9bc3e94`.

### Card: Adicionar troca de paciente no menu

**Historia:** Como fonoaudiologa, quero trocar o paciente ativo pelo menu para nao interromper meu fluxo.

**Criterios de aceite:** alteracao atualiza exercicios e relatorios sem voltar para a listagem.

### Card: Corrigir busca de pacientes

**Tarefas realizadas:** busca normalizada por nome, ID, nascimento, responsaveis, telefone, diagnostico, agenda e exercicios.

**Criterios de aceite:** resultados sao filtrados enquanto a profissional digita e existe estado vazio.

### Card: Implementar gravacao de audio

**Tarefas realizadas:** permissao de microfone, `MediaRecorder`, deteccao de intensidade, limite de gravacao, reproducao e liberacao da avaliacao.

**Criterios de aceite:** audio pode ser gravado, ouvido e associado ao card e a sessao.

### Card: Exibir audios no dashboard e prontuario

**Criterios de aceite:** audios de sessoes concluidas ficam disponiveis para revisao clinica posterior.

## Sprint 4 - UX e Novos Exercicios

**Objetivo:** aproximar o produto do Figma e tornar as atividades mais variadas e funcionais.

### Card: Alinhar interface ao prototipo do Figma

**Tarefas realizadas:** proporcoes do menu, cards compactos, hierarquia de titulos, cores, espacamentos e icones por categoria.

**Criterios de aceite:** telas preservam a identidade do prototipo e continuam responsivas.

**Evidencia:** commit `920fdde`.

### Card: Expandir catalogo para oito exercicios

**Tarefas realizadas:** Nomeie a Imagem, Complete a Frase, Sequencia Sonora e Sopro e Respiracao.

**Criterios de aceite:** oito exercicios aparecem no catalogo e podem ser iniciados.

### Card: Diferenciar mecanicas dos exercicios

**Tarefas realizadas:** atividades de fala usam microfone; rimas, sons e frases usam alternativas; narrativas usam gravacao e avaliacao manual.

**Criterios de aceite:** exercicios nao reutilizam indevidamente o mesmo comportamento.

### Card: Ocultar recompensa durante a pratica

**Criterios de aceite:** nenhuma carta ou miniatura e revelada na selecao ou durante os cards; a surpresa ocorre no resultado.

## Sprint 5 - Qualidade e Responsividade

**Objetivo:** corrigir regras clinicas, otimizar mobile e finalizar a identidade visual.

### Card: Registrar conclusao parcial

**Tarefas realizadas:** avaliacao incorreta ou parcial avanca ao proximo card, pontuacao real e calculada e itens para retomada sao salvos.

**Criterios de aceite:** exemplo com um erro gera `3/4`, `75%` e observacao de conclusao parcial no prontuario.

**Evidencia:** commit `8190bcd`.

### Card: Otimizar interface mobile

**Tarefas realizadas:** ajustes entre 320 e 620 px, menu compacto, cards fluidos, alternativas em coluna, controles de toque, formulario e resultado sem overflow.

**Criterios de aceite:** nao existe rolagem horizontal e as tarefas principais funcionam em celular.

**Evidencia:** commit `01d4fd1`.

### Card: Aplicar logo transparente

**Tarefas realizadas:** substituicao da logo, remocao de fundo e moldura quadrada, `drop-shadow` no desenho e proporcoes para desktop e mobile.

**Criterios de aceite:** logo aparece sem caixa branca no splash, login e menu.

**Evidencia:** commit `b7a6fdd`.

### Card: Validar qualidade tecnica

**Tarefas realizadas:** verificacoes recorrentes com TypeScript, Oxlint, build do Vite e testes manuais no navegador.

**Criterios de aceite:** `pnpm lint` e `pnpm build` executam sem erros.

## Backlog de Producao

Os itens abaixo nao devem ser apresentados como funcionalidades concluidas. Eles dependem de infraestrutura, validacao de seguranca ou definicao legal antes do uso clinico real.

### Card: Conectar Supabase Auth e banco real

- Login seguro por profissional.
- Persistencia de pacientes e sessoes no banco.
- Row Level Security por fonoaudiologa.
- Migracao dos dados locais.

### Card: Migrar audios para Supabase Storage

- Upload seguro.
- Politica de retencao e exclusao.
- Reproducao por URL protegida.
- Consentimento para armazenamento.

### Card: Finalizar LGPD e documentos legais

- Termos de uso.
- Politica de privacidade.
- Consentimento dos responsaveis.
- Exclusao e exportacao de dados.
- Plano de backups.

### Card: Criar testes automatizados

- Testes de componentes.
- Fluxo de cadastro.
- Busca.
- Avaliacao completa e parcial.
- Exportacao de relatorio.

### Card: Configurar contatos da tela inicial

- Suporte por e-mail.
- Modal Sobre o Roxy e sua criadora.
- Link do consultor pelo WhatsApp.

### Card: Publicar ambiente de homologacao

- Configurar variaveis de ambiente.
- Gerar build.
- Hospedar aplicacao.
- Executar roteiro de aceite em desktop e mobile.

## Cerimonias sugeridas

- **Planejamento:** selecionar objetivo e cards da sprint.
- **Daily:** registrar feito, proximo passo e impedimentos.
- **Revisao:** demonstrar os criterios de aceite ao orientador.
- **Retrospectiva:** registrar o que funcionou, dificuldades e melhoria para a proxima sprint.
- **Refinamento:** detalhar os cards futuros antes do planejamento.
