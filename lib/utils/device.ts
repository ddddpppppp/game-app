/**
 * 设备识别工具
 */

/**
 * 生成设备码
 * 基于浏览器信息、屏幕信息等生成唯一的设备标识
 */
export function generateDeviceCode(): string {
  try {
    // 收集设备信息
    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      screenColorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      cookieEnabled: navigator.cookieEnabled,
    }

    // 尝试获取设备内存信息（如果可用）
    if ('deviceMemory' in navigator) {
      // @ts-ignore
      deviceInfo.deviceMemory = navigator.deviceMemory
    }

    // 将设备信息转换为字符串并生成哈希
    const deviceString = JSON.stringify(deviceInfo)
    
    // 简单的哈希函数
    let hash = 0
    for (let i = 0; i < deviceString.length; i++) {
      const char = deviceString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    // 转换为正数并转为16进制
    const deviceCode = Math.abs(hash).toString(16)
    
    return deviceCode
  } catch (error) {
    console.warn('生成设备码失败，使用随机值:', error)
    // 如果出错，生成一个随机设备码
    return Math.random().toString(16).substr(2, 8)
  }
}

/**
 * 获取或生成设备码（带缓存）
 * 首次生成后会存储在localStorage中
 */
export function getDeviceCode(): string {
  const STORAGE_KEY = 'device_code'
  
  try {
    // 尝试从localStorage获取已保存的设备码
    const savedDeviceCode = localStorage.getItem(STORAGE_KEY)
    if (savedDeviceCode) {
      return savedDeviceCode
    }
  } catch (error) {
    console.warn('无法从localStorage读取设备码:', error)
  }
  
  // 生成新的设备码
  const deviceCode = generateDeviceCode()
  
  try {
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, deviceCode)
  } catch (error) {
    console.warn('无法保存设备码到localStorage:', error)
  }
  
  return deviceCode
}
