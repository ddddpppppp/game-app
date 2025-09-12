export interface WebSocketMessage {
  action: string;
  data?: any;
}

export interface WebSocketConfig {
  url: string;
  heartbeatInterval?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onReconnecting?: (attempt: number) => void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isDestroyed = false;
  private isConnecting = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      heartbeatInterval: 10000, // 10秒心跳
      reconnectInterval: 5000,  // 5秒重连间隔
      maxReconnectAttempts: 5,  // 最大重连次数
      onMessage: () => {},
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
      onReconnecting: () => {},
      ...config,
    };
  }

  // 连接WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error('WebSocket已销毁'));
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('正在连接中'));
        return;
      }

      this.isConnecting = true;

      try {
        const url = "wss://go.game-hub.cc" + this.config.url;
        const token = localStorage.getItem('token');
        if (token) {
            this.ws = new WebSocket(url + "?token=" + encodeURIComponent(token));
        } else {
            this.ws = new WebSocket(url);
        }

        this.ws.onopen = () => {
          console.log('WebSocket 连接成功');
          this.isConnecting = false;
          this.reconnectAttempts = 0; // 重置重连次数
          this.startHeartbeat();
          this.config.onConnect();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // 处理心跳响应
            if (data.action === 'heartbeat_ack') {
              console.log('收到心跳响应');
              return;
            }

            // 处理其他消息
            this.config.onMessage(data);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket 连接关闭:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.config.onDisconnect();
          
          // 如果不是主动关闭且未销毁，尝试重连
          console.log(this.isDestroyed)
          console.log(event.code)
          if (!this.isDestroyed && event.code !== 1000) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket 错误:', error);
          this.isConnecting = false;
          this.config.onError(error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // 发送消息
  send(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接，无法发送消息');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
      return false;
    }
  }

  // 启动心跳
  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ action: 'heartbeat' });
      }
    }, this.config.heartbeatInterval);
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 重连逻辑
  private attemptReconnect() {
    if (this.isDestroyed || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('达到最大重连次数或已销毁，停止重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`尝试第 ${this.reconnectAttempts} 次重连...`);
    
    // 调用重连回调
    this.config.onReconnecting(this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('重连失败:', error);
      });
    }, this.config.reconnectInterval);
  }

  // 断开连接
  disconnect() {
    this.isDestroyed = true;
    this.stopHeartbeat();
    
    // 清理重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, '主动断开');
      this.ws = null;
    }
  }

  // 手动重连
  reconnect() {
    if (this.isDestroyed) {
      console.warn('WebSocket已销毁，无法重连');
      return;
    }
    
    // 重置重连次数
    this.reconnectAttempts = 0;
    
    // 断开当前连接
    if (this.ws) {
      this.ws.close();
    }
    
    // 尝试连接
    return this.connect();
  }

  // 是否已连接
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // 获取当前重连次数
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}
