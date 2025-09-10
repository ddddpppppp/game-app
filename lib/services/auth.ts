import api from '../api'

// 接口类型定义
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  code: string
  parent_id?: number
}

export interface SendCodeRequest {
  email: string
  type: 'register' | 'reset_password'
}

export interface ResetPasswordRequest {
  email: string
  code: string
  new_password: string
}

export interface EditUserInfoRequest {
  avatar?: string
  nickname?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface User {
  id: number
  email: string
  name: string
  avatar: string
  balance: number
  join_date: string
  level: number
  total_wins: number
  vip: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiResponse<T = any> {
  status: number
  data: T
  message?: string
}

// 认证服务
class AuthService {
  // 用户登录
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/api/user/login', data)
    return response.data
  }

  // 用户注册
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/api/user/register', data)
    return response.data
  }

  // 发送验证码
  async sendVerificationCode(data: SendCodeRequest): Promise<{ message: string }> {
    const response = await api.post('/api/user/sendVerificationCode', data)
    return response.data
  }

  // 重置密码
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/api/user/resetPassword', data)
    return response.data
  }

  // 获取用户信息
  async getUserInfo(): Promise<{ token: string, user: User }> {
    const response = await api.post('/api/user/getUserInfo')
    return response.data
  }

  // 修改用户信息（昵称和头像）
  async editUserInfo(data: EditUserInfoRequest): Promise<{ user: User }> {
    const response = await api.post('/api/user/editUserInfo', data)
    return response.data
  }

  // 修改密码
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/api/user/changePassword', data)
    return response.data
  }

  // 退出登录
  async logout(): Promise<void> {
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export const authService = new AuthService() 