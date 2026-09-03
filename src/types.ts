export type AppView = 'dashboard' | 'patients' | 'patient-form' | 'exercises' | 'practice' | 'result' | 'reports'

export type ExerciseId = 'repete-comigo' | 'rimas-divertidas' | 'monte-historias' | 'sons-e-mais'

export type Rating = 'ok' | 'retry' | 'later'

export interface Professional {
  name: string
  email: string
  crfa: string
  phone: string
}

export interface Patient {
  id: string
  name: string
  birthDate: string
  guardians: string
  phone: string
  diagnosis: string
  exercises: ExerciseId[]
  sessionDay: string
  sessionTime: string
  createdAt: string
}

export interface ExercisePrompt {
  id: string
  title: string
  instruction: string
  visualLabel: string
  helper?: string
}

export interface Exercise {
  id: ExerciseId
  name: string
  shortName: string
  description: string
  clinicalGoal: string
  accent: string
  badgeId: string
  badgeLabel: string
  prompts: ExercisePrompt[]
}

export interface Badge {
  id: string
  name: string
  exerciseId: ExerciseId
  image: string
  color: string
  earnedAt?: string
}

export interface PromptAttempt {
  promptId: string
  title: string
  rating: Rating
  attempts: number
}

export interface AudioClip {
  id: string
  promptId: string
  promptTitle: string
  dataUrl: string
  mimeType: string
  durationMs: number
  createdAt: string
}

export interface SessionRecord {
  id: string
  patientId: string
  exerciseId: ExerciseId
  exerciseName: string
  date: string
  score: number
  total: number
  notes: string
  badge: Badge
  attempts: PromptAttempt[]
  audioClips?: AudioClip[]
}
