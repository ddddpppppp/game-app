/**
 * 时间工具类
 * 处理UTC时间到本地时间的转换和格式化
 */
export class TimeUtils {
  /**
   * 计算剩余时间（基于本地时间）
   * @param utcEndTime UTC结束时间字符串
   * @returns 剩余秒数
   */
  static calculateTimeLeft(utcEndTime: string): number {
    if (!utcEndTime) return 0
    
    try {
      const utcDate = new Date(utcEndTime + (utcEndTime.includes('Z') ? '' : 'Z'))
      const now = new Date()
      const diffInSeconds = Math.floor((utcDate.getTime() - now.getTime()) / 1000)
      return Math.max(0, diffInSeconds)
    } catch (error) {
      console.error('Time calculation error:', error)
      return 0
    }
  }

  /**
   * 格式化消息时间（显示时分）
   * @param utcTimeString UTC时间字符串
   * @returns 格式化的本地时间字符串 (HH:mm)
   */
  static formatMessageTime(utcTimeString: string): string {
    if (!utcTimeString) return ''
    
    try {
      const utcDate = new Date(utcTimeString + (utcTimeString.includes('Z') ? '' : 'Z'))
      return utcDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (error) {
      console.error('Time formatting error:', error)
      return utcTimeString
    }
  }

  /**
   * 将UTC时间转换为本地时间字符串
   * @param utcTimeString UTC时间字符串
   * @returns 本地时间字符串 (YYYY-MM-DD HH:mm:ss)
   */
  static convertUTCToLocal(utcTimeString: string): string {
    if (!utcTimeString) return ''
    
    try {
      const utcDate = new Date(utcTimeString + (utcTimeString.includes('Z') ? '' : 'Z'))
      return utcDate.toLocaleString('sv-SE') // 使用ISO格式 YYYY-MM-DD HH:mm:ss
    } catch (error) {
      console.error('Date conversion error:', error)
      return utcTimeString
    }
  }

  /**
   * 格式化倒计时显示
   * @param seconds 剩余秒数
   * @returns 格式化的时间字符串 (mm:ss)
   */
  static formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * 检查时间是否过期
   * @param utcTimeString UTC时间字符串
   * @returns 是否已过期
   */
  static isExpired(utcTimeString: string): boolean {
    if (!utcTimeString) return true
    
    try {
      const utcDate = new Date(utcTimeString + (utcTimeString.includes('Z') ? '' : 'Z'))
      const now = new Date()
      return utcDate.getTime() <= now.getTime()
    } catch (error) {
      console.error('Time check error:', error)
      return true
    }
  }
} 