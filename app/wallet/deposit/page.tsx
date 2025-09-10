"use client"

import { DepositPage } from "@/components/pages/deposit-page"
import { useRouter } from "next/navigation"

export default function Deposit() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return <DepositPage onBack={handleBack} />
}
