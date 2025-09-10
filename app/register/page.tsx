"use client"

import { RegisterPage } from "@/components/pages/register-page"
import { useRouter } from "next/navigation"

export default function Register() {
  const router = useRouter()

  const handleSwitchToLogin = () => {
    router.push("/login")
  }

  return <RegisterPage onSwitchToLogin={handleSwitchToLogin} />
}
