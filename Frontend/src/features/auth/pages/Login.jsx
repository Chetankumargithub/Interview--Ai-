import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)
    const [ errors, setErrors ] = useState({})
    const [ apiError, setApiError ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        const nextErrors = {}
        if (!email.trim()) nextErrors.email = "Enter your email address."
        if (!password) nextErrors.password = "Enter your password."

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
            setApiError("")
            return
        }

        setErrors({})
        setApiError("")
        const result = await handleLogin({ email, password })

        if (result?.success) {
            navigate('/')
        } else if (result?.error) {
            const message = result.error.code === "ERR_NETWORK"
                ? "We couldn't reach the server. Make sure the backend is running and try again."
                : result.error.response?.data?.message
                || result.error.message
                || "We couldn't sign you in. Please check your details and try again."
            setApiError(message)
        }
    }

    return (
        <main className="flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-[#F7F5F0] px-3 py-6 text-[#192421] sm:px-6 sm:py-12">
            <section className="mx-auto w-full min-w-0 max-w-md rounded-3xl border border-[#D6CCC4]/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFCF8_52%,#F1F7F5_100%)] p-6 shadow-[0_20px_55px_rgba(25,36,33,0.09)] sm:p-10" aria-labelledby="login-heading">
                    <div className="mb-9">
                        <div className="mb-8 flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D6B61] text-lg font-bold text-white shadow-[0_6px_14px_rgba(29,107,97,0.18)]" aria-hidden="true">I</span>
                            <span className="text-lg font-bold tracking-tight text-[#192421]">Interview AI</span>
                        </div>
                        <p className="mb-3 text-xs font-semibold uppercase leading-5 tracking-[0.13em] text-[#1D6B61] sm:text-sm">Your next opportunity starts here</p>
                        <h1 id="login-heading" className="text-3xl font-bold leading-tight tracking-tight text-[#192421] sm:text-4xl">Welcome back</h1>
                        <p className="mt-3 max-w-sm text-pretty text-sm leading-6 text-[#65716B] sm:text-base">Continue building your confidence, one interview at a time.</p>
                    </div>

                    {apiError && (
                        <div className="mb-5 break-words rounded-xl border border-[#D94841]/30 bg-[#D94841]/[0.08] px-4 py-3 text-sm leading-5 text-[#D94841]" role="alert">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold leading-5 text-[#192421]" htmlFor="email">Email address</label>
                            <input
                                className={`h-12 w-full min-w-0 rounded-xl border bg-[#FFFCF8] px-4 text-base text-[#192421] outline-none transition-colors placeholder:text-[#65716B]/70 hover:border-[#1D6B61]/60 focus:ring-2 focus:ring-offset-0 [&:-webkit-autofill]:bg-[#FFFCF8] [&:-webkit-autofill]:[-webkit-text-fill-color:#192421] ${errors.email ? "border-[#D94841] focus:border-[#D94841] focus:ring-[#D94841]/20" : "border-[#D6CCC4] focus:border-[#1D6B61] focus:ring-[#1D6B61]/20"}`}
                                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: "" }) }}
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? "email-error" : undefined}
                            />
                            {errors.email && <p id="email-error" className="mt-2 text-sm text-[#D94841]">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold leading-5 text-[#192421]" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    className={`h-12 w-full min-w-0 rounded-xl border bg-[#FFFCF8] px-4 pr-14 text-base text-[#192421] outline-none transition-colors placeholder:text-[#65716B]/70 hover:border-[#1D6B61]/60 focus:ring-2 focus:ring-offset-0 [&:-webkit-autofill]:bg-[#FFFCF8] [&:-webkit-autofill]:[-webkit-text-fill-color:#192421] ${errors.password ? "border-[#D94841] focus:border-[#D94841] focus:ring-[#D94841]/20" : "border-[#D6CCC4] focus:border-[#1D6B61] focus:ring-[#1D6B61]/20"}`}
                                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: "" }) }}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                />
                                <button
                                    type="button"
                                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-[#65716B] transition-colors hover:bg-[#1D6B61]/[0.08] hover:text-[#1D6B61] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1D6B61]"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span aria-hidden="true">{showPassword ? "Hide" : "Show"}</span>
                                </button>
                            </div>
                            {errors.password && <p id="password-error" className="mt-2 text-sm text-[#D94841]">{errors.password}</p>}
                        </div>
                        <button
                            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#E85D4F] px-4 text-base font-semibold text-white shadow-[0_8px_18px_rgba(232,93,79,0.18)] transition-colors hover:bg-[#D94B40] focus:outline-none focus:ring-2 focus:ring-[#E85D4F] focus:ring-offset-2 focus:ring-offset-[#FFFCF8] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? "Signing you in..." : "Log in"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm leading-6 text-[#65716B]">
                        Don&apos;t have an account?{" "}
                        <Link className="font-semibold text-[#1D6B61] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus:outline-none focus:ring-2 focus:ring-[#1D6B61] focus:ring-offset-2 focus:ring-offset-[#FFFCF8]" to="/register">Create one</Link>
                    </p>
            </section>
        </main>
    )
}

export default Login