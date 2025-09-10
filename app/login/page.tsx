"use client"

import { LoginPage } from "@/components/pages/login-page"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function Login() {
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    login()
  }

  const handleSwitchToRegister = () => {
    router.push("/register")
  }

  return <LoginPage onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />
}
