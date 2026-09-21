# Requisitos do Projeto

## Status do Documento

- **Versao:** 1.1
- **Atualizado em:** setembro de 2026
- **Estado do produto:** prototipo funcional avancado para demonstracao academica
- **Persistencia atual:** navegador (`localStorage`)
- **Persistencia planejada:** Supabase Auth, Database e Storage

## Legenda de Status

- **Implementado:** disponivel na aplicacao atual.
- **Parcial:** funciona no modo local, mas precisa de infraestrutura ou seguranca adicional para producao.
- **Planejado:** ainda faz parte do backlog.

## Matriz de Requisitos Funcionais

| ID | Requisito | Status |
| --- | --- | --- |
| RF01 | Login e cadastro simples da fonoaudiologa | Implementado |
| RF02 | Cadastro, edicao, busca e exclusao de pacientes | Implementado |
| RF03 | Troca do paciente ativo pelo menu | Implementado |
| RF04 | Dashboard clinico com visao geral dos pacientes | Implementado |
| RF05 | Catalogo com oito exercicios terapeuticos | Implementado |
| RF06 | Captura de microfone, deteccao de som e avaliacao manual | Implementado |
| RF07 | Registro de resultado completo ou parcial | Implementado |
| RF08 | Carta colecionavel surpresa ao concluir exercicio | Implementado |
| RF09 | Prontuario com historico, progresso, cartas e audios | Implementado |
| RF10 | Exportacao do prontuario em PDF | Implementado |
| RF11 | Persistencia dos dados entre acessos no mesmo navegador | Implementado |
| RF12 | Autenticacao real e isolamento dos dados por profissional | Planejado |
| RF13 | Persistencia remota de pacientes, sessoes e prontuarios | Planejado |
| RF14 | Armazenamento seguro de audios no Supabase Storage | Planejado |
| RF15 | Suporte por e-mail, apresentacao do Roxy e contato por WhatsApp | Implementado |
| RF16 | Exclusao individual de audios salvos pelo dashboard | Implementado |

## Objetivo

Construir um site responsivo para atendimentos infantis de fonoaudiologia, mantendo uma experiencia profissional para a fonoaudiologa e ludica para a crianca durante os exercicios.

## Usuarios

### Fonoaudiologa

Usuario principal do sistema. Ela acessa a plataforma, cadastra pacientes, inicia exercicios, avalia respostas e acompanha o prontuario.

### Crianca/Paciente

Participa apenas durante os exercicios, acompanhando os cards, repetindo palavras, criando respostas orais e recebendo cartas do mascote ao final.

## Fluxo Principal

1. A fonoaudiologa acessa a tela inicial.
2. Faz login ou cria uma conta simples.
3. Cadastra ou seleciona um paciente.
4. Escolhe um exercicio.
5. Conduz a pratica com a crianca.
6. Usa o microfone para gravar a resposta da crianca e detectar som durante a sessao.
7. Avalia manualmente cada card como correto, incorreto ou parcial.
8. Ao concluir, o paciente recebe uma carta colecionavel do mascote Roxy.
9. O resultado fica salvo no prontuario em Relatorios.
10. A fonoaudiologa pode exportar o prontuario em PDF.

## Cadastro da Fonoaudiologa

Campos:

- Nome
- E-mail
- CRFa
- Telefone

## Cadastro de Paciente

Campos obrigatorios:

- Nome completo
- Data de nascimento
- Responsaveis
- Telefone
- Diagnostico ou queixa principal
- Exercicios a trabalhar
- Dia da sessao
- Horario da sessao

## Exercicios

### Repete Comigo

Aparece um card com a palavra que a crianca deve repetir. A fonoaudiologa ativa o microfone, observa a resposta e avalia manualmente.

### Rimas Divertidas

Palavras variadas aparecem na tela e a crianca deve identificar quais rimam. A avaliacao segue o mesmo modelo manual.

### Monte Historias

O sistema apresenta palavras como pistas e a crianca monta uma historia oral com base nelas. A fonoaudiologa avalia a resposta.

### Sons e Mais

A crianca identifica sons, ritmos e pistas auditivas com apoio da terapeuta. A avaliacao tambem e manual.

### Nomeie a Imagem

A crianca nomeia palavras apresentadas e amplia a resposta com caracteristicas, funcoes ou frases.

### Complete a Frase

A crianca escolhe entre alternativas para completar corretamente uma frase ou situacao.

### Sequencia Sonora

A crianca escuta e reproduz sequencias curtas de silabas, trabalhando memoria auditiva e ritmo.

### Sopro e Respiracao

A fonoaudiologa conduz ciclos de inspiracao e sopro para trabalhar coordenacao respiratoria.

## Avaliacao

Cada card pode receber:

- Correto: resposta aceita e contabilizada como acerto.
- Incorreto: resposta registrada para retomada clinica.
- Parcial: desempenho intermediario registrado para acompanhamento.

Todas as avaliacoes avancam para o proximo card. Ao final, o sistema calcula a pontuacao e o percentual real. Quando o resultado for menor que 100%, o prontuario informa que a conclusao foi parcial e lista os itens que precisam ser retomados.

## Emblemas e Figurinhas

Cada exercicio concluido gera sempre uma carta do mascote Roxy. A carta nao depende da pontuacao e aparece como recompensa surpresa apenas no final do exercicio.

As cartas conquistadas ficam visiveis no prontuario do paciente, dentro de Relatorios.

## Relatorios e Prontuario

O prontuario deve apresentar:

- Dados do paciente.
- Quantidade de sessoes.
- Quantidade de cartas conquistadas.
- Evolucao percentual.
- Progresso por area.
- Informacoes clinicas.
- Historico de sessoes.
- Emblemas/cartas colecionadas.
- Audios gravados durante os exercicios para revisao posterior.
- Exportacao em PDF.

## Dashboard da Fonoaudiologa

O dashboard deve permitir que a fonoaudiologa visualize:

- Total de pacientes.
- Evolucao media.
- Cartas entregues.
- Audios salvos.
- Progresso individual de cada paciente.
- Ultimas sessoes realizadas.
- Atalhos para abrir prontuario e iniciar exercicio.

## Menu e Navegacao

O menu deve conter a troca de paciente ativo, permitindo alternar entre pacientes sem precisar voltar para a tela de listagem.

## Busca

A busca da lista de pacientes deve localizar resultados por:

- Nome.
- ID.
- Responsaveis.
- Telefone.
- Diagnostico ou queixa.
- Dia e horario de sessao.
- Exercicios indicados.

## Requisitos de Privacidade

Como o sistema envolve dados infantis e clinicos, uma versao de producao deve considerar:

- Termos de uso.
- Politica de privacidade.
- Controle de acesso por fonoaudiologa.
- Protecao de dados sensiveis.
- Exclusao de dados sob solicitacao.
- Backups.
- Adequacao a LGPD.

## Requisitos Nao Funcionais

- **RNF01 - Responsividade:** os fluxos principais devem funcionar a partir de 320 px, sem rolagem horizontal.
- **RNF02 - Compatibilidade:** a captura de audio depende de navegador compativel com `MediaRecorder` e permissao de microfone.
- **RNF03 - Usabilidade:** a fonoaudiologa deve conseguir trocar o paciente ativo sem interromper o fluxo de atendimento.
- **RNF04 - Acessibilidade:** botoes e campos devem possuir rotulos compreensiveis, foco visivel e area de toque adequada.
- **RNF05 - Desempenho:** a interface deve responder imediatamente a busca, navegacao e avaliacao no conjunto de dados local.
- **RNF06 - Seguranca de producao:** dados clinicos e infantis nao devem depender apenas de `localStorage`.
- **RNF07 - Rastreabilidade:** cada sessao deve registrar paciente, exercicio, data, pontuacao, tentativas, observacoes, carta e audios associados.

## Regras de Negocio

- **RN01:** apenas a fonoaudiologa opera o sistema; a crianca participa acompanhando os exercicios.
- **RN02:** cada card recebe uma unica avaliacao final: correto, incorreto ou parcial.
- **RN03:** qualquer avaliacao avanca para o card seguinte; itens incorretos nao retornam automaticamente na mesma sessao.
- **RN04:** correto vale um ponto; parcial e incorreto ficam registrados para retomada e nao contam como acerto integral.
- **RN05:** todo exercicio finalizado entrega uma carta, independentemente da pontuacao.
- **RN06:** a carta permanece oculta no catalogo e durante a pratica, sendo revelada apenas no resultado.
- **RN07:** resultados abaixo de 100% devem ser registrados como conclusao parcial no prontuario.

## Limitacoes Conhecidas

- O login atual e demonstrativo e nao valida credenciais em um servidor.
- Os dados ficam restritos ao navegador e dispositivo utilizados.
- Audios em `dataUrl` podem atingir o limite de armazenamento do navegador em sessoes extensas.
- Limpar os dados do navegador remove pacientes, sessoes e audios locais.
- A estrutura Supabase existe, mas ainda nao substitui a persistencia local da interface.
- Termos de uso, politica de privacidade, consentimento e politicas RLS finais ainda precisam ser aprovados antes de uso clinico real.
