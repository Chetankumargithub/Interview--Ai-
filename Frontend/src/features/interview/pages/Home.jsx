import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import GenerationProgressDialog from '../components/GenerationProgressDialog'
import { useInterview } from '../hooks/useInterview.js'

const MAX_JOB_DESCRIPTION_LENGTH = 5000
const MAX_RESUME_SIZE = 3 * 1024 * 1024

const formatFileSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()
    const resumeInputRef = useRef(null)

    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [resumeFile, setResumeFile] = useState(null)
    const [fileError, setFileError] = useState('')
    const [formError, setFormError] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [generationState, setGenerationState] = useState('idle')
    const [generationError, setGenerationError] = useState('')

    const selectResume = (file) => {
        setFileError('')
        if (!file) return

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setResumeFile(null)
            setFileError('Please choose a PDF resume.')
            return
        }

        if (file.size > MAX_RESUME_SIZE) {
            setResumeFile(null)
            setFileError('Your resume must be 3 MB or smaller.')
            return
        }

        setResumeFile(file)
    }

    const handleFileChange = (event) => {
        selectResume(event.target.files[0])
        event.target.value = ''
    }

    const handleGenerateReport = async (event) => {
        event.preventDefault()
        const nextError = !jobDescription.trim()
            ? 'Add the job description to continue.'
            : !resumeFile
                ? 'Upload a PDF resume to continue.'
                : ''

        if (nextError) {
            setFormError(nextError)
            return
        }

        setFormError('')
        setGenerationError('')
        setGenerationState('loading')

        try {
            const data = await generateReport({
                jobDescription: jobDescription.trim(),
                selfDescription: selfDescription.trim(),
                resumeFile
            })

            if (!data?._id) {
                throw new Error('The server returned an incomplete interview plan.')
            }

            setGenerationState('idle')
            navigate(`/interview/${data._id}`)
        } catch (error) {
            console.error(error)
            setGenerationError(error.response?.data?.message || error.message || 'Please try again.')
            setGenerationState('error')
        }
    }

    const removeResume = () => {
        setResumeFile(null)
        setFileError('')
    }

    const isGenerationDialogVisible = generationState !== 'idle'

    return (
        <main className="min-h-dvh overflow-x-hidden bg-[#F7F5F0] text-[#192421]">
            <div inert={isGenerationDialogVisible ? '' : undefined} aria-hidden={isGenerationDialogVisible}>
            <header className="border-b border-[#D6CCC4]/70 bg-[#FFFFFF]/80">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <button className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2" onClick={() => navigate('/')} type="button">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D6B61] text-lg font-bold text-white shadow-[0_6px_14px_rgba(29,107,97,0.18)]" aria-hidden="true">I</span>
                        <span className="truncate text-lg font-bold tracking-tight">Interview AI</span>
                    </button>
                    <div className="flex shrink-0 items-center gap-3">
                        {user?.username && <span className="hidden max-w-32 truncate text-sm text-[#65716B] sm:block">Hi, {user.username}</span>}
                        <button className="rounded-lg px-2 py-2 text-sm font-semibold text-[#1D6B61] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2" onClick={handleLogout} type="button">Log out</button>
                    </div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <section className="mx-auto max-w-3xl text-center" aria-labelledby="plan-heading">
                    <p className="mb-3 text-xs font-semibold uppercase leading-5 tracking-[0.13em] text-[#1D6B61] sm:text-sm">Your next opportunity starts here</p>
                    <h1 id="plan-heading" className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Build your interview strategy</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-6 text-[#65716B] sm:text-base">Share your target role and background to create a personalized interview preparation plan.</p>
                </section>

                <form className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-[#D6CCC4]/80 bg-white shadow-[0_20px_55px_rgba(25,36,33,0.09)] sm:mt-10" onSubmit={handleGenerateReport} noValidate>
                    <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-2 lg:gap-10">
                        <section aria-labelledby="job-section-heading">
                            <div className="mb-5">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1D6B61]">01 / Target role</p>
                                <h2 id="job-section-heading" className="text-xl font-bold">Job description</h2>
                                <p className="mt-2 text-sm leading-5 text-[#65716B]">Paste the requirements and responsibilities for the role you want to prepare for.</p>
                            </div>
                            <label className="mb-2 block text-sm font-semibold" htmlFor="jobDescription">Job description <span className="text-[#D94841]" aria-hidden="true">*</span></label>
                            <textarea
                                className={`min-h-64 w-full resize-y rounded-xl border bg-[#FFFCF8] px-4 py-3 text-base leading-6 outline-none transition-colors placeholder:text-[#65716B]/70 hover:border-[#1D6B61]/60 focus:ring-2 focus:ring-[#1D6B61]/20 ${jobDescription.length >= MAX_JOB_DESCRIPTION_LENGTH ? 'border-[#D94841] focus:border-[#D94841]' : 'border-[#D6CCC4] focus:border-[#1D6B61]'}`}
                                id="jobDescription"
                                name="jobDescription"
                                maxLength={MAX_JOB_DESCRIPTION_LENGTH}
                                onChange={(event) => { setJobDescription(event.target.value); setFormError('') }}
                                placeholder="Paste the full job description here, including the skills and responsibilities..."
                                value={jobDescription}
                                aria-describedby="job-description-count"
                            />
                            <p id="job-description-count" className={`mt-2 text-right text-xs ${jobDescription.length >= MAX_JOB_DESCRIPTION_LENGTH ? 'text-[#D94841]' : 'text-[#65716B]'}`}>{jobDescription.length} / {MAX_JOB_DESCRIPTION_LENGTH} characters</p>
                        </section>

                        <section aria-labelledby="profile-section-heading">
                            <div className="mb-5">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1D6B61]">02 / Your background</p>
                                <h2 id="profile-section-heading" className="text-xl font-bold">Tell us about yourself</h2>
                                <p className="mt-2 text-sm leading-5 text-[#65716B]">Add context about your skills, education, projects, and experience.</p>
                            </div>
                            <label className="mb-2 block text-sm font-semibold" htmlFor="selfDescription">Tell us about yourself <span className="font-normal text-[#65716B]">(optional)</span></label>
                            <textarea
                                className="min-h-32 w-full resize-y rounded-xl border border-[#D6CCC4] bg-[#FFFCF8] px-4 py-3 text-base leading-6 outline-none transition-colors placeholder:text-[#65716B]/70 hover:border-[#1D6B61]/60 focus:border-[#1D6B61] focus:ring-2 focus:ring-[#1D6B61]/20"
                                id="selfDescription"
                                name="selfDescription"
                                onChange={(event) => setSelfDescription(event.target.value)}
                                placeholder="Share your key skills, education, projects, and experience..."
                                value={selfDescription}
                            />

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-semibold" htmlFor="resume">Resume <span className="text-[#D94841]" aria-hidden="true">*</span></label>
                                <div
                                    className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${isDragging ? 'border-[#1D6B61] bg-[#1D6B61]/[0.06]' : fileError ? 'border-[#D94841] bg-[#D94841]/[0.03]' : 'border-[#D6CCC4] bg-[#FFFCF8] hover:border-[#1D6B61]/70'}`}
                                    onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectResume(event.dataTransfer.files[0]) }}
                                >
                                    <input ref={resumeInputRef} className="sr-only" id="resume" name="resume" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} />
                                    {resumeFile ? (
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D6B61]/10 text-sm font-bold text-[#1D6B61]" aria-hidden="true">PDF</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">{resumeFile.name}</p>
                                                <p className="mt-1 text-xs text-[#65716B]">{formatFileSize(resumeFile.size)}</p>
                                            </div>
                                            <button className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-[#1D6B61] underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#1D6B61]" onClick={removeResume} type="button">Remove</button>
                                        </div>
                                    ) : (
                                        <label className="block cursor-pointer rounded-xl p-3 text-center focus-within:ring-2 focus-within:ring-[#1D6B61]" htmlFor="resume">
                                            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D6B61]/10 text-[#1D6B61]" aria-hidden="true">↑</span>
                                            <span className="mt-3 block text-sm font-semibold">Upload your PDF resume</span>
                                            <span className="mt-1 block text-xs leading-5 text-[#65716B]">Drag and drop here, or choose a file · 3 MB maximum</span>
                                        </label>
                                    )}
                                </div>
                                {fileError && <p className="mt-2 text-sm leading-5 text-[#D94841]" role="alert">{fileError}</p>}
                            </div>
                        </section>
                    </div>

                    <div className="border-t border-[#D6CCC4]/70 bg-[#FFFCF8] px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-8">
                        <div className="mb-4 min-w-0 sm:mb-0">
                            {formError && <p className="text-sm leading-5 text-[#D94841]" role="alert">{formError}</p>}
                            <p className="text-xs leading-5 text-[#65716B]">Your information is used to prepare your personalized interview plan.</p>
                        </div>
                        <button className="flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E85D4F] px-5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(232,93,79,0.18)] transition-colors hover:bg-[#D94B40] focus:outline-none focus:ring-2 focus:ring-[#E85D4F] focus:ring-offset-2 focus:ring-offset-[#FFFCF8] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none sm:w-auto" disabled={loading || isGenerationDialogVisible} type="submit">
                            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                            {loading ? 'Generating your plan...' : 'Generate Interview Plan'}
                        </button>
                    </div>
                </form>

                {reports.length > 0 && (
                    <section className="mx-auto mt-10 max-w-4xl" aria-labelledby="recent-plans-heading">
                        <h2 id="recent-plans-heading" className="mb-4 text-xl font-bold">Recent interview plans</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {reports.map((report) => (
                                <button className="min-w-0 rounded-2xl border border-[#D6CCC4]/80 bg-white p-4 text-left transition-colors hover:border-[#1D6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2" key={report._id} onClick={() => navigate(`/interview/${report._id}`)} type="button">
                                    <span className="block truncate font-semibold">{report.title || 'Untitled position'}</span>
                                    <span className="mt-2 block text-sm text-[#65716B]">Generated on {new Date(report.createdAt).toLocaleDateString()}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>
            </div>
            {isGenerationDialogVisible && (
                <GenerationProgressDialog
                    error={generationState === 'error' ? generationError : ''}
                    onClose={() => {
                        setGenerationError('')
                        setGenerationState('idle')
                    }}
                />
            )}
        </main>
    )
}

export default Home
