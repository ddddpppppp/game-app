"use client"

import { RegisterPage } from "@/components/pages/register-page"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function Register() {
  const { login } = useAuth()
  const router = useRouter()

  const handleRegister = () => {
    login()
  }

  const handleSwitchToLogin = () => {
    router.push("/login")
  }

  return <RegisterPage onRegister={handleRegister} onSwitchToLogin={handleSwitchToLogin} />
}
