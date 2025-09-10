"use client"

import { LoginPage } from "@/components/pages/login-page"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

  const handleSwitchToRegister = () => {
    router.push("/register")
  }

  const handleForgotPassword = () => {
    router.push("/forgot-password")
  }

  return <LoginPage onSwitchToRegister={handleSwitchToRegister} onForgotPassword={handleForgotPassword} />
}

