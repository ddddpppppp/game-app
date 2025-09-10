import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios'

// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://php.game-hub.cc'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token（根据后端代码，使用 Token 头）
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Token = token
    }
    
    // 添加时区信息
    config.headers.Timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 根据后端返回格式：{ status: 1, data: {}, message: '' }
    // status 为 1 表示成功，0 表示失败，-3 表示需要重新登录
    if (response.data.status === 1) {
      return response.data
    } else {
      // 对于错误情况，抛出包含错误信息的异常
      const errorMessage = response.data.message || response.data.statusText || 'Request failed'
      return Promise.reject(new Error(errorMessage))
    }
  },
  (error: AxiosError) => {
    // 处理HTTP状态码错误
    if (error.response?.status === 401 || (error.response?.data as any)?.status === -3) {
      // Token 过期或无效，清除认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // 返回更友好的错误信息
    const errorMessage = (error.response?.data as any)?.message || error.message || 'Network error'
    return Promise.reject(new Error(errorMessage))
  }
)

export default api 