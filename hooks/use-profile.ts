import { useState, useEffect } from 'react'
import { authService, EditUserInfoRequest, ChangePasswordRequest } from '@/lib/services/auth'
import { apiService } from '@/lib/services/api'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'

export function useProfile() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { user, login } = useAuth()
  const { toast } = useToast()

  const refreshUserInfo = async () => {
    setIsRefreshing(true)
    try {
      const response = await authService.getUserInfo()
      
      // 更新认证上下文中的用户信息
      if (!localStorage.getItem('token')) {
        login(response.token, response.user)
      }
      
      return response.user
    } catch (error: any) {
      console.error('Failed to refresh user info:', error)
      toast({
        title: "Error",
        description: "Failed to refresh user information",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsRefreshing(false)
    }
  }

  // 修改用户信息（昵称和头像）
  const updateUserInfo = async (data: EditUserInfoRequest) => {
    setIsUpdating(true)
    try {
      const response = await authService.editUserInfo(data)
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      
      return response.user
    } catch (error: any) {
      console.error('Failed to update user info:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  // 修改密码
  const changePassword = async (data: ChangePasswordRequest) => {
    setIsUpdating(true)
    try {
      const response = await authService.changePassword(data)
      
      toast({
        title: "Success",
        description: response.message || "Password changed successfully",
      })
      
      return response
    } catch (error: any) {
      console.error('Failed to change password:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  // 上传文件
  const uploadFile = async (file: File) => {
    setIsUploading(true)
    try {
      const response = await apiService.uploadFile(file)
      return response
    } catch (error: any) {
      console.error('Failed to upload file:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // 在profile页面加载时自动刷新用户信息
  useEffect(() => {
    refreshUserInfo().catch(() => {
      // 错误已在refreshUserInfo中处理
    })
  }, []) // 只在组件挂载时执行一次

  return {
    user,
    isRefreshing,
    isUpdating,
    isUploading,
    refreshUserInfo,
    updateUserInfo,
    changePassword,
    uploadFile,
  }
} 