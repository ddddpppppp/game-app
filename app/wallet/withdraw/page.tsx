"use client"

import { WithdrawPage } from "@/components/pages/withdraw-page"
import { useRouter } from "next/navigation"

export default function Withdraw() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return <WithdrawPage onBack={handleBack} />
}
