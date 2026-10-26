import { useEffect, useRef, useState } from 'react'

const STATUS_MESSAGES = [
    'Preparing your information for analysis...',
    'Reviewing your target role and job requirements...',
    'Analyzing your profile against the role...',
    'Preparing personalized interview questions...',
    'Organizing your preparation roadmap...',
    'Getting your report ready...'
]

const GenerationProgressDialog = ({ error, onClose }) => {
    const dialogRef = useRef(null)
    const previouslyFocusedRef = useRef(document.activeElement)
    const [statusIndex, setStatusIndex] = useState(0)

    useEffect(() => {
        dialogRef.current?.focus()
        const previousFocus = previouslyFocusedRef.current

        return () => {
            if (previousFocus instanceof HTMLElement) {
                previousFocus.focus()
            }
        }
    }, [])

    useEffect(() => {
        if (error || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return undefined
        }

        const timer = window.setInterval(() => {
            setStatusIndex((currentIndex) => (currentIndex + 1) % STATUS_MESSAGES.length)
        }, 2500)

        return () => window.clearInterval(timer)
    }, [error])

    const handleKeyDown = (event) => {
        if (event.key !== 'Tab') return

        const focusableElements = dialogRef.current?.querySelectorAll(
            'button:not([disabled]), [tabindex="0"]'
        )
        if (!focusableElements?.length) {
            event.preventDefault()
            return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-[#192421]/45 p-4 backdrop-blur-[2px] sm:p-6" role="presentation">
            <section
                ref={dialogRef}
                aria-describedby="generation-dialog-description"
                aria-labelledby="generation-dialog-title"
                aria-modal="true"
                className="w-full max-w-md rounded-3xl border border-[#D6CCC4]/80 bg-white p-6 text-center shadow-[0_24px_70px_rgba(25,36,33,0.2)] outline-none sm:p-8"
                onKeyDown={handleKeyDown}
                role="dialog"
                tabIndex="-1"
            >
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${error ? 'bg-[#D94841]/10 text-[#D94841]' : 'bg-[#1D6B61]/10 text-[#1D6B61]'}`} aria-hidden="true">
                    {error ? (
                        <span className="text-2xl font-bold">!</span>
                    ) : (
                        <span className="h-7 w-7 rounded-full border-[3px] border-[#1D6B61]/20 border-t-[#1D6B61] motion-safe:animate-spin" />
                    )}
                </div>
                <h2 id="generation-dialog-title" className="mt-5 text-xl font-bold text-[#192421] sm:text-2xl">
                    {error ? 'We could not build your plan' : 'Building your interview strategy'}
                </h2>
                <p id="generation-dialog-description" className="mt-3 text-sm leading-6 text-[#65716B]">
                    {error ? 'Your information is still here. Please try generating your plan again.' : 'Your personalized preparation plan is on its way.'}
                </p>

                {error ? (
                    <p className="mt-5 rounded-xl border border-[#D94841]/25 bg-[#D94841]/[0.06] px-4 py-3 text-left text-sm leading-5 text-[#D94841]" role="alert">
                        {error}
                    </p>
                ) : (
                    <p className="mt-6 min-h-5 text-sm font-semibold text-[#1D6B61]" aria-live="polite">
                        {STATUS_MESSAGES[statusIndex]}
                    </p>
                )}

                <p className="mt-6 text-xs leading-5 text-[#65716B]">
                    {error ? 'You can review your entries and retry when ready.' : 'This may take a little while. Please keep this page open.'}
                </p>
                {error && (
                    <button
                        className="mt-6 min-h-11 w-full rounded-xl border border-[#D6CCC4] px-4 text-sm font-semibold text-[#1D6B61] transition-colors hover:border-[#1D6B61] hover:bg-[#1D6B61]/[0.05] focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2"
                        onClick={onClose}
                        type="button"
                    >
                        Back to form
                    </button>
                )}
            </section>
        </div>
    )
}

export default GenerationProgressDialog
