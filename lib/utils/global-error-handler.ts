import { apiService } from '@/lib/services/api'

/**
 * 全局错误处理器 - 发送错误到后端API
 */
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private errorQueue: any[] = []
  private isProcessing = false

  private constructor() {
    this.setupGlobalHandlers()
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  /**
   * 设置全局错误监听器
   */
  private setupGlobalHandlers() {
    if (typeof window === 'undefined') return

    // 捕获未处理的JavaScript错误
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      })
    })

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
      })
    })

    // 监听React错误（需要配合ErrorBoundary使用）
    const originalConsoleError = console.error
    console.error = (...args) => {
      // 检查是否是React错误
      const errorMessage = args.join(' ')
      if (errorMessage.includes('Warning:') || 
          errorMessage.includes('Error:') ||
          errorMessage.includes('client-side exception')) {
        this.captureError({
          type: 'react_error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        })
      }
      originalConsoleError.apply(console, args)
    }
  }

  /**
   * 捕获并发送错误
   */
  async captureError(errorData: any) {
    try {
      // 添加环境信息
      const enrichedError = {
        ...errorData,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: errorData.timestamp || new Date().toISOString(),
        // 获取用户信息（如果已登录）
        user_token: localStorage.getItem('token'),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        // 页面信息
        page_info: {
          title: document.title,
          referrer: document.referrer,
        }
      }

      // 添加到队列
      this.errorQueue.push(enrichedError)
      
      // 处理队列
      await this.processErrorQueue()
      
    } catch (error) {
      console.error('Failed to capture error:', error)
    }
  }

  /**
   * 处理错误队列
   */
  private async processErrorQueue() {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.errorQueue.length > 0) {
        const error = this.errorQueue.shift()
        await this.sendErrorToAPI(error)
        
        // 避免发送太快，添加小延迟
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Error processing error queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 发送错误到API
   */
  private async sendErrorToAPI(errorData: any) {
    try {
      await apiService.appError({
        error_type: errorData.type || 'client_error',
        error_message: errorData.message,
        error_stack: errorData.stack,
        error_details: JSON.stringify(errorData),
        client_info: {
          url: errorData.url,
          userAgent: errorData.userAgent,
          viewport: errorData.viewport,
          timestamp: errorData.timestamp,
        }
      })
      
      console.log('Error sent to API successfully')
      
    } catch (apiError) {
      console.error('Failed to send error to API:', apiError)
      
      // 如果发送失败，可以考虑存储到localStorage稍后重试
      this.storeErrorForRetry(errorData)
    }
  }

  /**
   * 存储错误以便稍后重试
   */
  private storeErrorForRetry(errorData: any) {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('pending_errors') || '[]')
      storedErrors.push(errorData)
      
      // 限制存储的错误数量，避免占用太多空间
      if (storedErrors.length > 50) {
        storedErrors.splice(0, storedErrors.length - 50)
      }
      
      localStorage.setItem('pending_errors', JSON.stringify(storedErrors))
    } catch (error) {
      console.error('Failed to store error for retry:', error)
    }
  }

  /**
   * 重试发送存储的错误
   */
  async retryPendingErrors() {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('pending_errors') || '[]')
      
      if (storedErrors.length === 0) return

      for (const error of storedErrors) {
        try {
          await this.sendErrorToAPI(error)
        } catch (retryError) {
          console.error('Retry failed for error:', retryError)
          break // 如果重试失败，停止处理剩余错误
        }
      }

      // 清空已成功发送的错误
      localStorage.removeItem('pending_errors')
      
    } catch (error) {
      console.error('Failed to retry pending errors:', error)
    }
  }

  /**
   * 手动报告错误
   */
  reportError(error: Error, context?: any) {
    this.captureError({
      type: 'manual_report',
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
    })
  }
}

// 导出单例实例
export const globalErrorHandler = GlobalErrorHandler.getInstance()

// 在应用启动时尝试发送之前失败的错误
if (typeof window !== 'undefined') {
  // 延迟执行，确保API服务已初始化
  setTimeout(() => {
    globalErrorHandler.retryPendingErrors()
  }, 5000)
}
