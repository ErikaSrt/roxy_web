import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  BarChart3,
  CalendarDays,
  Check,
  Download,
  FileText,
  Gamepad2,
  Heart,
  Images,
  Info,
  LogOut,
  Mail,
  Mic,
  MessageCircle,
  PlayCircle,
  PlusCircle,
  Radio,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  UserRound,
  UsersRound,
  Volume2,
  Wind,
  X,
} from 'lucide-react'
import './App.css'
import { ROXY_LOGO, badges, exercises, getBadge, getExercise } from './data'
import { createId, useStoredState } from './storage'
import type { AppView, AudioClip, Exercise, ExerciseId, Patient, Professional, PromptAttempt, Rating, SessionRecord } from './types'

const emptyProfessional: Professional = {
  name: '',
  email: '',
  crfa: '',
  phone: '',
  photoUrl: '',
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
  dashboard: {
    title: 'Dashboard Clínico',
    subtitle: 'Visão geral dos pacientes, progresso, últimas sessões e áudios registrados.',
  },
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

type SoundStatus = 'idle' | 'requesting' | 'recording' | 'detected' | 'silent' | 'unavailable' | 'processing'

interface AudioDeleteTarget {
  clipId: string
  exerciseName: string
  patientName: string
  promptTitle: string
  sessionId: string
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function App() {
  const [professional, setProfessional] = useStoredState<Professional | null>('roxy.professional', null)
  const [patients, setPatients] = useStoredState<Patient[]>('roxy.patients', [])
  const [sessions, setSessions] = useStoredState<SessionRecord[]>('roxy.sessions', [])
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState<'landing' | 'email' | 'create'>(professional ? 'landing' : 'create')
  const [view, setView] = useState<AppView>('dashboard')
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? '')
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState<ExerciseId>('repete-comigo')
  const [practiceQueue, setPracticeQueue] = useState<Exercise['prompts']>([])
  const [attemptLog, setAttemptLog] = useState<Record<string, PromptAttempt>>({})
  const [soundStatus, setSoundStatus] = useState<SoundStatus>('idle')
  const [micLevel, setMicLevel] = useState(0)
  const [recordedClips, setRecordedClips] = useState<Record<string, AudioClip>>({})
  const [recordingPromptId, setRecordingPromptId] = useState<string | null>(null)
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null)
  const [exporting, setExporting] = useState(false)
  const [audioDeleteTarget, setAudioDeleteTarget] = useState<AudioDeleteTarget | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimeoutRef = useRef<number | null>(null)
  const recordingStartedAtRef = useRef(0)
  const recordingPeakRef = useRef(0)
  const recordingNoiseFloorRef = useRef(0.004)
  const recordingVoicedFramesRef = useRef(0)
  const levelUpdatedAtRef = useRef(0)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId],
  )

  const selectedExercise = getExercise(selectedExerciseId) ?? exercises[0]
  const filteredPatients = useMemo(() => {
    const term = normalizeText(searchTerm)
    if (!term) return patients

    return patients.filter((patient) => {
      const exerciseNames = patient.exercises
        .map((exerciseId) => getExercise(exerciseId)?.name ?? exerciseId)
        .join(' ')
      const searchable = [
        patient.name,
        patient.id,
        patient.birthDate,
        patient.guardians,
        patient.phone,
        patient.diagnosis,
        patient.sessionDay,
        patient.sessionTime,
        exerciseNames,
      ].join(' ')

      return normalizeText(searchable).includes(term)
    })
  }, [patients, searchTerm])
  const patientSessions = sessions.filter((session) => session.patientId === selectedPatient?.id)
  const earnedBadges = patientSessions.map((session) => session.badge)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowSplash(false), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    return () => stopRecordingTracks()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [view])

  function stopRecordingTracks() {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    recordingStreamRef.current = null

    void audioContextRef.current?.close()
    audioContextRef.current = null
    setMicLevel(0)
  }

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

  function deleteAudioClip(sessionId: string, clipId: string) {
    const session = sessions.find((item) => item.id === sessionId)
    const clip = session?.audioClips?.find((item) => item.id === clipId)
    if (!session || !clip) return

    setAudioDeleteTarget({
      clipId,
      exerciseName: session.exerciseName,
      patientName: patients.find((patient) => patient.id === session.patientId)?.name ?? 'Paciente',
      promptTitle: clip.promptTitle,
      sessionId,
    })
  }

  function confirmAudioDeletion() {
    if (!audioDeleteTarget) return

    const { clipId, sessionId } = audioDeleteTarget

    setSessions((current) => current.map((item) => {
      if (item.id !== sessionId) return item

      const remainingClips = (item.audioClips ?? []).filter((audioClip) => audioClip.id !== clipId)
      return {
        ...item,
        audioClips: remainingClips,
        notes: remainingClips.length
          ? item.notes
          : item.notes.replace(' Áudios salvos no histórico da sessão.', ''),
      }
    }))

    setAudioDeleteTarget(null)
  }

  function startPractice(exerciseId: ExerciseId) {
    const exercise = getExercise(exerciseId) ?? exercises[0]
    setSelectedExerciseId(exerciseId)
    setPracticeQueue([...exercise.prompts])
    setAttemptLog({})
    setRecordedClips({})
    setRecordingPromptId(null)
    setSoundStatus('idle')
    setMicLevel(0)
    setView('practice')
  }

  async function listenForSound() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setSoundStatus('processing')
      return
    }

    const currentPrompt = practiceQueue[0]
    if (!currentPrompt) return

    try {
      setSoundStatus('requesting')

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microfone não suportado neste navegador.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      const audioContext = new AudioContext()
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.7
      const data = new Float32Array(analyser.fftSize)
      const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : undefined)

      source.connect(analyser)
      audioChunksRef.current = []
      recordingPeakRef.current = 0
      recordingNoiseFloorRef.current = 0.004
      recordingVoicedFramesRef.current = 0
      levelUpdatedAtRef.current = 0
      recordingStartedAtRef.current = performance.now()
      recordingStreamRef.current = stream
      audioContextRef.current = audioContext
      mediaRecorderRef.current = recorder
      setRecordingPromptId(currentPrompt.id)
      setSoundStatus('recording')

      const measure = () => {
        analyser.getFloatTimeDomainData(data)
        let sumSquares = 0
        let framePeak = 0

        for (const value of data) {
          const amplitude = Math.abs(value)
          sumSquares += value * value
          framePeak = Math.max(framePeak, amplitude)
        }

        const rms = Math.sqrt(sumSquares / data.length)
        const elapsed = performance.now() - recordingStartedAtRef.current
        recordingPeakRef.current = Math.max(recordingPeakRef.current, framePeak)

        if (elapsed < 650) {
          recordingNoiseFloorRef.current =
            recordingNoiseFloorRef.current * 0.88 + rms * 0.12
        } else {
          const dynamicThreshold = Math.min(
            0.024,
            Math.max(0.007, recordingNoiseFloorRef.current * 2.15),
          )
          const peakThreshold = Math.max(0.016, recordingNoiseFloorRef.current * 3)

          if (rms >= dynamicThreshold || framePeak >= peakThreshold) {
            recordingVoicedFramesRef.current += 1
          }
        }

        const now = performance.now()
        if (now - levelUpdatedAtRef.current > 90) {
          const adjustedLevel = Math.max(0, rms - recordingNoiseFloorRef.current * 0.7)
          setMicLevel(Math.min(1, adjustedLevel * 20))
          levelUpdatedAtRef.current = now
        }

        animationFrameRef.current = requestAnimationFrame(measure)
      }

      measure()

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      })

      recorder.addEventListener('stop', async () => {
        setSoundStatus('processing')
        stopRecordingTracks()

        const durationMs = Math.round(performance.now() - recordingStartedAtRef.current)
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })

        if (blob.size > 0) {
          const dataUrl = await blobToDataUrl(blob)
          setRecordedClips((current) => ({
            ...current,
            [currentPrompt.id]: {
              id: createId('AUD'),
              promptId: currentPrompt.id,
              promptTitle: currentPrompt.title,
              dataUrl,
              mimeType: blob.type,
              durationMs,
              createdAt: new Date().toISOString(),
            },
          }))
        }

        mediaRecorderRef.current = null
        setRecordingPromptId(null)
        const speechDetected =
          recordingVoicedFramesRef.current >= 5 || recordingPeakRef.current >= 0.022
        setSoundStatus(speechDetected ? 'detected' : 'silent')
      })

      recorder.start()
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop()
        }
      }, 4500)
    } catch {
      stopRecordingTracks()
      mediaRecorderRef.current = null
      setRecordingPromptId(null)
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

    const remaining = practiceQueue.slice(1)
    if (remaining.length === 0) {
      finishPractice(nextLog)
      return
    }

    setPracticeQueue(remaining)
    setSoundStatus('idle')
  }

  function finishPractice(finalLog: Record<string, PromptAttempt>) {
    if (!selectedPatient) return

    const badge = getBadge(selectedExercise.badgeId) ?? badges[0]
    const now = new Date().toISOString()
    const attempts = selectedExercise.prompts.flatMap((prompt) => {
      const attempt = finalLog[prompt.id]
      return attempt ? [attempt] : []
    })
    const score = attempts.filter((attempt) => attempt.rating === 'ok').length
    const percentage = Math.round((score / selectedExercise.prompts.length) * 100)
    const reviewItems = attempts.filter((attempt) => attempt.rating !== 'ok').map((attempt) => attempt.title)
    const completionNote = percentage === 100
      ? 'Exercício concluído integralmente com avaliação manual.'
      : `Exercício concluído parcialmente (${percentage}%). Retomar: ${reviewItems.join(', ')}.`
    const record: SessionRecord = {
      id: createId('SES'),
      patientId: selectedPatient.id,
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      date: now,
      score,
      total: selectedExercise.prompts.length,
      notes: `${completionNote}${Object.keys(recordedClips).length ? ' Áudios salvos no histórico da sessão.' : ''}`,
      badge: { ...badge, earnedAt: now },
      attempts,
      audioClips: selectedExercise.prompts.flatMap((prompt) => {
        const clip = recordedClips[prompt.id]
        return clip ? [clip] : []
      }),
    }

    setLastSession(record)
    setSessions((current) => [record, ...current])
    setView('result')
  }

  async function exportReport() {
    if (!reportRef.current || !selectedPatient) return
    setExporting(true)

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#f6f3fc', scale: 2 })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 8
      const usableWidth = pageWidth - margin * 2
      const usableHeight = pageHeight - margin * 2
      const widthScale = usableWidth / canvas.width
      const renderedHeight = canvas.height * widthScale

      if (renderedHeight <= usableHeight * 1.08) {
        const scale = Math.min(usableWidth / canvas.width, usableHeight / canvas.height)
        const renderedWidth = canvas.width * scale
        const fittedHeight = canvas.height * scale
        const x = (pageWidth - renderedWidth) / 2
        const image = canvas.toDataURL('image/jpeg', 0.94)

        pdf.addImage(image, 'JPEG', x, margin, renderedWidth, fittedHeight, undefined, 'FAST')
      } else {
        const pageSliceHeight = Math.max(1, Math.floor(usableHeight / widthScale))
        let sourceY = 0
        let pageIndex = 0

        while (sourceY < canvas.height) {
          const sliceHeight = Math.min(pageSliceHeight, canvas.height - sourceY)
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = canvas.width
          pageCanvas.height = sliceHeight
          const context = pageCanvas.getContext('2d')

          if (!context) throw new Error('Não foi possível preparar o prontuário para exportação.')

          context.fillStyle = '#f6f3fc'
          context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
          context.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight,
          )

          if (pageIndex > 0) pdf.addPage()

          const sliceImage = pageCanvas.toDataURL('image/jpeg', 0.94)
          pdf.addImage(
            sliceImage,
            'JPEG',
            margin,
            margin,
            usableWidth,
            sliceHeight * widthScale,
            undefined,
            'FAST',
          )

          sourceY += sliceHeight
          pageIndex += 1
        }
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
          setPatients([])
          setSessions([])
          setSelectedPatientId('')
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
        patients={patients}
        professional={professional}
        selectedPatientId={selectedPatient?.id ?? ''}
        view={view}
        onNavigate={(nextView) => {
          setDeleteMode(false)
          setView(nextView)
        }}
        onPatientChange={setSelectedPatientId}
        onLogout={() => setIsAuthenticated(false)}
      />
      <section className="workspace">
        <Header exercise={view === 'practice' ? selectedExercise : undefined} view={view} />

        {view === 'dashboard' && (
          <DashboardView
            patients={patients}
            selectedPatientId={selectedPatient?.id ?? ''}
            sessions={sessions}
            onDeleteAudio={deleteAudioClip}
            onNewPatient={() => openPatientForm()}
            onOpenPatient={(patient) => {
              setSelectedPatientId(patient.id)
              setView('reports')
            }}
            onStartExercise={(patient, exerciseId) => {
              setSelectedPatientId(patient.id)
              startPractice(exerciseId)
            }}
          />
        )}

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
            recordedClips={recordedClips}
            recordingPromptId={recordingPromptId}
            micLevel={micLevel}
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
      {audioDeleteTarget && (
        <AudioDeleteDialog
          target={audioDeleteTarget}
          onCancel={() => setAudioDeleteTarget(null)}
          onConfirm={confirmAudioDeletion}
        />
      )}
    </main>
  )
}

function SplashScreen() {
  return (
    <main className="splash-screen" aria-label="Carregando Roxy">
      <div className="splash-aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <section className="splash-intro">
        <div className="splash-emblem">
          <span className="splash-orbit splash-orbit-one" aria-hidden="true" />
          <span className="splash-orbit splash-orbit-two" aria-hidden="true" />
          <div className="splash-logo-wrap">
            <span className="splash-logo-glow" aria-hidden="true" />
            <img src={ROXY_LOGO} alt="Roxy" />
          </div>
          <div className="splash-voice" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="splash-copy">
          <span className="splash-eyebrow">Fonoaudiologia infantil</span>
          <strong>Roxy</strong>
          <p>Cada voz merece ser ouvida.</p>
        </div>

        <div className="splash-progress" aria-hidden="true">
          <span />
        </div>
        <span className="splash-loading-text">Preparando um atendimento especial</span>
      </section>

      <div className="splash-paws" aria-hidden="true">
        <span>•</span><span>•</span><span>●</span>
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
  const [contactDialog, setContactDialog] = useState<'support' | 'about' | 'consultant' | null>(null)
  const [legalDialog, setLegalDialog] = useState<'terms' | 'privacy' | null>(null)
  const [photoError, setPhotoError] = useState('')

  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim() || 'suporteroxy256@gmail.com'
  const consultantPhone = (import.meta.env.VITE_CONSULTANT_WHATSAPP || '554298104857').replace(/\D/g, '')
  const consultantMessage = encodeURIComponent(
    'Olá! Conheci a Roxy e gostaria de conversar com um consultor.',
  )
  const supportGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent('Suporte Roxy')}`

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreate(profile)
  }

  function handleProfilePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Escolha um arquivo de imagem válido.')
      event.target.value = ''
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setPhotoError('A imagem deve ter no máximo 3 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setProfile((current) => ({ ...current, photoUrl: String(reader.result) }))
      setPhotoError('')
    }
    reader.onerror = () => setPhotoError('Não foi possível carregar essa imagem.')
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!contactDialog && !legalDialog) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setContactDialog(null)
        setLegalDialog(null)
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [contactDialog, legalDialog])

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <button type="button" onClick={() => setContactDialog('support')}>
          <Mail size={17} /> Suporte
        </button>
        <button type="button" onClick={() => setContactDialog('about')}>
          <Info size={17} /> Sobre o Roxy
        </button>
        <button className="pill-button" type="button" onClick={() => setContactDialog('consultant')}>
          <MessageCircle size={17} /> Falar com Consultor
        </button>
      </nav>

      <section className="auth-grid">
        <div className="brand-stage">
          <img src={ROXY_LOGO} alt="Logo Roxy" />
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
              <div className="profile-photo-field">
                <div className="profile-photo-preview" aria-label="Pré-visualização da foto de perfil">
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Foto de perfil selecionada" />
                  ) : (
                    <UserRound size={34} aria-hidden="true" />
                  )}
                </div>
                <div className="profile-photo-copy">
                  <strong>Foto de perfil</strong>
                  <span>Ajuda a identificar a profissional no sistema.</span>
                  <div className="profile-photo-actions">
                    <label className="photo-upload-button">
                      <Images size={17} /> {profile.photoUrl ? 'Trocar foto' : 'Escolher foto'}
                      <input accept="image/png,image/jpeg,image/webp" type="file" onChange={handleProfilePhoto} />
                    </label>
                    {profile.photoUrl && (
                      <button
                        aria-label="Remover foto de perfil"
                        className="photo-remove-button"
                        type="button"
                        onClick={() => setProfile((current) => ({ ...current, photoUrl: '' }))}
                      >
                        <Trash2 size={17} /> Remover
                      </button>
                    )}
                  </div>
                  {photoError && <small className="photo-error" role="alert">{photoError}</small>}
                </div>
              </div>
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
            Ao continuar você concorda com os{' '}
            <button type="button" onClick={() => setLegalDialog('terms')}>Termos de Uso</button>
            {' '}e a{' '}
            <button type="button" onClick={() => setLegalDialog('privacy')}>Política de Privacidade</button>
            {' '}da Roxy.
          </p>
        </div>
      </section>

      {contactDialog && (
        <div className="contact-dialog-backdrop" role="presentation" onMouseDown={() => setContactDialog(null)}>
          <section
            aria-labelledby="contact-dialog-title"
            aria-modal="true"
            className="contact-dialog"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Fechar"
              className="contact-dialog-close"
              type="button"
              onClick={() => setContactDialog(null)}
            >
              <X size={20} />
            </button>

            {contactDialog === 'support' && (
              <>
                <span className="contact-dialog-icon"><Mail size={26} /></span>
                <p className="contact-dialog-eyebrow">Canal de atendimento</p>
                <h2 id="contact-dialog-title">Suporte Roxy</h2>
                <p>
                  Envie sua dúvida, dificuldade de acesso ou sugestão. Nossa equipe responderá pelo
                  mesmo e-mail usado no contato.
                </p>
                {supportEmail ? (
                  <>
                    <a className="contact-email" href={`mailto:${supportEmail}`}>
                      {supportEmail}
                    </a>
                    <a
                      className="primary-button contact-dialog-action"
                      href={supportGmailUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Mail size={18} /> Enviar pelo Gmail
                    </a>
                  </>
                ) : (
                  <p className="contact-unavailable">O canal de suporte será disponibilizado em breve.</p>
                )}
              </>
            )}

            {contactDialog === 'about' && (
              <>
                <span className="contact-dialog-icon"><Sparkles size={26} /></span>
                <p className="contact-dialog-eyebrow">Fonoaudiologia infantil</p>
                <h2 id="contact-dialog-title">Sobre o Roxy</h2>
                <p>
                  Roxy é uma plataforma web responsiva criada para apoiar consultas de fonoaudiologia
                  infantil. Ela reúne pacientes, exercícios guiados, evolução clínica, áudios de sessão
                  e cartas colecionáveis em uma experiência acolhedora para a criança e prática para a
                  profissional.
                </p>
                <p>
                  O projeto foi idealizado e desenvolvido por Erika como trabalho de conclusão de curso,
                  unindo tecnologia, cuidado clínico e uma forma mais leve de acompanhar cada conquista.
                </p>
              </>
            )}

            {contactDialog === 'consultant' && (
              <>
                <span className="contact-dialog-icon"><MessageCircle size={26} /></span>
                <p className="contact-dialog-eyebrow">Atendimento personalizado</p>
                <h2 id="contact-dialog-title">Falar com Consultor</h2>
                <p>
                  Converse pelo WhatsApp para tirar dúvidas sobre a plataforma e entender como a Roxy
                  pode apoiar sua rotina de atendimentos.
                </p>
                {consultantPhone ? (
                  <a
                    className="primary-button contact-dialog-action whatsapp-action"
                    href={`https://wa.me/${consultantPhone}?text=${consultantMessage}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle size={18} /> Abrir WhatsApp
                  </a>
                ) : (
                  <p className="contact-unavailable">O atendimento pelo WhatsApp estará disponível em breve.</p>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {legalDialog && (
        <div className="legal-dialog-backdrop" role="presentation" onMouseDown={() => setLegalDialog(null)}>
          <section
            aria-labelledby="legal-dialog-title"
            aria-modal="true"
            className="legal-dialog"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="legal-dialog-header">
              <div>
                <p className="legal-dialog-eyebrow">Roxy · Transparência e cuidado</p>
                <h2 id="legal-dialog-title">
                  {legalDialog === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
                </h2>
              </div>
              <button aria-label="Fechar" className="legal-dialog-close" type="button" onClick={() => setLegalDialog(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="legal-dialog-tabs" role="tablist" aria-label="Documentos legais">
              <button
                aria-selected={legalDialog === 'terms'}
                className={legalDialog === 'terms' ? 'active' : ''}
                role="tab"
                type="button"
                onClick={() => setLegalDialog('terms')}
              >
                <FileText size={17} /> Termos de Uso
              </button>
              <button
                aria-selected={legalDialog === 'privacy'}
                className={legalDialog === 'privacy' ? 'active' : ''}
                role="tab"
                type="button"
                onClick={() => setLegalDialog('privacy')}
              >
                <ShieldCheck size={17} /> Privacidade
              </button>
            </div>

            <div className="legal-dialog-content" role="tabpanel">
              {legalDialog === 'terms' ? <TermsContent /> : <PrivacyContent />}
            </div>

            <button className="primary-button legal-dialog-done" type="button" onClick={() => setLegalDialog(null)}>
              Entendi
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

function TermsContent() {
  return (
    <>
      <p className="legal-updated">Última atualização: 23 de novembro de 2026</p>
      <section>
        <h3>1. Sobre a plataforma</h3>
        <p>O Roxy é um projeto acadêmico de apoio às consultas de fonoaudiologia infantil. Ele organiza pacientes, exercícios, resultados, áudios e recompensas, mas não substitui a avaliação clínica da fonoaudióloga.</p>
      </section>
      <section>
        <h3>2. Uso profissional</h3>
        <p>A profissional é responsável por cadastrar informações corretas, conduzir os exercícios e registrar a avaliação de cada atividade. O acesso não deve ser compartilhado com pessoas não autorizadas.</p>
      </section>
      <section>
        <h3>3. Conteúdo e resultados</h3>
        <p>As pontuações e indicações apresentadas servem para acompanhamento e organização da sessão. Decisões clínicas continuam sob responsabilidade da profissional habilitada.</p>
      </section>
      <section>
        <h3>4. Uso responsável</h3>
        <p>Não é permitido usar a plataforma para expor dados dos pacientes, inserir conteúdo ilegal ou utilizar as informações para finalidade diferente do acompanhamento autorizado.</p>
      </section>
      <section>
        <h3>5. Alterações</h3>
        <p>Como o Roxy está em evolução acadêmica, recursos e documentos podem ser atualizados para melhorar segurança, clareza e funcionamento.</p>
      </section>
    </>
  )
}

function PrivacyContent() {
  return (
    <>
      <p className="legal-updated">Última atualização: 23 de novembro de 2026</p>
      <section>
        <h3>1. Dados utilizados</h3>
        <p>Podem ser cadastrados dados da profissional, informações do paciente e responsáveis, registros de sessões, avaliações, observações e áudios salvos pela profissional.</p>
      </section>
      <section>
        <h3>2. Finalidade</h3>
        <p>Os dados são usados para organizar os atendimentos, acompanhar a evolução, gerar prontuários e permitir a revisão de atividades realizadas durante a consulta.</p>
      </section>
      <section>
        <h3>3. Dados de crianças</h3>
        <p>Informações infantis exigem cuidado especial. A profissional deve possuir autorização do responsável e cadastrar somente o necessário para o acompanhamento fonoaudiológico.</p>
      </section>
      <section>
        <h3>4. Áudio e imagem</h3>
        <p>Gravações só devem ser mantidas quando necessárias e autorizadas. A foto de perfil é opcional e serve apenas para identificar a profissional dentro do sistema.</p>
      </section>
      <section>
        <h3>5. Controle e exclusão</h3>
        <p>A profissional pode excluir gravações e registros disponíveis na plataforma quando não forem mais necessários. Em uma implantação real, acesso, armazenamento e backup devem seguir a LGPD e as regras da clínica responsável.</p>
      </section>
    </>
  )
}

interface SidebarProps {
  patients: Patient[]
  professional: Professional | null
  selectedPatientId: string
  view: AppView
  onNavigate: (view: AppView) => void
  onPatientChange: (patientId: string) => void
  onLogout: () => void
}

function Sidebar({ patients, professional, selectedPatientId, view, onNavigate, onPatientChange, onLogout }: SidebarProps) {
  const items: Array<{ label: string; view: AppView; icon: typeof UsersRound }> = [
    { label: 'Dashboard', view: 'dashboard', icon: BarChart3 },
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

      <label className="patient-switcher">
        <span>Paciente ativo</span>
        <select value={selectedPatientId} onChange={(event) => onPatientChange(event.target.value)} disabled={!patients.length}>
          {patients.length ? (
            patients.map((patient) => (
              <option value={patient.id} key={patient.id}>
                {patient.name}
              </option>
            ))
          ) : (
            <option>Nenhum paciente</option>
          )}
        </select>
      </label>

      <div className="professional-card">
        <span className="avatar-dot">
          {professional?.photoUrl ? (
            <img src={professional.photoUrl} alt={`Foto de ${professional.name || 'profissional'}`} />
          ) : (
            <UserRound size={23} aria-hidden="true" />
          )}
        </span>
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
  exercise?: Exercise
  view: AppView
}

function Header({ exercise, view }: HeaderProps) {
  const defaultCopy = viewTitles[view]
  const copy = exercise
    ? {
        title: `Prática: ${exercise.name}`,
        subtitle:
          exercise.mode === 'choice'
            ? 'A criança escolhe uma resposta e a fonoaudióloga registra a avaliação.'
            : exercise.mode === 'breathing'
              ? 'Conduza cada etapa respiratória e registre a resposta observada.'
              : exercise.mode === 'narrative'
                ? 'A criança constrói a narrativa e a fonoaudióloga registra a avaliação.'
                : 'A criança fala, o sistema registra o áudio e a avaliação fica com a fonoaudióloga.',
      }
    : defaultCopy

  return (
    <header className="page-header">
      <div>
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>
    </header>
  )
}

interface DashboardViewProps {
  patients: Patient[]
  selectedPatientId: string
  sessions: SessionRecord[]
  onDeleteAudio: (sessionId: string, clipId: string) => void
  onNewPatient: () => void
  onOpenPatient: (patient: Patient) => void
  onStartExercise: (patient: Patient, exerciseId: ExerciseId) => void
}

function DashboardView({
  patients,
  selectedPatientId,
  sessions,
  onDeleteAudio,
  onNewPatient,
  onOpenPatient,
  onStartExercise,
}: DashboardViewProps) {
  const totalAudioClips = sessions.reduce((sum, session) => sum + (session.audioClips?.length ?? 0), 0)
  const totalBadges = sessions.length
  const averageProgress = sessions.length
    ? Math.round((sessions.reduce((sum, session) => sum + session.score / session.total, 0) / sessions.length) * 100)
    : 0

  const patientStats = patients.map((patient) => {
    const patientSessions = sessions.filter((session) => session.patientId === patient.id)
    const progress = patientSessions.length
      ? Math.round((patientSessions.reduce((sum, session) => sum + session.score / session.total, 0) / patientSessions.length) * 100)
      : 0
    const lastSession = patientSessions[0]
    const nextExercise = getExercise(patient.exercises[0]) ?? exercises[0]

    return {
      patient,
      progress,
      lastSession,
      nextExercise,
      audioCount: patientSessions.reduce((sum, session) => sum + (session.audioClips?.length ?? 0), 0),
      sessionCount: patientSessions.length,
    }
  })

  const latestSessions = sessions.slice(0, 5)

  return (
    <section className="dashboard-shell">
      <div className="dashboard-stats">
        <article className="stat-card panel">
          <UsersRound size={28} />
          <span>Pacientes</span>
          <strong>{patients.length}</strong>
        </article>
        <article className="stat-card panel">
          <Activity size={28} />
          <span>Evolução média</span>
          <strong>{averageProgress}%</strong>
        </article>
        <article className="stat-card panel">
          <Award size={28} />
          <span>Cartas entregues</span>
          <strong>{totalBadges}</strong>
        </article>
        <article className="stat-card panel">
          <Radio size={28} />
          <span>Áudios salvos</span>
          <strong>{totalAudioClips}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel dashboard-patients">
          <div className="panel-title-row">
            <div>
              <span className="section-kicker">Acompanhamento</span>
              <h2>Progresso dos pacientes</h2>
            </div>
          </div>

          <div className="dashboard-patient-list">
            {patientStats.length ? (
              patientStats.map(({ patient, progress, lastSession, nextExercise, audioCount, sessionCount }) => (
                <div className={patient.id === selectedPatientId ? 'dashboard-patient active' : 'dashboard-patient'} key={patient.id}>
                  <div className="patient-avatar">
                    <UserRound size={24} />
                  </div>
                  <div className="dashboard-patient-copy">
                    <button onClick={() => onOpenPatient(patient)}>{patient.name}</button>
                    <span>{lastSession ? `Última sessão: ${lastSession.exerciseName}` : 'Ainda sem sessão registrada'}</span>
                    <ProgressLine label="Progresso" value={progress} color="#8f79ff" />
                  </div>
                  <div className="dashboard-patient-meta">
                    <span>{sessionCount} sessões</span>
                    <span>{audioCount} áudios</span>
                    <button className="pill-button mini" onClick={() => onStartExercise(patient, nextExercise.id)}>
                      <PlayCircle size={15} /> Praticar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-empty-patients">
                <span className="patient-avatar"><UserRound size={26} /></span>
                <div>
                  <strong>Nenhum paciente cadastrado</strong>
                  <p>Cadastre o primeiro paciente para iniciar o acompanhamento clínico.</p>
                </div>
                <button className="primary-button compact" onClick={onNewPatient}>
                  <PlusCircle size={17} /> Novo Paciente
                </button>
              </div>
            )}
          </div>
        </article>

        <aside className="dashboard-side">
          <article className="panel">
            <span className="section-kicker">Sessões recentes</span>
            <h2>Últimos atendimentos</h2>
            <div className="recent-session-list">
              {latestSessions.length ? (
                latestSessions.map((session) => {
                  const patient = patients.find((item) => item.id === session.patientId)
                  return (
                    <div className="recent-session" key={session.id}>
                      <div>
                        <strong>{patient?.name ?? 'Paciente removido'}</strong>
                        <span>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p>{session.exerciseName}</p>
                      <small>
                        {session.score}/{session.total} - {session.badge.name}
                      </small>
                    </div>
                  )
                })
              ) : (
                <p className="muted">As últimas sessões aparecem aqui quando os exercícios forem concluídos.</p>
              )}
            </div>
          </article>

          <article className="panel">
            <span className="section-kicker">Áudios</span>
            <h2>Gravações para revisar</h2>
            <AudioClipList
              sessions={latestSessions}
              patients={patients}
              compact
              onDelete={onDeleteAudio}
            />
          </article>
        </aside>
      </div>
    </section>
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
        {filteredPatients.length ? (
          filteredPatients.map((patient) => (
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
          ))
        ) : (
          <section className="panel empty-state search-empty">
            <Search size={36} />
            <h2>Nenhum paciente encontrado</h2>
            <p>Revise o nome, ID, responsável, telefone, diagnóstico ou exercício pesquisado.</p>
          </section>
        )}
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
  const [patient, setPatient] = useState<Patient>(() =>
    initialPatient ?? ({
      ...emptyPatient,
      id: createId(),
      createdAt: new Date().toISOString(),
    }),
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
                {exercise.id === 'monte-historias' && <BookOpen size={27} />}
                {exercise.id === 'sons-e-mais' && <Volume2 size={27} />}
                {exercise.id === 'nomeie-imagem' && <Images size={27} />}
                {exercise.id === 'complete-frase' && <MessageCircle size={27} />}
                {exercise.id === 'sequencia-sonora' && <Radio size={27} />}
                {exercise.id === 'sopro-respiracao' && <Wind size={27} />}
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
  recordedClips: Record<string, AudioClip>
  recordingPromptId: string | null
  micLevel: number
  soundStatus: SoundStatus
  onBack: () => void
  onListen: () => void
  onRate: (rating: Rating) => void
}

function PracticeView({
  exercise,
  patient,
  queue,
  recordedClips,
  recordingPromptId,
  micLevel,
  soundStatus,
  onBack,
  onListen,
  onRate,
}: PracticeViewProps) {
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({})
  const currentPrompt = queue[0]
  const selectedChoice = currentPrompt ? selectedChoices[currentPrompt.id] ?? null : null
  const needsMicrophone = exercise.mode === 'voice' || exercise.mode === 'narrative'
  const needsChoice = exercise.mode === 'choice'
  const currentClip = currentPrompt ? recordedClips[currentPrompt.id] : undefined
  const canRate = needsMicrophone
    ? soundStatus === 'detected' || soundStatus === 'unavailable' || (soundStatus === 'silent' && Boolean(currentClip))
    : needsChoice
      ? selectedChoice !== null
      : true
  const currentIndex = exercise.prompts.length - queue.length + 1
  const completed = exercise.prompts.length - queue.length
  const progressPercent = (completed / exercise.prompts.length) * 100
  const isRecordingCurrent = soundStatus === 'recording' && recordingPromptId === currentPrompt?.id

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
            {currentPrompt.options && (
              <div className="prompt-options" aria-label="Opções de resposta">
                {currentPrompt.options.map((option) => (
                  <button
                    className={selectedChoice === option ? 'selected' : ''}
                    key={option}
                    onClick={() => setSelectedChoices((current) => ({ ...current, [currentPrompt.id]: option }))}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {needsMicrophone ? (
            <>
              <button
                className={`mic-button ${soundStatus}`}
                onClick={onListen}
                disabled={soundStatus === 'processing' || soundStatus === 'requesting'}
              >
                {isRecordingCurrent ? <Square size={24} /> : <Mic size={26} />}
              </button>

              <div
                aria-label={isRecordingCurrent ? `Nível do microfone: ${Math.round(micLevel * 100)}%` : 'Indicador do microfone'}
                className={`mic-level ${isRecordingCurrent ? 'active' : ''}`}
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <i className={micLevel >= (index + 1) / 12 ? 'lit' : ''} key={index} />
                ))}
              </div>

              <p className="sound-feedback">
                {soundStatus === 'idle' && 'Aperte o microfone para gravar a resposta da criança.'}
                {soundStatus === 'requesting' && 'Solicitando acesso ao microfone do dispositivo...'}
                {soundStatus === 'recording' && 'Gravando e ajustando a sensibilidade ao ambiente... fale em direção ao dispositivo.'}
                {soundStatus === 'processing' && 'Salvando áudio da resposta...'}
                {soundStatus === 'detected' && 'Áudio salvo e voz detectada. Avaliação liberada.'}
                {soundStatus === 'silent' && currentClip && 'Áudio salvo com volume baixo. Você pode ouvir, avaliar manualmente ou gravar novamente.'}
                {soundStatus === 'silent' && !currentClip && 'Nenhum áudio foi captado. Verifique a permissão do microfone e tente novamente.'}
                {soundStatus === 'unavailable' && 'Microfone indisponível. Avaliação manual liberada.'}
              </p>
            </>
          ) : needsChoice ? (
            <p className="sound-feedback choice-feedback">
              {selectedChoice
                ? `Resposta selecionada: ${selectedChoice}. A fonoaudióloga pode avaliar.`
                : 'Selecione a resposta da criança para liberar a avaliação.'}
            </p>
          ) : (
            <p className="sound-feedback choice-feedback">
              Conduza a etapa com a criança e registre abaixo como ela realizou a atividade.
            </p>
          )}

          {currentClip && (
            <div className="inline-audio">
              <Radio size={17} />
              <div>
                <strong>Áudio deste card salvo</strong>
                <small>{Math.max(1, Math.round(currentClip.durationMs / 1000))}s de gravação</small>
              </div>
              <audio controls src={currentClip.dataUrl} />
            </div>
          )}

          <div className="rating-actions">
            <button className="rate-ok" disabled={!canRate} onClick={() => onRate('ok')} aria-label="Avaliação correta" title="Correto">
              <Check size={25} />
            </button>
            <button className="rate-later" disabled={!canRate} onClick={() => onRate('later')} aria-label="Avaliação incorreta" title="Incorreto">
              <X size={25} />
            </button>
            <button className="rate-retry" disabled={!canRate} onClick={() => onRate('retry')} aria-label="Desempenho parcial" title="Parcial">
              <ArrowRight size={25} />
            </button>
          </div>
        </div>

        <aside className="practice-side">
          <div className="side-card">
            <span>Fila</span>
            <div className="queue-dots">
              {exercise.prompts.map((prompt) => (
                <i className={queue.some((item) => item.id === prompt.id) ? 'pending' : 'done'} key={prompt.id} />
              ))}
            </div>
            <p>Cada avaliação fica registrada e o atendimento segue para o próximo card.</p>
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

  const percentage = Math.round((record.score / record.total) * 100)
  const isComplete = percentage === 100

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
          <p>
            {isComplete
              ? 'Excelente participação. A atividade foi concluída integralmente.'
              : `Atividade concluída parcialmente: ${percentage}% de aproveitamento.`}
            {' '}A carta já ficou salva no prontuário do paciente.
          </p>
          {(record.audioClips?.length ?? 0) > 0 && <p>{record.audioClips?.length} áudio(s) salvo(s) para revisão clínica.</p>}
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
                    {(session.audioClips?.length ?? 0) > 0 && (
                      <AudioClipList sessions={[session]} patients={patient ? [patient] : []} compact />
                    )}
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

interface AudioClipListProps {
  compact?: boolean
  onDelete?: (sessionId: string, clipId: string) => void
  patients: Patient[]
  sessions: SessionRecord[]
}

interface AudioDeleteDialogProps {
  onCancel: () => void
  onConfirm: () => void
  target: AudioDeleteTarget
}

function AudioDeleteDialog({ onCancel, onConfirm, target }: AudioDeleteDialogProps) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onCancel])

  return (
    <div className="delete-dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        aria-describedby="delete-audio-description"
        aria-labelledby="delete-audio-title"
        aria-modal="true"
        className="delete-dialog"
        role="alertdialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button aria-label="Fechar" className="delete-dialog-close" type="button" onClick={onCancel}>
          <X size={19} />
        </button>

        <span className="delete-dialog-icon" aria-hidden="true">
          <Trash2 size={26} />
        </span>
        <p className="delete-dialog-eyebrow">Áudio salvo</p>
        <h2 id="delete-audio-title">Excluir esta gravação?</h2>
        <p id="delete-audio-description">
          A gravação <strong>“{target.promptTitle}”</strong> será removida do histórico de {target.patientName}.
          Esta ação não poderá ser desfeita.
        </p>

        <div className="delete-dialog-context" aria-label="Detalhes da gravação">
          <span><Mic size={17} /> Exercício</span>
          <strong>{target.exerciseName}</strong>
        </div>

        <div className="delete-dialog-actions">
          <button className="ghost-button" type="button" onClick={onCancel}>Cancelar</button>
          <button className="danger-button" type="button" onClick={onConfirm} autoFocus>
            <Trash2 size={18} /> Excluir áudio
          </button>
        </div>
      </section>
    </div>
  )
}

function AudioClipList({ compact = false, onDelete, patients, sessions }: AudioClipListProps) {
  const clips = sessions.flatMap((session) =>
    (session.audioClips ?? []).map((clip) => ({
      clip,
      patient: patients.find((patient) => patient.id === session.patientId),
      session,
    })),
  )

  if (!clips.length) {
    return <p className="muted">Nenhum áudio salvo ainda.</p>
  }

  return (
    <div className={compact ? 'audio-list compact' : 'audio-list'}>
      {clips.map(({ clip, patient, session }) => (
        <div className="audio-item" key={clip.id}>
          <div className="audio-item-header">
            <div>
              <strong>{clip.promptTitle}</strong>
              <span>
                {patient?.name ? `${patient.name} - ` : ''}
                {session.exerciseName} - {new Date(clip.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {onDelete && (
              <button
                aria-label={`Excluir áudio de ${clip.promptTitle}`}
                className="audio-delete-button"
                title="Excluir áudio"
                type="button"
                onClick={() => onDelete(session.id, clip.id)}
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
          <audio controls src={clip.dataUrl} />
        </div>
      ))}
    </div>
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
