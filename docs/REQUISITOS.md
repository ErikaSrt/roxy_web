# Requisitos do Projeto

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
