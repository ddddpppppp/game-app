"use client"

import { ChangePasswordPage } from "@/components/pages/change-password-page"
import { useRouter } from "next/navigation"

export default function ChangePassword() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return <ChangePasswordPage onBack={handleBack} />
}
