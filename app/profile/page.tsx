"use client"

import { ProfilePage } from "@/components/pages/profile-page"
import { useAuth } from "@/components/auth-provider"

export default function Profile() {
  const { logout } = useAuth()

  return <ProfilePage onLogout={logout} />
}
