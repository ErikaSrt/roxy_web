import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  Download,
  FileText,
  Gamepad2,
  Heart,
  LogOut,
  Mic,
  PlusCircle,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import './App.css'
import { ROXY_LOGO, badges, exercises, getBadge, getExercise, samplePatients } from './data'
import { createId, useStoredState } from './storage'
import type { AppView, Exercise, ExerciseId, Patient, Professional, PromptAttempt, Rating, SessionRecord } from './types'

const emptyProfessional: Professional = {
  name: '',
  email: '',
  crfa: '',
  phone: '',
}

const emptyPatient: Patient = {
  id: '',
  name: '',
  birthDate: '',
  guardians: '',
  phone: '',
  diagnosis: '',
  exercises: [],
  sessionDay: '',
  sessionTime: '',
  createdAt: '',
}

const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
  patients: {
    title: 'Meus Pacientes',
    subtitle: 'Gerencie e acompanhe o progresso clínico dos pacientes ativos.',
  },
  'patient-form': {
    title: 'Cadastro de Paciente',
    subtitle: 'Adicione os dados essenciais para iniciar o acompanhamento.',
  },
  exercises: {
    title: 'Exercícios de Fonoaudiologia',
    subtitle: 'Escolha uma prática para conduzir durante a consulta.',
  },
  practice: {
    title: 'Prática de Pronúncia',
    subtitle: 'A criança fala, o sistema detecta som e a avaliação fica com a fonoaudióloga.',
  },
  result: {
    title: 'Resultados da Prática',
    subtitle: 'Feedback, pontuação e carta conquistada no exercício.',
  },
  reports: {
    title: 'Relatórios / Prontuário',
    subtitle: 'Histórico clínico, progresso e emblemas colecionáveis do paciente.',
  },
}

function App() {
  const [professional, setProfessional] = useStoredState<Professional | null>('roxy.professional', null)
  const [patients, setPatients] = useStoredState<Patient[]>('roxy.patients', samplePatients)
  const [sessions, setSessions] = useStoredState<SessionRecord[]>('roxy.sessions', [])
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState<'landing' | 'email' | 'create'>(professional ? 'landing' : 'create')
  const [view, setView] = useState<AppView>('patients')
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? '')
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState<ExerciseId>('repete-comigo')
  const [practiceQueue, setPracticeQueue] = useState<Exercise['prompts']>([])
  const [attemptLog, setAttemptLog] = useState<Record<string, PromptAttempt>>({})
  const [soundStatus, setSoundStatus] = useState<'idle' | 'listening' | 'detected' | 'silent' | 'unavailable'>('idle')
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId],
  )

  const selectedExercise = getExercise(selectedExerciseId) ?? exercises[0]
  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const patientSessions = sessions.filter((session) => session.patientId === selectedPatient?.id)
  const earnedBadges = patientSessions.map((session) => session.badge)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowSplash(false), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [])

  function openPatientForm(patient?: Patient) {
    setEditingPatientId(patient?.id ?? null)
    setView('patient-form')
  }

  function savePatient(patient: Patient) {
    if (editingPatientId) {
      setPatients((current) => current.map((item) => (item.id === editingPatientId ? patient : item)))
    } else {
      setPatients((current) => [patient, ...current])
    }

    setSelectedPatientId(patient.id)
    setEditingPatientId(null)
    setView('patients')
  }

  function deletePatient(patientId: string) {
    setPatients((current) => current.filter((patient) => patient.id !== patientId))
    setSessions((current) => current.filter((session) => session.patientId !== patientId))
    if (selectedPatientId === patientId) {
      const nextPatient = patients.find((patient) => patient.id !== patientId)
      setSelectedPatientId(nextPatient?.id ?? '')
    }
  }

  function startPractice(exerciseId: ExerciseId) {
    const exercise = getExercise(exerciseId) ?? exercises[0]
    setSelectedExerciseId(exerciseId)
    setPracticeQueue([...exercise.prompts])
    setAttemptLog({})
    setSoundStatus('idle')
    setView('practice')
  }

  async function listenForSound() {
    setSoundStatus('listening')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      const data = new Uint8Array(analyser.fftSize)
      let peak = 0

      source.connect(analyser)

      await new Promise<void>((resolve) => {
        const startedAt = performance.now()
        const measure = () => {
          analyser.getByteTimeDomainData(data)
          for (const value of data) {
            peak = Math.max(peak, Math.abs(value - 128) / 128)
          }

          if (performance.now() - startedAt > 1500) {
            resolve()
            return
          }

          requestAnimationFrame(measure)
        }

        measure()
      })

      stream.getTracks().forEach((track) => track.stop())
      await audioContext.close()
      setSoundStatus(peak > 0.03 ? 'detected' : 'silent')
    } catch {
      setSoundStatus('unavailable')
    }
  }

  function evaluateCurrent(rating: Rating) {
    const currentPrompt = practiceQueue[0]
    if (!currentPrompt || !selectedPatient) return

    const nextLog = {
      ...attemptLog,
      [currentPrompt.id]: {
        promptId: currentPrompt.id,
        title: currentPrompt.title,
        rating,
        attempts: (attemptLog[currentPrompt.id]?.attempts ?? 0) + 1,
      },
    }

    setAttemptLog(nextLog)

    if (rating === 'ok') {
      const remaining = practiceQueue.slice(1)
      if (remaining.length === 0) {
        finishPractice(nextLog)
        return
      }

      setPracticeQueue(remaining)
    } else {
      setPracticeQueue([...practiceQueue.slice(1), currentPrompt])
    }

    setSoundStatus('idle')
  }

  function finishPractice(finalLog: Record<string, PromptAttempt>) {
    if (!selectedPatient) return

    const badge = getBadge(selectedExercise.badgeId) ?? badges[0]
    const now = new Date().toISOString()
    const record: SessionRecord = {
      id: createId('SES'),
      patientId: selectedPatient.id,
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      date: now,
      score: selectedExercise.prompts.length,
      total: selectedExercise.prompts.length,
      notes: 'Exercício concluído com avaliação manual. Áudio usado apenas durante a sessão.',
      badge: { ...badge, earnedAt: now },
      attempts: selectedExercise.prompts.map((prompt) => finalLog[prompt.id]),
    }

    setLastSession(record)
    setSessions((current) => [record, ...current])
    setView('result')
  }

  async function exportReport() {
    if (!reportRef.current || !selectedPatient) return
    setExporting(true)

    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#f6f3fc', scale: 2 })
      const image = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imageHeight = (canvas.height * pageWidth) / canvas.width
      let heightLeft = imageHeight
      let position = 0

      pdf.addImage(image, 'PNG', 0, position, pageWidth, imageHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imageHeight
        pdf.addPage()
        pdf.addImage(image, 'PNG', 0, position, pageWidth, imageHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`prontuario-${selectedPatient.name.toLowerCase().replaceAll(' ', '-')}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  if (showSplash) {
    return <SplashScreen />
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        authMode={authMode}
        professional={professional}
        setAuthMode={setAuthMode}
        onCreate={(nextProfessional) => {
          setProfessional(nextProfessional)
          setIsAuthenticated(true)
        }}
        onLogin={() => setIsAuthenticated(true)}
      />
    )
  }

  return (
    <main className="app-shell">
      <Sidebar
        professional={professional}
        view={view}
        onNavigate={(nextView) => {
          setDeleteMode(false)
          setView(nextView)
        }}
        onLogout={() => setIsAuthenticated(false)}
      />
      <section className="workspace">
        <Header view={view} />

        {view === 'patients' && (
          <PatientsView
            deleteMode={deleteMode}
            filteredPatients={filteredPatients}
            searchTerm={searchTerm}
            setDeleteMode={setDeleteMode}
            setSearchTerm={setSearchTerm}
            onDelete={deletePatient}
            onNew={() => openPatientForm()}
            onOpen={(patient) => {
              setSelectedPatientId(patient.id)
              setView('reports')
            }}
          />
        )}

        {view === 'patient-form' && (
          <PatientForm
            initialPatient={patients.find((patient) => patient.id === editingPatientId)}
            onCancel={() => {
              setEditingPatientId(null)
              setView('patients')
            }}
            onSave={savePatient}
          />
        )}

        {view === 'exercises' && (
          <ExercisesView selectedPatient={selectedPatient} onNewPatient={() => openPatientForm()} onStart={startPractice} />
        )}

        {view === 'practice' && (
          <PracticeView
            exercise={selectedExercise}
            patient={selectedPatient}
            queue={practiceQueue}
            soundStatus={soundStatus}
            onBack={() => setView('exercises')}
            onListen={listenForSound}
            onRate={evaluateCurrent}
          />
        )}

        {view === 'result' && (
          <ResultView record={lastSession} onPracticeAgain={() => startPractice(selectedExerciseId)} onReports={() => setView('reports')} />
        )}

        {view === 'reports' && (
          <ReportsView
            badges={earnedBadges}
            exporting={exporting}
            onEditPatient={() => selectedPatient && openPatientForm(selectedPatient)}
            onExport={exportReport}
            patient={selectedPatient}
            refNode={reportRef}
            sessions={patientSessions}
          />
        )}
      </section>
    </main>
  )
}

function SplashScreen() {
  return (
    <main className="splash-screen" aria-label="Carregando Roxy">
      <div className="splash-logo-wrap">
        <img src={ROXY_LOGO} alt="Roxy" />
      </div>
      <div className="splash-copy">
        <strong>Roxy</strong>
        <span>Speech Therapy</span>
      </div>
      <div className="splash-loader" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </main>
  )
}

interface AuthScreenProps {
  authMode: 'landing' | 'email' | 'create'
  professional: Professional | null
  setAuthMode: (mode: 'landing' | 'email' | 'create') => void
  onCreate: (professional: Professional) => void
  onLogin: () => void
}

function AuthScreen({ authMode, professional, setAuthMode, onCreate, onLogin }: AuthScreenProps) {
  const [profile, setProfile] = useState<Professional>(professional ?? emptyProfessional)

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreate(profile)
  }

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <button>Suporte</button>
        <button>Sobre o Roxy</button>
        <button className="pill-button">Falar com Consultor</button>
      </nav>

      <section className="auth-grid">
        <div className="brand-stage">
          <img src={ROXY_LOGO} alt="Logo Roxy" />
          <h1>Roxy</h1>
          <p>Fonoaudiologia infantil com acompanhamento leve, clínico e recompensador.</p>
        </div>

        <div className="auth-card">
          {authMode === 'landing' && (
            <>
              <h2>Entrar ou Criar Conta</h2>
              <button className="social-button" onClick={onLogin}>
                <ShieldCheck size={20} /> Continuar com a Apple
              </button>
              <button className="social-button" onClick={onLogin}>
                <Sparkles size={20} /> Continuar com o Google
              </button>
              <div className="divider">
                <span />
                ou
                <span />
              </div>
              <label>
                Endereço de e-mail
                <input defaultValue={professional?.email ?? ''} placeholder="exemplo@roxy.com" />
              </label>
              <button className="primary-button" onClick={onLogin}>
                Entrar
              </button>
              <button className="ghost-button" onClick={() => setAuthMode('create')}>
                Criar Conta
              </button>
            </>
          )}

          {authMode === 'email' && (
            <>
              <img className="auth-logo" src={ROXY_LOGO} alt="Logo Roxy" />
              <label>
                Email
                <input defaultValue={professional?.email ?? 'helena@fono.com'} />
              </label>
              <label>
                Senha
                <input type="password" defaultValue="1234567890" />
              </label>
              <button className="primary-button" onClick={onLogin}>
                Entrar
              </button>
              <button className="ghost-button" onClick={() => setAuthMode('create')}>
                Criar Conta
              </button>
            </>
          )}

          {authMode === 'create' && (
            <form className="stack-form" onSubmit={submitProfile}>
              <h2>Criar conta profissional</h2>
              <label>
                Nome completo
                <input
                  required
                  value={profile.name}
                  onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                  placeholder="Fga. Dra. Helena"
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={profile.email}
                  onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                  placeholder="helena@fono.com"
                />
              </label>
              <label>
                CRFa
                <input
                  required
                  value={profile.crfa}
                  onChange={(event) => setProfile({ ...profile, crfa: event.target.value })}
                  placeholder="CRFa 12345-SP"
                />
              </label>
              <label>
                Telefone
                <input
                  required
                  value={profile.phone}
                  onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                  placeholder="(11) 99999-0000"
                />
              </label>
              <button className="primary-button" type="submit">
                Salvar e Entrar
              </button>
              {professional && (
                <button className="ghost-button" type="button" onClick={() => setAuthMode('landing')}>
                  Voltar
                </button>
              )}
            </form>
          )}

          <p className="terms">
            Ao continuar você concorda com os Termos de Uso e a Política de Privacidade da Roxy.
          </p>
        </div>
      </section>
    </main>
  )
}

interface SidebarProps {
  professional: Professional | null
  view: AppView
  onNavigate: (view: AppView) => void
  onLogout: () => void
}

function Sidebar({ professional, view, onNavigate, onLogout }: SidebarProps) {
  const items: Array<{ label: string; view: AppView; icon: typeof UsersRound }> = [
    { label: 'Meus Pacientes', view: 'patients', icon: UsersRound },
    { label: 'Exercícios', view: 'exercises', icon: Gamepad2 },
    { label: 'Relatórios', view: 'reports', icon: FileText },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={ROXY_LOGO} alt="Roxy" />
        <strong>Roxy</strong>
        <span>Speech Therapy</span>
      </div>

      <nav className="side-nav">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button className={view === item.view ? 'active' : ''} key={item.view} onClick={() => onNavigate(item.view)}>
              <Icon size={21} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="professional-card">
        <span className="avatar-dot" />
        <div>
          <strong>{professional?.name || 'Fga. Dra. Helena'}</strong>
          <small>{professional?.crfa || 'CRFa 12345-SP'}</small>
        </div>
        <button aria-label="Sair" onClick={onLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

interface HeaderProps {
  view: AppView
}

function Header({ view }: HeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1>{viewTitles[view].title}</h1>
        <p>{viewTitles[view].subtitle}</p>
      </div>
    </header>
  )
}

interface PatientsViewProps {
  deleteMode: boolean
  filteredPatients: Patient[]
  searchTerm: string
  setDeleteMode: (enabled: boolean) => void
  setSearchTerm: (term: string) => void
  onDelete: (patientId: string) => void
  onNew: () => void
  onOpen: (patient: Patient) => void
}

function PatientsView({
  deleteMode,
  filteredPatients,
  searchTerm,
  setDeleteMode,
  setSearchTerm,
  onDelete,
  onNew,
  onOpen,
}: PatientsViewProps) {
  return (
    <section className="content-stack">
      <div className="toolbar">
        <button className="outline-button" onClick={onNew}>
          Novo Paciente <PlusCircle size={16} />
        </button>
        <button className={deleteMode ? 'danger-button' : 'outline-button'} onClick={() => setDeleteMode(!deleteMode)}>
          {deleteMode ? 'Modo Excluir Ativo' : 'Excluir Paciente'} <Trash2 size={16} />
        </button>
        <label className="search-box">
          <Search size={17} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar paciente..." />
        </label>
      </div>

      <div className="patient-list">
        {filteredPatients.map((patient) => (
          <article className="patient-row" key={patient.id}>
            <div className="patient-avatar">
              <UserRound size={25} />
            </div>
            <div>
              <h2>{patient.name}</h2>
              <p>ID do Paciente: #{patient.id}</p>
            </div>
            {deleteMode ? (
              <button className="delete-icon" aria-label={`Excluir ${patient.name}`} onClick={() => onDelete(patient.id)}>
                <Trash2 size={20} />
              </button>
            ) : (
              <button className="next-icon" aria-label={`Abrir prontuário de ${patient.name}`} onClick={() => onOpen(patient)}>
                <ArrowRight size={24} />
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

interface PatientFormProps {
  initialPatient?: Patient
  onCancel: () => void
  onSave: (patient: Patient) => void
}

function PatientForm({ initialPatient, onCancel, onSave }: PatientFormProps) {
  const [patient, setPatient] = useState<Patient>(
    initialPatient ?? {
      ...emptyPatient,
      id: createId(),
      createdAt: new Date().toISOString(),
    },
  )

  function updateField(field: keyof Patient, value: string) {
    setPatient((current) => ({ ...current, [field]: value }))
  }

  function updateExercise(event: ChangeEvent<HTMLInputElement>, exerciseId: ExerciseId) {
    setPatient((current) => ({
      ...current,
      exercises: event.target.checked
        ? [...current.exercises, exerciseId]
        : current.exercises.filter((id) => id !== exerciseId),
    }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(patient)
  }

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <div className="photo-line">
        <div className="photo-placeholder">
          <UserRound size={40} />
        </div>
        <div>
          <h2>Foto do Paciente</h2>
          <p>Clique futuramente para enviar uma foto ou usar um avatar padrão.</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Nome Completo
          <input required value={patient.name} onChange={(event) => updateField('name', event.target.value)} />
        </label>
        <label>
          Data de Nascimento
          <input required type="date" value={patient.birthDate} onChange={(event) => updateField('birthDate', event.target.value)} />
        </label>
        <label>
          Responsáveis
          <input required value={patient.guardians} onChange={(event) => updateField('guardians', event.target.value)} />
        </label>
        <label>
          Número de Telefone
          <input required value={patient.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </label>
        <label className="wide">
          Diagnóstico / Queixa Principal
          <textarea required value={patient.diagnosis} onChange={(event) => updateField('diagnosis', event.target.value)} />
        </label>
        <fieldset className="wide exercise-checks">
          <legend>Exercícios a trabalhar</legend>
          {exercises.map((exercise) => (
            <label key={exercise.id}>
              <input
                checked={patient.exercises.includes(exercise.id)}
                required={patient.exercises.length === 0}
                type="checkbox"
                onChange={(event) => updateExercise(event, exercise.id)}
              />
              {exercise.name}
            </label>
          ))}
        </fieldset>
        <label>
          Dia da Sessão
          <input required value={patient.sessionDay} onChange={(event) => updateField('sessionDay', event.target.value)} />
        </label>
        <label>
          Hora da Sessão
          <input required type="time" value={patient.sessionTime} onChange={(event) => updateField('sessionTime', event.target.value)} />
        </label>
      </div>

      <div className="form-actions">
        <button className="ghost-button" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="primary-button compact" type="submit">
          <Save size={18} /> Salvar
        </button>
      </div>
    </form>
  )
}

interface ExercisesViewProps {
  selectedPatient?: Patient
  onNewPatient: () => void
  onStart: (exerciseId: ExerciseId) => void
}

function ExercisesView({ selectedPatient, onNewPatient, onStart }: ExercisesViewProps) {
  if (!selectedPatient) {
    return (
      <section className="empty-state panel">
        <UsersRound size={42} />
        <h2>Cadastre um paciente para iniciar</h2>
        <p>Os exercícios precisam estar associados ao prontuário da criança.</p>
        <button className="primary-button compact" onClick={onNewPatient}>
          Novo Paciente
        </button>
      </section>
    )
  }

  const orderedExercises = [...exercises].sort((first, second) => {
    const firstIsIndicated = selectedPatient.exercises.includes(first.id)
    const secondIsIndicated = selectedPatient.exercises.includes(second.id)
    return Number(secondIsIndicated) - Number(firstIsIndicated)
  })

  return (
    <section className="exercise-board">
      <div className="exercise-hero panel">
        <div>
          <span className="section-kicker">Sessão de hoje</span>
          <h2>{selectedPatient.name}</h2>
          <p>Os exercícios indicados aparecem primeiro para acelerar o atendimento.</p>
        </div>
        <div className="hero-mini-stats">
          <span>{selectedPatient.exercises.length}</span>
          <small>indicados</small>
        </div>
      </div>

      <div className="exercise-grid">
        {orderedExercises.map((exercise) => {
          const isIndicated = selectedPatient.exercises.includes(exercise.id)

          return (
            <article className="exercise-card" key={exercise.id} style={{ '--accent': exercise.accent } as React.CSSProperties}>
              <div className="exercise-icon">
                {exercise.id === 'repete-comigo' && <Mic size={27} />}
                {exercise.id === 'rimas-divertidas' && <Sparkles size={27} />}
                {exercise.id === 'monte-historias' && <Award size={27} />}
                {exercise.id === 'sons-e-mais' && <Heart size={27} />}
              </div>
              <div>
                <div className="exercise-heading">
                  <h2>{exercise.name}</h2>
                  {isIndicated && <span>Indicado</span>}
                </div>
                <p>{exercise.description}</p>
                <small>{exercise.clinicalGoal}</small>
                <div className="surprise-chip">
                  <Sparkles size={15} />
                  <span>Figurinha surpresa ao concluir</span>
                </div>
              </div>
              <button aria-label={`Iniciar ${exercise.name}`} onClick={() => onStart(exercise.id)}>
                <ArrowRight size={22} />
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

interface PracticeViewProps {
  exercise: Exercise
  patient?: Patient
  queue: Exercise['prompts']
  soundStatus: 'idle' | 'listening' | 'detected' | 'silent' | 'unavailable'
  onBack: () => void
  onListen: () => void
  onRate: (rating: Rating) => void
}

function PracticeView({ exercise, patient, queue, soundStatus, onBack, onListen, onRate }: PracticeViewProps) {
  const currentPrompt = queue[0]
  const canRate = soundStatus === 'detected' || soundStatus === 'unavailable'
  const currentIndex = exercise.prompts.length - queue.length + 1
  const completed = exercise.prompts.length - queue.length
  const progressPercent = (completed / exercise.prompts.length) * 100

  if (!currentPrompt) {
    return (
      <section className="panel empty-state">
        <Sparkles size={42} />
        <h2>Preparando a prática</h2>
        <p>Escolha um exercício para começar.</p>
      </section>
    )
  }

  return (
    <section className="practice-panel">
      <div className="practice-topline">
        <button className="round-action" aria-label="Voltar" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <strong>
          {Math.min(currentIndex, exercise.prompts.length)}/{exercise.prompts.length}
        </strong>
        <span>{patient?.name}</span>
      </div>

      <div className="practice-progress">
        <span style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="practice-layout">
        <div className="practice-main">
          <div className="prompt-card" style={{ '--accent': exercise.accent } as React.CSSProperties}>
            <span className="prompt-ribbon">Card da vez</span>
            <div className="prompt-visual">
              <span>{currentPrompt.visualLabel}</span>
            </div>
            <h2>{currentPrompt.title}</h2>
            <p>{currentPrompt.instruction}</p>
            {currentPrompt.helper && <small>{currentPrompt.helper}</small>}
          </div>

          <button className={`mic-button ${soundStatus}`} onClick={onListen} disabled={soundStatus === 'listening'}>
            <Mic size={26} />
          </button>

          <p className="sound-feedback">
            {soundStatus === 'idle' && 'Aperte o microfone para detectar a fala da criança.'}
            {soundStatus === 'listening' && 'Escutando por alguns segundos...'}
            {soundStatus === 'detected' && 'Som detectado. Avaliação liberada.'}
            {soundStatus === 'silent' && 'Nenhum som detectado. Tente o microfone novamente.'}
            {soundStatus === 'unavailable' && 'Microfone indisponível. Avaliação manual liberada.'}
          </p>

          <div className="rating-actions">
            <button className="rate-ok" disabled={!canRate} onClick={() => onRate('ok')} aria-label="Avaliação correta">
              <Check size={25} />
            </button>
            <button className="rate-later" disabled={!canRate} onClick={() => onRate('later')} aria-label="Rever depois">
              <X size={25} />
            </button>
            <button className="rate-retry" disabled={!canRate} onClick={() => onRate('retry')} aria-label="Repetir no final">
              <ArrowRight size={25} />
            </button>
          </div>
        </div>

        <aside className="practice-side">
          <div className="side-card mystery-reward">
            <span>Recompensa</span>
            <div className="mystery-card" aria-hidden="true">
              <Sparkles size={34} />
              <strong>?</strong>
            </div>
            <strong>Figurinha surpresa</strong>
          </div>
          <div className="side-card">
            <span>Fila</span>
            <div className="queue-dots">
              {exercise.prompts.map((prompt) => (
                <i className={queue.some((item) => item.id === prompt.id) ? 'pending' : 'done'} key={prompt.id} />
              ))}
            </div>
            <p>Cards marcados em amarelo ou vermelho voltam para o final até receberem OK.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

interface ResultViewProps {
  record: SessionRecord | null
  onPracticeAgain: () => void
  onReports: () => void
}

function ResultView({ record, onPracticeAgain, onReports }: ResultViewProps) {
  if (!record) {
    return (
      <section className="panel empty-state">
        <Award size={42} />
        <h2>Nenhum resultado ainda</h2>
        <p>Finalize uma prática para gerar uma carta.</p>
      </section>
    )
  }

  return (
    <section className="panel result-panel">
      <div className="stars" aria-label="3 estrelas">
        ★ ★ ★
      </div>
      <div className="result-layout">
        <img className="earned-card" src={record.badge.image} alt={`Carta conquistada: ${record.badge.name}`} />
        <div className="result-copy">
          <span>Carta conquistada</span>
          <h2>{record.badge.name}</h2>
          <strong>
            {record.score}/{record.total}
          </strong>
          <p>Excelente participação. A carta já ficou salva no prontuário do paciente.</p>
          <div className="result-actions">
            <button className="ghost-button" onClick={onPracticeAgain}>
              Repetir exercício
            </button>
            <button className="primary-button compact" onClick={onReports}>
              Ver prontuário
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ReportsViewProps {
  badges: SessionRecord['badge'][]
  exporting: boolean
  onEditPatient: () => void
  onExport: () => void
  patient?: Patient
  refNode: React.RefObject<HTMLDivElement | null>
  sessions: SessionRecord[]
}

function ReportsView({ badges, exporting, onEditPatient, onExport, patient, refNode, sessions }: ReportsViewProps) {
  const accuracy = sessions.length
    ? Math.round((sessions.reduce((sum, session) => sum + session.score / session.total, 0) / sessions.length) * 100)
    : 0

  if (!patient) {
    return (
      <section className="panel empty-state">
        <FileText size={42} />
        <h2>Nenhum paciente selecionado</h2>
        <p>Cadastre ou selecione um paciente para abrir o prontuário.</p>
      </section>
    )
  }

  return (
    <section className="reports-shell">
      <div className="report-actions">
        <button className="outline-button" onClick={onEditPatient}>
          Editar Paciente
        </button>
        <button className="primary-button compact" onClick={onExport} disabled={exporting}>
          <Download size={18} /> {exporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>

      <div className="report-document" ref={refNode}>
        <div className="patient-summary panel">
          <div className="patient-avatar large">
            <UserRound size={38} />
          </div>
          <div>
            <h2>{patient.name}</h2>
            <p>{patient.diagnosis}</p>
          </div>
          <div className="metric-card">
            <strong>{sessions.length}</strong>
            <span>sessões</span>
          </div>
          <div className="metric-card">
            <strong>{badges.length}</strong>
            <span>cartas</span>
          </div>
          <div className="metric-card">
            <strong>{accuracy}%</strong>
            <span>evolução</span>
          </div>
        </div>

        <div className="report-grid">
          <article className="panel">
            <h2>Progresso do Tratamento</h2>
            <ProgressLine label="Foco de escuta" value={Math.max(30, accuracy)} color="#83de74" />
            <ProgressLine label="Clareza de pronúncia" value={Math.max(35, accuracy - 8)} color="#8f79ff" />
            <ProgressLine label="Vocabulário" value={Math.max(25, accuracy - 15)} color="#f2d447" />
          </article>

          <article className="panel">
            <h2>Informações</h2>
            <InfoRow icon={<CalendarDays size={17} />} label="Sessão" value={`${patient.sessionDay} às ${patient.sessionTime}`} />
            <InfoRow icon={<UsersRound size={17} />} label="Responsáveis" value={patient.guardians} />
            <InfoRow icon={<Heart size={17} />} label="Telefone" value={patient.phone} />
          </article>

          <article className="panel wide-panel">
            <h2>Emblemas colecionáveis</h2>
            <div className="badge-grid">
              {badges.length ? (
                badges.map((badge, index) => <img src={badge.image} alt={badge.name} key={`${badge.id}-${index}`} />)
              ) : (
                <p className="muted">As cartas da Roxy aparecem aqui quando um exercício é concluído.</p>
              )}
            </div>
          </article>

          <article className="panel wide-panel">
            <h2>Histórico por Sessão</h2>
            <div className="history-list">
              {sessions.length ? (
                sessions.map((session) => (
                  <div className="history-item" key={session.id}>
                    <div>
                      <strong>{session.exerciseName}</strong>
                      <span>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p>{session.notes}</p>
                    <small>
                      Resultado {session.score}/{session.total} - carta {session.badge.name}
                    </small>
                  </div>
                ))
              ) : (
                <p className="muted">Nenhuma sessão registrada ainda.</p>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

function ProgressLine({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="progress-line">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <span className="progress-track">
        <span style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </span>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="info-row">
      {icon}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

export default App
