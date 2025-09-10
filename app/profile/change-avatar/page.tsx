"use client"

import { ChangeAvatarPage } from "@/components/pages/change-avatar-page"
import { useRouter } from "next/navigation"

export default function ChangeAvatar() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return <ChangeAvatarPage onBack={handleBack} />
}
