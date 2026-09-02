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
6. Usa o microfone apenas como apoio visual/deteccao de som durante a sessao.
7. Avalia manualmente cada card como OK, repetir ou rever depois.
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

## Avaliacao

Cada card pode receber:

- OK: resposta aceita.
- Repetir: volta para o final da fila.
- Rever depois: tambem volta para o final da fila.

O exercicio termina quando todos os cards recebem OK.

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
- Exportacao em PDF.

## Requisitos de Privacidade

Como o sistema envolve dados infantis e clinicos, uma versao de producao deve considerar:

- Termos de uso.
- Politica de privacidade.
- Controle de acesso por fonoaudiologa.
- Protecao de dados sensiveis.
- Exclusao de dados sob solicitacao.
- Backups.
- Adequacao a LGPD.
