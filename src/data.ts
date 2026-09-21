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
  { id: 'explorador-palavras', name: 'Explorador de Palavras', exerciseId: 'nomeie-imagem', image: '/assets/card-super-falante.jpg', color: '#7d69dc' },
  { id: 'mestre-frases', name: 'Mestre das Frases', exerciseId: 'complete-frase', image: '/assets/card-falar-expressar.jpg', color: '#ef7f9f' },
  { id: 'ouvido-atento', name: 'Ouvido Atento', exerciseId: 'sequencia-sonora', image: '/assets/card-bom-ouvinte.jpg', color: '#3ba2db' },
  { id: 'respiracao-calma', name: 'Respiração Calma', exerciseId: 'sopro-respiracao', image: '/assets/card-super-falante.jpg', color: '#57b995' },
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
    mode: 'voice',
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
    mode: 'choice',
    prompts: [
      { id: 'pato-gato', title: 'O que rima com pato?', instruction: 'A criança escolhe uma palavra.', visualLabel: 'PATO', options: ['Gato', 'Casa', 'Bola'], correctOption: 'Gato' },
      { id: 'bola-cola', title: 'O que rima com bola?', instruction: 'Escolha o final que combina.', visualLabel: 'BOLA', options: ['Lua', 'Cola', 'Pão'], correctOption: 'Cola' },
      { id: 'mao-pao', title: 'O que rima com mão?', instruction: 'Escute e compare o som final.', visualLabel: 'MÃO', options: ['Sol', 'Pão', 'Flor'], correctOption: 'Pão' },
      { id: 'flor-amor', title: 'O que rima com flor?', instruction: 'Encontre o par correto.', visualLabel: 'FLOR', options: ['Pipa', 'Amor', 'Gato'], correctOption: 'Amor' },
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
    mode: 'narrative',
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
    mode: 'choice',
    prompts: [
      { id: 'alto-baixo', title: 'Som forte ou fraco?', instruction: 'A fono produz um som e a criança identifica.', visualLabel: 'VOLUME', options: ['Forte', 'Fraco'] },
      { id: 'longo-curto', title: 'Som longo ou curto?', instruction: 'Compare a duração do som apresentado.', visualLabel: 'DURAÇÃO', options: ['Longo', 'Curto'] },
      { id: 'igual-diferente', title: 'Os sons são iguais?', instruction: 'A fono apresenta dois sons para comparar.', visualLabel: '♪  ♪', options: ['Iguais', 'Diferentes'] },
      { id: 'sequencia', title: 'Qual foi a sequência?', instruction: 'Escolha a ordem que foi apresentada.', visualLabel: 'MEMÓRIA', options: ['TA - PA - TA', 'PA - TA - PA', 'TA - TA - PA'] },
    ],
  },
  {
    id: 'nomeie-imagem', name: 'Nomeie a Imagem', shortName: 'Vocabulário',
    description: 'Apresente pistas visuais para estimular nomeação, acesso lexical e clareza.',
    clinicalGoal: 'Vocabulário expressivo e acesso lexical.', accent: '#7d69dc',
    badgeId: 'explorador-palavras', badgeLabel: 'Carta Roxy: explorador de palavras', mode: 'voice',
    prompts: [
      { id: 'nomear-1', title: 'Borboleta', instruction: 'Diga o nome e uma característica.', visualLabel: 'BORBOLETA' },
      { id: 'nomear-2', title: 'Bicicleta', instruction: 'Nomeie e diga para que serve.', visualLabel: 'BICICLETA' },
      { id: 'nomear-3', title: 'Elefante', instruction: 'Nomeie e imite seu som.', visualLabel: 'ELEFANTE' },
      { id: 'nomear-4', title: 'Janela', instruction: 'Nomeie e use a palavra em uma frase.', visualLabel: 'JANELA' },
    ],
  },
  {
    id: 'complete-frase', name: 'Complete a Frase', shortName: 'Linguagem',
    description: 'A criança escolhe a palavra que completa corretamente cada situação.',
    clinicalGoal: 'Compreensão, sintaxe e construção de frases.', accent: '#ef7f9f',
    badgeId: 'mestre-frases', badgeLabel: 'Carta Roxy: mestre das frases', mode: 'choice',
    prompts: [
      { id: 'frase-1', title: 'Eu bebo água no...', instruction: 'Escolha a palavra que completa a frase.', visualLabel: 'EU BEBO ÁGUA NO...', options: ['Copo', 'Sapato', 'Livro'], correctOption: 'Copo' },
      { id: 'frase-2', title: 'O cachorro gosta de...', instruction: 'Complete a ideia.', visualLabel: 'O CACHORRO GOSTA DE...', options: ['Brincar', 'Voar', 'Ler'], correctOption: 'Brincar' },
      { id: 'frase-3', title: 'Quando chove eu uso...', instruction: 'Escolha a resposta adequada.', visualLabel: 'QUANDO CHOVE...', options: ['Guarda-chuva', 'Garfo', 'Travesseiro'], correctOption: 'Guarda-chuva' },
      { id: 'frase-4', title: 'À noite eu vou...', instruction: 'Finalize a frase.', visualLabel: 'À NOITE EU VOU...', options: ['Dormir', 'Almoçar', 'Nadar'], correctOption: 'Dormir' },
    ],
  },
  {
    id: 'sequencia-sonora', name: 'Sequência Sonora', shortName: 'Memória',
    description: 'Treine memória auditiva reproduzindo sequências curtas de sílabas.',
    clinicalGoal: 'Memória auditiva, ritmo e processamento sequencial.', accent: '#3f8fe5',
    badgeId: 'ouvido-atento', badgeLabel: 'Carta Roxy: ouvido atento', mode: 'voice',
    prompts: [
      { id: 'seq-1', title: 'PA - TA', instruction: 'Repita na mesma ordem.', visualLabel: 'PA  •  TA' },
      { id: 'seq-2', title: 'MA - LA - PA', instruction: 'Repita mantendo o ritmo.', visualLabel: 'MA  •  LA  •  PA' },
      { id: 'seq-3', title: 'SA - FA - RA', instruction: 'Escute e repita com calma.', visualLabel: 'SA  •  FA  •  RA' },
      { id: 'seq-4', title: 'PA - CA - TA - LA', instruction: 'Repita toda a sequência.', visualLabel: 'PA  •  CA  •  TA  •  LA' },
    ],
  },
  {
    id: 'sopro-respiracao', name: 'Sopro e Respiração', shortName: 'Respiração',
    description: 'Conduza ciclos curtos de inspiração e sopro com ritmo visual.',
    clinicalGoal: 'Coordenação pneumofonoarticulatória e controle respiratório.', accent: '#57b995',
    badgeId: 'respiracao-calma', badgeLabel: 'Carta Roxy: respiração calma', mode: 'breathing',
    prompts: [
      { id: 'sopro-1', title: 'Cheire a flor', instruction: 'Inspire pelo nariz durante três segundos.', visualLabel: 'INSPIRAR', helper: '3 segundos' },
      { id: 'sopro-2', title: 'Apague a vela', instruction: 'Solte o ar devagar pela boca.', visualLabel: 'SOPRAR', helper: '4 segundos' },
      { id: 'sopro-3', title: 'Encha o balão', instruction: 'Faça um sopro contínuo e controlado.', visualLabel: 'SOPRO LONGO', helper: '5 segundos' },
      { id: 'sopro-4', title: 'Respiração tranquila', instruction: 'Inspire e expire mantendo o ritmo.', visualLabel: 'INSPIRA  •  EXPIRA', helper: '2 ciclos' },
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
