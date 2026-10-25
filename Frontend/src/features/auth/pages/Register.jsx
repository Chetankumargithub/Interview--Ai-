import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const inputBaseClass = 'h-12 w-full min-w-0 rounded-xl border bg-[#FFFCF8] px-4 text-base text-[#192421] outline-none transition-colors placeholder:text-[#65716B]/70 hover:border-[#1D6B61]/60 focus:ring-2 focus:ring-offset-0 [&:-webkit-autofill]:bg-[#FFFCF8] [&:-webkit-autofill]:[-webkit-text-fill-color:#192421]'

const Register = () => {
    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')

    const updateField = (field, value) => {
        const setters = {
            username: setUsername,
            email: setEmail,
            password: setPassword,
            confirmPassword: setConfirmPassword
        }

        setters[field](value)
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' })
        }
        if (field === 'password' && errors.confirmPassword) {
            setErrors({ ...errors, password: '', confirmPassword: '' })
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const nextErrors = {}
        if (!username.trim()) nextErrors.username = 'Enter a username.'
        if (!email.trim()) {
            nextErrors.email = 'Enter your email address.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = 'Enter a valid email address.'
        }
        if (!password) nextErrors.password = 'Create a password.'
        if (!confirmPassword) {
            nextErrors.confirmPassword = 'Confirm your password.'
        } else if (password !== confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match.'
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
            setApiError('')
            return
        }

        setErrors({})
        setApiError('')
        const result = await handleRegister({
            username: username.trim(),
            email: email.trim(),
            password
        })

        if (result?.success) {
            navigate('/')
        } else if (result?.error) {
            const message = result.error.code === 'ERR_NETWORK'
                ? "We couldn't reach the server. Make sure the backend is running and try again."
                : result.error.response?.data?.message
                || result.error.message
                || "We couldn't create your account. Please try again."
            setApiError(message)
        }
    }

    const fieldClass = (field) => (
        `${inputBaseClass} ${errors[field]
            ? 'border-[#D94841] focus:border-[#D94841] focus:ring-[#D94841]/20'
            : 'border-[#D6CCC4] focus:border-[#1D6B61] focus:ring-[#1D6B61]/20'}`
    )

    return (
        <main className="flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-[#F7F5F0] px-3 py-6 text-[#192421] sm:px-6 sm:py-12">
            <section
                className="mx-auto w-full min-w-0 max-w-lg rounded-3xl border border-[#D6CCC4]/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFCF8_52%,#F1F7F5_100%)] p-6 shadow-[0_20px_55px_rgba(25,36,33,0.09)] sm:p-10"
                aria-labelledby="register-heading"
            >
                <div className="mb-8 sm:mb-9">
                    <div className="mb-7 flex items-center gap-3 sm:mb-8">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D6B61] text-lg font-bold text-white shadow-[0_6px_14px_rgba(29,107,97,0.18)]" aria-hidden="true">I</span>
                        <span className="text-lg font-bold tracking-tight text-[#192421]">Interview AI</span>
                    </div>
                    <p className="mb-3 text-xs font-semibold uppercase leading-5 tracking-[0.13em] text-[#1D6B61] sm:text-sm">Your next opportunity starts here</p>
                    <h1 id="register-heading" className="text-3xl font-bold leading-tight tracking-tight text-[#192421] sm:text-4xl">Create your account</h1>
                    <p className="mt-3 max-w-sm text-pretty text-sm leading-6 text-[#65716B] sm:text-base">Start preparing for your next interview with confidence.</p>
                </div>

                {apiError && (
                    <div className="mb-5 break-words rounded-xl border border-[#D94841]/30 bg-[#D94841]/[0.08] px-4 py-3 text-sm leading-5 text-[#D94841]" role="alert">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold leading-5 text-[#192421]" htmlFor="username">Username</label>
                        <input
                            className={fieldClass('username')}
                            onChange={(event) => updateField('username', event.target.value)}
                            type="text"
                            id="username"
                            name="username"
                            autoComplete="username"
                            placeholder="Choose a username"
                            aria-invalid={Boolean(errors.username)}
                            aria-describedby={errors.username ? 'username-error' : undefined}
                        />
                        {errors.username && <p id="username-error" className="mt-2 text-sm leading-5 text-[#D94841]">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold leading-5 text-[#192421]" htmlFor="email">Email address</label>
                        <input
                            className={fieldClass('email')}
                            onChange={(event) => updateField('email', event.target.value)}
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && <p id="email-error" className="mt-2 text-sm leading-5 text-[#D94841]">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold leading-5 text-[#192421]" htmlFor="password">Password</label>
                        <div className="relative">
                            <input
                                className={`${fieldClass('password')} pr-14`}
                                onChange={(event) => updateField('password', event.target.value)}
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="Create a password"
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                            <button
                                type="button"
                                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-[#65716B] transition-colors hover:bg-[#1D6B61]/[0.08] hover:text-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1D6B61]"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <span aria-hidden="true">{showPassword ? 'Hide' : 'Show'}</span>
                            </button>
                        </div>
                        {errors.password && <p id="password-error" className="mt-2 text-sm leading-5 text-[#D94841]">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold leading-5 text-[#192421]" htmlFor="confirm-password">Confirm password</label>
                        <div className="relative">
                            <input
                                className={`${fieldClass('confirmPassword')} pr-14`}
                                onChange={(event) => updateField('confirmPassword', event.target.value)}
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirm-password"
                                name="confirm-password"
                                autoComplete="new-password"
                                placeholder="Repeat your password"
                                aria-invalid={Boolean(errors.confirmPassword)}
                                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                            />
                            <button
                                type="button"
                                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-[#65716B] transition-colors hover:bg-[#1D6B61]/[0.08] hover:text-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1D6B61]"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                            >
                                <span aria-hidden="true">{showConfirmPassword ? 'Hide' : 'Show'}</span>
                            </button>
                        </div>
                        {errors.confirmPassword && <p id="confirm-password-error" className="mt-2 text-sm leading-5 text-[#D94841]">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#E85D4F] px-4 text-base font-semibold text-white shadow-[0_8px_18px_rgba(232,93,79,0.18)] transition-colors hover:bg-[#D94B40] focus:outline-none focus:ring-2 focus:ring-[#E85D4F] focus:ring-offset-2 focus:ring-offset-[#FFFCF8] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="mt-7 text-center text-sm leading-6 text-[#65716B] sm:mt-8">
                    Already have an account?{' '}
                    <Link className="font-semibold text-[#1D6B61] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2 focus:ring-offset-[#FFFCF8]" to="/login">Log in</Link>
                </p>
            </section>
        </main>
    )
}

export default Register
