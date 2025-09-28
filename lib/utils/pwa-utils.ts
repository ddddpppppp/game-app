/**
 * 触发PWA安装提示
 * 通过派发自定义事件来显示全局的PWA安装提示组件
 */
export function showPWAInstallPrompt() {
  // 派发自定义事件来触发PWA安装提示
  const event = new CustomEvent('show-pwa-prompt')
  window.dispatchEvent(event)
}

/**
 * 检查是否在PWA模式下运行
 */
export function isPWAMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

/**
 * 检查是否为iOS设备
 */
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}
