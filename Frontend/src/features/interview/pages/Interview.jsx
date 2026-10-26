import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useInterview } from '../hooks/useInterview.js'

const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'technical', label: 'Technical questions' },
    { id: 'behavioral', label: 'Behavioral questions' },
    { id: 'skills', label: 'Skill gaps' },
    { id: 'roadmap', label: 'Preparation roadmap' }
]

const asArray = (value) => Array.isArray(value) ? value : []

const scoreTone = (score) => {
    if (score >= 80) return { text: 'text-[#2F8067]', ring: 'border-[#2F8067]', label: 'Strong estimated match' }
    if (score >= 60) return { text: 'text-[#B7791F]', ring: 'border-[#B7791F]', label: 'Moderate estimated match' }
    return { text: 'text-[#D94841]', ring: 'border-[#D94841]', label: 'Early preparation opportunity' }
}

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(index === 0)
    const answerId = `answer-${index}-${item.question?.slice(0, 12).replace(/\W/g, '') || 'question'}`

    return (
        <article className="overflow-hidden rounded-2xl border border-[#D6CCC4]/80 bg-white">
            <button
                aria-controls={answerId}
                aria-expanded={open}
                className="flex min-w-0 w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[#FFFCF8] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1D6B61] sm:p-5"
                onClick={() => setOpen((value) => !value)}
                type="button"
            >
                <span className="mt-0.5 shrink-0 rounded-lg bg-[#1D6B61]/10 px-2 py-1 text-xs font-bold text-[#1D6B61]">Q{index + 1}</span>
                <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-6 text-[#192421]">{item.question || 'Question unavailable'}</span>
                <span className={`shrink-0 text-[#65716B] transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
            </button>
            {open && (
                <div className="space-y-5 border-t border-[#D6CCC4]/70 bg-[#FFFCF8] p-4 sm:p-5" id={answerId}>
                    {item.intention && <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-[#1D6B61]">What this evaluates</p><p className="break-words text-sm leading-6 text-[#65716B]">{item.intention}</p></div>}
                    {item.answer && <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-[#1D6B61]">Suggested answer guidance</p><p className="whitespace-pre-line break-words text-sm leading-7 text-[#192421]">{item.answer}</p></div>}
                </div>
            )}
        </article>
    )
}

const EmptyState = ({ children }) => <div className="rounded-2xl border border-dashed border-[#D6CCC4] bg-white p-6 text-sm leading-6 text-[#65716B]">{children}</div>

const Interview = () => {
    const [activeSection, setActiveSection] = useState('overview')
    const [downloadError, setDownloadError] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const { report, loading, reportError, getReportById, getResumePdf } = useInterview()
    const { handleLogout } = useAuth()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    if (loading && !report) {
        return <main className="flex min-h-dvh items-center justify-center bg-[#F7F5F0] px-4 text-[#192421]"><div className="text-center"><span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#1D6B61]/20 border-t-[#1D6B61]" aria-hidden="true" /><p className="mt-4 text-sm text-[#65716B]">Loading your interview report...</p></div></main>
    }

    if (!report) {
        const message = reportError?.response?.data?.message || 'We could not load this interview report.'
        return (
            <main className="flex min-h-dvh items-center justify-center bg-[#F7F5F0] px-4 text-[#192421]">
                <section className="w-full max-w-md rounded-3xl border border-[#D6CCC4]/80 bg-white p-6 text-center shadow-[0_20px_55px_rgba(25,36,33,0.09)] sm:p-8" role="alert">
                    <h1 className="text-2xl font-bold">Report unavailable</h1>
                    <p className="mt-3 text-sm leading-6 text-[#65716B]">{message}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button className="min-h-11 rounded-xl bg-[#E85D4F] px-5 text-sm font-semibold text-white hover:bg-[#D94B40] focus:outline-none focus:ring-2 focus:ring-[#E85D4F] focus:ring-offset-2" onClick={() => getReportById(interviewId)} type="button">Try again</button>
                        <button className="min-h-11 rounded-xl border border-[#D6CCC4] px-5 text-sm font-semibold text-[#1D6B61] hover:border-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2" onClick={() => navigate('/')} type="button">Back to generator</button>
                    </div>
                </section>
            </main>
        )
    }

    const technicalQuestions = asArray(report.technicalQuestions)
    const behavioralQuestions = asArray(report.behavioralQuestions)
    const skillGaps = asArray(report.skillGaps)
    const preparationPlan = asArray(report.preparationPlan)
    const validScore = typeof report.matchScore === 'number' && Number.isFinite(report.matchScore) && report.matchScore >= 0 && report.matchScore <= 100
    const tone = validScore ? scoreTone(report.matchScore) : null

    const handleDownload = async () => {
        setDownloadError('')
        setIsDownloading(true)
        try {
            await getResumePdf(interviewId)
        } catch (error) {
            console.error(error)
            setDownloadError(error.response?.data?.message || 'We could not generate the tailored resume. Please try again.')
        } finally {
            setIsDownloading(false)
        }
    }

    const renderQuestions = (items, title) => (
        <section aria-labelledby={`${title}-heading`}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1D6B61]">Practice set</p><h2 className="text-2xl font-bold" id={`${title}-heading`}>{title}</h2></div>
                <span className="rounded-full border border-[#D6CCC4] bg-white px-3 py-1 text-xs font-semibold text-[#65716B]">{items.length} {items.length === 1 ? 'question' : 'questions'}</span>
            </div>
            {items.length ? <div className="space-y-3">{items.map((item, index) => <QuestionCard key={`${item.question || 'question'}-${index}`} index={index} item={item} />)}</div> : <EmptyState>No {title.toLowerCase()} are available in this report.</EmptyState>}
        </section>
    )

    return (
        <main className="min-h-dvh overflow-x-hidden bg-[#F7F5F0] text-[#192421]">
            <header className="border-b border-[#D6CCC4]/70 bg-white/80">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <button className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2" onClick={() => navigate('/')} type="button"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D6B61] text-lg font-bold text-white" aria-hidden="true">I</span><span className="truncate text-lg font-bold tracking-tight">Interview AI</span></button>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-4"><button className="rounded-lg px-2 py-2 text-sm font-semibold text-[#1D6B61] hover:bg-[#1D6B61]/[0.06] focus:outline-none focus:ring-2 focus:ring-[#1D6B61]" onClick={() => navigate('/')} type="button">New plan</button><button className="rounded-lg px-2 py-2 text-sm font-semibold text-[#1D6B61] underline decoration-transparent underline-offset-4 hover:decoration-current focus:outline-none focus:ring-2 focus:ring-[#1D6B61]" onClick={handleLogout} type="button">Log out</button></div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0"><p className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-[#1D6B61]">Interview AI / Report</p><h1 className="break-words text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Your Interview Preparation Report</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#65716B]">Personalized guidance based on the profile and target role you supplied.</p>{report.title && <p className="mt-3 break-words text-sm font-semibold text-[#1D6B61]">Target role: {report.title}</p>}</div>
                    <button className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E85D4F] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(232,93,79,0.16)] hover:bg-[#D94B40] focus:outline-none focus:ring-2 focus:ring-[#E85D4F] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:self-start lg:self-auto" disabled={isDownloading} onClick={handleDownload} type="button">{isDownloading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />} {isDownloading ? 'Preparing resume...' : 'Download tailored resume'}</button>
                </section>
                {downloadError && <p className="mb-6 rounded-xl border border-[#D94841]/25 bg-[#D94841]/[0.06] px-4 py-3 text-sm leading-5 text-[#D94841]" role="alert">{downloadError}</p>}

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_250px]">
                    <div className="min-w-0">
                        <nav aria-label="Report sections" className="mb-8 flex gap-2 overflow-x-auto border-b border-[#D6CCC4]/70 pb-2">
                            {sections.map((section) => <button className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D6B61] ${activeSection === section.id ? 'bg-[#1D6B61] text-white' : 'text-[#65716B] hover:bg-white hover:text-[#192421]'}`} key={section.id} onClick={() => setActiveSection(section.id)} type="button">{section.label}</button>)}
                        </nav>

                        {activeSection === 'overview' && (
                            <section aria-labelledby="overview-heading" className="space-y-6">
                                <div className="rounded-3xl border border-[#D6CCC4]/80 bg-white p-5 shadow-[0_12px_35px_rgba(25,36,33,0.06)] sm:p-7"><p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1D6B61]">Executive overview</p><h2 className="text-2xl font-bold" id="overview-heading">Your preparation starts here</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#65716B]">Use the practice questions, skill-gap signals, and roadmap below to focus your preparation on the supplied role.</p></div>
                                {renderQuestions(technicalQuestions.slice(0, 3), 'Technical questions')}
                                {renderQuestions(behavioralQuestions.slice(0, 3), 'Behavioral questions')}
                            </section>
                        )}
                        {activeSection === 'technical' && renderQuestions(technicalQuestions, 'Technical questions')}
                        {activeSection === 'behavioral' && renderQuestions(behavioralQuestions, 'Behavioral questions')}
                        {activeSection === 'skills' && <section aria-labelledby="skills-heading"><p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1D6B61]">Readiness signals</p><h2 className="mb-5 text-2xl font-bold" id="skills-heading">Skill gaps</h2>{skillGaps.length ? <div className="grid gap-3 sm:grid-cols-2">{skillGaps.map((gap, index) => { const severity = ['low', 'medium', 'high'].includes(gap.severity) ? gap.severity : 'unknown'; const styles = { high: 'border-[#D94841]/30 bg-[#D94841]/[0.05] text-[#D94841]', medium: 'border-[#B7791F]/30 bg-[#B7791F]/[0.06] text-[#8A5A08]', low: 'border-[#2F8067]/30 bg-[#2F8067]/[0.05] text-[#2F8067]', unknown: 'border-[#D6CCC4] bg-white text-[#65716B]' }; return <article className={`rounded-2xl border p-5 ${styles[severity]}`} key={`${gap.skill || 'skill'}-${index}`}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-words font-bold text-[#192421]">{gap.skill || 'Skill unavailable'}</h3><span className="rounded-full border border-current px-2 py-1 text-xs font-bold capitalize">{severity === 'unknown' ? 'Severity unavailable' : `${severity} priority`}</span></div></article> })}</div> : <EmptyState>No skill-gap analysis is available in this report.</EmptyState>}</section>}
                        {activeSection === 'roadmap' && <section aria-labelledby="roadmap-heading"><p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1D6B61]">Action plan</p><h2 className="mb-5 text-2xl font-bold" id="roadmap-heading">Preparation roadmap</h2>{preparationPlan.length ? <div className="relative space-y-4">{preparationPlan.map((day, index) => <article className="relative rounded-2xl border border-[#D6CCC4]/80 bg-white p-5 sm:ml-6" key={`${day.day ?? 'step'}-${index}`}><span className="absolute -left-3 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-[#1D6B61] text-xs font-bold text-white sm:-left-9">{index + 1}</span><div className="flex flex-wrap items-baseline gap-2"><span className="text-sm font-bold text-[#1D6B61]">{day.day != null ? `Day ${day.day}` : `Step ${index + 1}`}</span><h3 className="break-words font-bold">{day.focus || 'Preparation focus unavailable'}</h3></div>{asArray(day.tasks).length ? <ul className="mt-4 space-y-2">{day.tasks.map((task, taskIndex) => <li className="flex gap-2 text-sm leading-6 text-[#65716B]" key={`${task}-${taskIndex}`}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E85D4F]" aria-hidden="true" /> <span className="break-words">{task}</span></li>)}</ul> : <p className="mt-3 text-sm text-[#65716B]">No tasks are listed for this step.</p>}</article>)}</div> : <EmptyState>No preparation roadmap is available in this report.</EmptyState>}</section>}
                    </div>

                    <aside className="space-y-5">
                        <section aria-labelledby="score-heading" className="rounded-3xl border border-[#D6CCC4]/80 bg-white p-5 shadow-[0_12px_35px_rgba(25,36,33,0.06)]"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#65716B]">At a glance</p><h2 className="mt-2 text-lg font-bold" id="score-heading">Profile-to-role match</h2>{validScore ? <div className="mt-5 text-center"><div className={`mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border-[10px] ${tone.ring}`} aria-label={`AI-estimated profile-to-role match score: ${report.matchScore} percent`} role="img"><span className={`text-3xl font-extrabold ${tone.text}`}>{report.matchScore}</span><span className="text-xs font-semibold text-[#65716B]">percent</span></div><p className={`mt-4 text-sm font-bold ${tone.text}`}>{tone.label}</p></div> : <div className="mt-5 rounded-xl bg-[#FFFCF8] p-4 text-sm leading-6 text-[#65716B]">Match score unavailable for this report.</div>}<p className="mt-4 text-xs leading-5 text-[#65716B]">This is an AI-estimated signal based on the supplied information, not a guaranteed ATS score or hiring outcome.</p></section>
                        <section className="rounded-3xl border border-[#D6CCC4]/80 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#65716B]">Report contents</p><div className="mt-4 space-y-3 text-sm text-[#65716B]"><button className="flex w-full justify-between gap-3 text-left hover:text-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-[#1D6B61]" onClick={() => setActiveSection('technical')} type="button"><span>Technical questions</span><span>{technicalQuestions.length}</span></button><button className="flex w-full justify-between gap-3 text-left hover:text-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-[#1D6B61]" onClick={() => setActiveSection('behavioral')} type="button"><span>Behavioral questions</span><span>{behavioralQuestions.length}</span></button><button className="flex w-full justify-between gap-3 text-left hover:text-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-[#1D6B61]" onClick={() => setActiveSection('skills')} type="button"><span>Skill gaps</span><span>{skillGaps.length}</span></button><button className="flex w-full justify-between gap-3 text-left hover:text-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-[#1D6B61]" onClick={() => setActiveSection('roadmap')} type="button"><span>Roadmap steps</span><span>{preparationPlan.length}</span></button></div></section>
                    </aside>
                </div>
            </div>
        </main>
    )
}

export default Interview
