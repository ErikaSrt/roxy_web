import type { Badge, Exercise, Patient } from './types'

export const ROXY_LOGO = '/assets/roxy-logo-enhanced.png'

export const badges: Badge[] = [
  {
    id: 'super-falante',
    name: 'Super Falante',
    exerciseId: 'repete-comigo',
    image: '/assets/card-super-falante.jpg',
    color: '#9b74ff',
  },
  {
    id: 'bom-ouvinte',
    name: 'Bom Ouvinte',
    exerciseId: 'sons-e-mais',
    image: '/assets/card-bom-ouvinte.jpg',
    color: '#3ba2db',
  },
  {
    id: 'fala-expressiva',
    name: 'Fala Expressiva',
    exerciseId: 'rimas-divertidas',
    image: '/assets/card-falar-expressar.jpg',
    color: '#ef6f9d',
  },
  {
    id: 'contador-historias',
    name: 'Contador de Histórias',
    exerciseId: 'monte-historias',
    image: '/assets/card-super-falante.jpg',
    color: '#f2b63f',
  },
]

export const exercises: Exercise[] = [
  {
    id: 'repete-comigo',
    name: 'Repete Comigo',
    shortName: 'Pronúncia',
    description: 'Treine a repetição de palavras e fonemas com avaliação manual da fonoaudióloga.',
    clinicalGoal: 'Articulação, repetição e clareza na fala.',
    accent: '#8f79ff',
    badgeId: 'super-falante',
    badgeLabel: 'Carta Roxy: comunicar é mágico',
    prompts: [
      { id: 'cao', title: 'Cão', instruction: 'Repita a palavra com calma.', visualLabel: 'CÃO', helper: 'Fonema inicial /k/' },
      { id: 'bola', title: 'Bola', instruction: 'Fale olhando para a imagem.', visualLabel: 'BOLA', helper: 'Bilabial /b/' },
      { id: 'sapo', title: 'Sapo', instruction: 'Repita a palavra inteira.', visualLabel: 'SAPO', helper: 'Sibilante /s/' },
      { id: 'rato', title: 'Rato', instruction: 'Capriche no som do R.', visualLabel: 'RATO', helper: 'Vibrante /r/' },
    ],
  },
  {
    id: 'rimas-divertidas',
    name: 'Rimas Divertidas',
    shortName: 'Rimas',
    description: 'A criança encontra pares de palavras que combinam no som final.',
    clinicalGoal: 'Consciência fonológica e discriminação auditiva.',
    accent: '#3ca2db',
    badgeId: 'fala-expressiva',
    badgeLabel: 'Carta Roxy: falar é se expressar',
    prompts: [
      { id: 'pato-gato', title: 'Pato rima com gato', instruction: 'Encontre a palavra que rima.', visualLabel: 'PATO  GATO  CASA', helper: 'Resposta esperada: gato' },
      { id: 'bola-cola', title: 'Bola rima com cola', instruction: 'Escolha o par que termina igual.', visualLabel: 'BOLA  COLA  LUA', helper: 'Resposta esperada: cola' },
      { id: 'mao-pao', title: 'Mão rima com pão', instruction: 'Escute o som final.', visualLabel: 'MÃO  PÃO  SOL', helper: 'Resposta esperada: pão' },
      { id: 'flor-amor', title: 'Flor rima com amor', instruction: 'Diga o par em voz alta.', visualLabel: 'FLOR  AMOR  PIPA', helper: 'Resposta esperada: amor' },
    ],
  },
  {
    id: 'monte-historias',
    name: 'Monte Histórias',
    shortName: 'Histórias',
    description: 'Palavras aparecem como pistas para a criança montar uma pequena história oral.',
    clinicalGoal: 'Narrativa, organização de ideias e vocabulário.',
    accent: '#f3b23f',
    badgeId: 'contador-historias',
    badgeLabel: 'Carta Roxy: cada palavra vira história',
    prompts: [
      { id: 'praia', title: 'Praia, bola e sorvete', instruction: 'Conte uma história usando as três palavras.', visualLabel: 'PRAIA  BOLA  SORVETE' },
      { id: 'floresta', title: 'Gato, árvore e chuva', instruction: 'Monte uma história com começo, meio e fim.', visualLabel: 'GATO  ÁRVORE  CHUVA' },
      { id: 'escola', title: 'Escola, amigo e livro', instruction: 'Inclua uma ação para cada palavra.', visualLabel: 'ESCOLA  AMIGO  LIVRO' },
      { id: 'festa', title: 'Festa, música e bolo', instruction: 'Fale a história em voz alta.', visualLabel: 'FESTA  MÚSICA  BOLO' },
    ],
  },
  {
    id: 'sons-e-mais',
    name: 'Sons e Mais',
    shortName: 'Escuta',
    description: 'A criança identifica sons, ritmos e pistas auditivas com apoio da terapeuta.',
    clinicalGoal: 'Atenção auditiva, escuta ativa e discriminação de sons.',
    accent: '#72bd6a',
    badgeId: 'bom-ouvinte',
    badgeLabel: 'Carta Roxy: ouvir com atenção',
    prompts: [
      { id: 'alto-baixo', title: 'Som alto ou baixo', instruction: 'Identifique a intensidade do som.', visualLabel: 'ALTO  BAIXO' },
      { id: 'longo-curto', title: 'Som longo ou curto', instruction: 'Diga se o som demorou ou foi rápido.', visualLabel: 'LONGO  CURTO' },
      { id: 'igual-diferente', title: 'Igual ou diferente', instruction: 'Compare os dois sons.', visualLabel: 'IGUAL  DIFERENTE' },
      { id: 'sequencia', title: 'Sequência de sons', instruction: 'Repita a ordem que ouviu.', visualLabel: 'TA  PA  TA' },
    ],
  },
]

export const samplePatients: Patient[] = [
  {
    id: 'ROX-0010',
    name: 'João Vitor',
    birthDate: '2018-04-12',
    guardians: 'Carla e Rafael',
    phone: '(11) 98888-1010',
    diagnosis: 'Trocas articulatórias em fonemas /r/ e /s/.',
    exercises: ['repete-comigo', 'rimas-divertidas'],
    sessionDay: 'Terça-feira',
    sessionTime: '14:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ROX-0007',
    name: 'Mariana',
    birthDate: '2019-09-21',
    guardians: 'Bianca',
    phone: '(11) 97777-0707',
    diagnosis: 'Estímulo de linguagem oral e consciência fonológica.',
    exercises: ['rimas-divertidas', 'monte-historias'],
    sessionDay: 'Quinta-feira',
    sessionTime: '10:30',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ROX-0013',
    name: 'Maria Eduarda',
    birthDate: '2017-01-30',
    guardians: 'Patricia',
    phone: '(11) 96666-1313',
    diagnosis: 'Acompanhamento de fluência e organização narrativa.',
    exercises: ['monte-historias', 'sons-e-mais'],
    sessionDay: 'Sexta-feira',
    sessionTime: '16:00',
    createdAt: new Date().toISOString(),
  },
]

export function getExercise(id: string) {
  return exercises.find((exercise) => exercise.id === id)
}

export function getBadge(id: string) {
  return badges.find((badge) => badge.id === id)
}
