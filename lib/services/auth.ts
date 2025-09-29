import api from '../api'

// 接口类型定义
export interface LoginRequest {
  email: string
  password: string
  isApp: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  code: string
  device_code?: string
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

export interface BalanceDetail {
  total_balance: number
  gift_balance: number
  other_balance: number
  withdrawable_balance: number
  gift_withdrawable: boolean
  total_bet_amount: number
  required_bet_amount: number
  gift_transaction_times: number
}

export interface User {
  uuid: string
  email: string
  name: string
  avatar: string
  balance: number
  balance_detail?: BalanceDetail
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

// 交易记录接口
export interface Transaction {
  id: number
  type: string
  amount: number
  gift: number
  fee: number
  status: string
  created_at: string
  remark?: string // 备注信息，失败时包含拒绝理由
}

// 充值响应接口
export interface DepositResponse {
  transaction_id: number
  order_no: string
  method: string
  amount: number
  expired_at: string
  payment_url?: string
  deposit_address?: string
  usdt_amount?: number
}

// 提现响应接口
export interface WithdrawResponse {
  transaction_id: number
  order_no: string
  amount: number
  fee: number
  actual_amount: number
  status: string
  created_at: string
}

// 余额历史接口
export interface BalanceHistory {
  id: number
  type: string
  amount: number
  description: string
  created_at: string
}

// 今日变化接口
export interface DailyChange {
  today_change: number
  today_change_percent: number
  yesterday_balance: number
  today_balance: number
}

// 系统设置接口
export interface SystemSetting {
  name: string
  title: string
  description: string
  config: {
    // 分离的支付方式限额配置
    usdt_min_amount: number
    usdt_max_amount: number
    cashapp_min_amount: number
    cashapp_max_amount: number
    usdc_online_min_amount: number
    usdc_online_max_amount: number
    // 赠送比例配置
    usdt_gift_rate: number
    cashapp_gift_rate: number
    usdc_online_gift_rate: number
    // 其他配置
    usdt_fee_rate?: number
    cashapp_fee_rate?: number
    usdc_online_fee_rate?: number
    daily_limit?: number
    [key: string]: any
  }
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

  // 获取交易记录
  async getTransactionHistory(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
  }): Promise<{
    transactions: Transaction[]
    total: number
    current_page: number
    last_page: number
  }> {
    const response = await api.get('/api/user/getTransactionHistory', { params })
    return response.data
  }

  // 创建充值订单
  async createDeposit(amount: number, method: 'cashapp' | 'usdt' | 'usdc_online'): Promise<DepositResponse> {
    const response = await api.post('/api/user/createDeposit', {
      amount,
      method
    })
    return response.data
  }

  // 创建提现订单
  async createWithdraw(amount: number, method: 'cashapp' | 'usdt' | 'usdc_online', address?: string): Promise<WithdrawResponse> {
    const response = await api.post('/api/user/createWithdraw', {
      amount,
      method,
      account: address
    })
    return response.data
  }

  // 获取充值订单状态
  async getDepositStatus(orderNo: string): Promise<{
    order_no: string
    status: string
    status_text: string
    amount: number
    actual_amount: number
    created_at: string
    expired_at: string
    is_expired: boolean
  }> {
    const response = await api.get('/api/user/getDepositStatus', {
      params: { order_no: orderNo }
    })
    return response.data
  }

  // 获取系统设置
  async getSystemSettings(type: string): Promise<SystemSetting> {
    const response = await api.get('/api/api/getSystemSettings', {
      params: { type }
    })
    return response.data
  }

  // 获取余额历史
  async getBalanceHistory(params?: {
    page?: number
    limit?: number
  }): Promise<{
    balance_list: BalanceHistory[]
    total: number
    current_page: number
    last_page: number
  }> {
    const response = await api.get('/api/user/getBalanceHistory', { params })
    return response.data
  }

  // 获取今日变化
  async getDailyChange(): Promise<DailyChange> {
    const response = await api.get('/api/user/getDailyChange')
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