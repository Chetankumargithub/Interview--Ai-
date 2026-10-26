import axios from "axios"

const apiBaseUrl = import.meta.env.VITE_API_URL
    || (import.meta.env.PROD
        ? "https://interview-ai-backend-3ac3.onrender.com"
        : "http://localhost:3000")

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true
})

export async function register({ username, email, password }) {
    const response = await api.post('/api/auth/register', {
        username, email, password
    })

    return response.data
}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
        throw err
    }

}

export async function logout() {
    const response = await api.get("/api/auth/logout")
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}