"use client"

import { ChangeNicknamePage } from "@/components/pages/change-nickname-page"
import { useRouter } from "next/navigation"

export default function ChangeNickname() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return <ChangeNicknamePage onBack={handleBack} />
}
