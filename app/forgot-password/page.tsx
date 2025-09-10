"use client"

import { ForgotPasswordPage } from "@/components/pages/forgot-password-page"
import { useRouter } from "next/navigation"

export default function ForgotPassword() {
  const router = useRouter()

  const handleBackToLogin = () => {
    router.push("/login")
  }

  return <ForgotPasswordPage onBackToLogin={handleBackToLogin} />
} 