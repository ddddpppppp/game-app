import api from '../api'

// 投注类型接口
export interface BetType {
  id: number
  type_key: string
  type_name: string
  description: string
  odds: number
  status: number
  sort: number
  enabled: boolean
}

// 当前期数接口
export interface CurrentDraw {
  period_number: string
  status: number
  status_text: string
  start_at: string
  end_at: string
  draw_at: string
  result_numbers: number[] | null
  result_sum: number | null
  time_left: number
}

// 群组消息接口
export interface GroupMessage {
  id: string
  nickname: string
  avatar: string
  user_id: string
  type: string
  message: string
  created_at: string
}

// 开奖历史接口
export interface DrawHistory {
  id: number
  period_number: string
  result_numbers: number[]
  result_sum: number
  draw_at: string
  status: number
  status_text: string
}

// 投注响应接口
export interface BetResponse {
  bet_id: number
  period_number: string
  bet_type: string
  amount: number
  multiplier: number
  potential_win: number
  message: string
}

export interface BetHistory {
  id: number
  period_number: string
  bet_type_name: string
  bet_type_key: string
  amount: number
  multiplier: number
  potential_win: number
  status: string
  status_text: string
  result_numbers: number[] | null
  result_sum: number | null
  draw_status: number | null
  draw_at: string | null
  created_at: string
}

export interface BetHistoryData {
  bets: BetHistory[]
  page: number
  limit: number
  total: number
  has_more: boolean
}

// 动态赔率规则接口
export interface DynamicOddsRule {
  id: number
  rule_name: string
  trigger_condition: string
  trigger_values: any
  bet_type_adjustments: Record<string, number>
  status: number
  priority: number
}

// 游戏数据接口
export interface GameData {
  bet_types: BetType[]
  current_draw: CurrentDraw | null
  dynamic_odds_rules?: DynamicOddsRule[]
}

// 消息数据接口
export interface MessagesData {
  messages: GroupMessage[]
  total: number
}

// 开奖历史数据接口
export interface DrawHistoryData {
  draws: DrawHistory[]
  page: number
  limit: number
  total: number
  has_more: boolean
}

// 通用API服务（对应后端 Game.php 控制器）
class GameService {
  // 获取Canada28游戏数据（包含玩法配置和当前期数）
  async getCanada28Game(): Promise<GameData> {
    const response = await api.post('/api/game/getCanada28Game')
    return response.data
  }

  // 获取Canada28当前期数信息（仅获取倒计时数据）
  async getCanada28GameCurrentDraw(): Promise<{ current_draw: CurrentDraw }> {
    const response = await api.post('/api/game/getCanada28GameCurrentDraw')
    return response.data
  }

  // 获取Canada28群组消息
  async getCanada28Messages(): Promise<MessagesData> {
    const response = await api.post('/api/game/getCanada28Messages')
    return response.data
  }

  // 获取Canada28开奖历史
  async getCanada28DrawHistory(page: number = 1): Promise<DrawHistoryData> {
    const response = await api.post('/api/game/getCanada28DrawHistory', { page })
    return response.data
  }

  // Canada28投注
  async placeCanada28Bet(betTypeId: number, amount: number): Promise<BetResponse> {
    const response = await api.post('/api/game/placeCanada28Bet', {
      bet_type_id: betTypeId,
      amount: amount
    })
    return response.data
  }

  // 获取Canada28投注历史
  async getCanada28BetHistory(page: number = 1): Promise<BetHistoryData> {
    const response = await api.post('/api/game/getCanada28BetHistory', { page })
    return response.data
  }

  // 根据分类获取投注类型
  getBetTypesByCategory(betTypes: BetType[], category: string): BetType[] {
    const categoryMap: { [key: string]: string[] } = {
      basic: ['high', 'low', 'odd', 'even'],
      combination: ['high_odd', 'low_odd', 'high_even', 'low_even'],
      special: ['extreme_low', 'extreme_high', 'pair', 'straight', 'triple'],
      sum: Array.from({ length: 28 }, (_, i) => `sum_${i}`)
    }
    
    const keys = categoryMap[category] || []
    return betTypes.filter(bet => keys.includes(bet.type_key))
  }

  // 格式化赔率显示
  formatOdds(odds: number): string {
    return `${odds}x`
  }

  // 获取特殊赔率（如果有的话）
  getSpecialOdds(betType: BetType, dynamicRules?: DynamicOddsRule[]): number | null {
    if (!dynamicRules || dynamicRules.length === 0) {
      return null
    }

    // 查找适用的规则（这里不需要实际的开奖结果，只是检查是否有规则配置）
    const applicableRules = dynamicRules
      .filter(rule => rule.status === 1)
      .filter(rule => rule.bet_type_adjustments[betType.type_key] !== undefined)
      .sort((a, b) => b.priority - a.priority) // 按优先级排序

    if (applicableRules.length === 0) {
      return null
    }

    // 返回第一个（最高优先级）规则的调整赔率
    const rule = applicableRules[0]
    return rule.bet_type_adjustments[betType.type_key]
  }

  // 检查规则条件
  private checkRuleCondition(rule: DynamicOddsRule, drawSum: number): boolean {
    try {
      switch (rule.trigger_condition) {
        case 'sum_in':
          const values = Array.isArray(rule.trigger_values) ? rule.trigger_values : JSON.parse(rule.trigger_values)
          return Array.isArray(values) && values.includes(drawSum)
        case 'sum_range':
          const range = typeof rule.trigger_values === 'object' ? rule.trigger_values : JSON.parse(rule.trigger_values)
          return drawSum >= range.min && drawSum <= range.max
        case 'sum_exact':
          const exact = typeof rule.trigger_values === 'number' ? rule.trigger_values : JSON.parse(rule.trigger_values)
          return drawSum === exact
        default:
          return false
      }
    } catch (error) {
      console.error('Error checking rule condition:', error)
      return false
    }
  }

  // 格式化赔率显示 - 支持动态赔率
  formatOddsWithSpecial(normalOdds: number, specialOdds?: number | null): string {
    if (specialOdds && specialOdds !== normalOdds) {
      return `${normalOdds}x/${specialOdds}x`
    }
    return `${normalOdds}x`
  }

  // 检查投注类型是否可用
  isBetTypeEnabled(betType: BetType): boolean {
    return betType.enabled && betType.status === 1
  }

  // 计算潜在奖金
  calculatePotentialWinnings(betAmount: number, odds: number): number {
    return betAmount * odds
  }

  // 计算利润
  calculateProfit(betAmount: number, odds: number): number {
    return this.calculatePotentialWinnings(betAmount, odds) - betAmount
  }

  // 判断消息是否为当前用户发送
  isMyMessage(message: GroupMessage, currentUserId: string): boolean {
    return message.user_id === currentUserId
  }

  // 判断消息是否为机器人发送
  isBotMessage(message: GroupMessage): boolean {
    return message.user_id === 'bot'
  }

  // 格式化开奖号码球的颜色
  getBallColor(number: number): string {
    if (number >= 0 && number <= 9) return 'bg-blue-500'
    if (number >= 10 && number <= 19) return 'bg-green-500'
    if (number >= 20 && number <= 27) return 'bg-red-500'
    return 'bg-gray-500'
  }

  // 判断总和的大小
  getSumType(sum: number): string {
    if (sum >= 0 && sum <= 13) return 'Low'
    if (sum >= 14 && sum <= 27) return 'High'
    return 'Unknown'
  }

  // 判断总和的奇偶
  getSumParity(sum: number): string {
    return sum % 2 === 0 ? 'Even' : 'Odd'
  }

  // 获取投注状态颜色
  getBetStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'win':
        return 'bg-green-500'
      case 'lose':
        return 'bg-red-500'
      case 'cancel':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  // 获取投注结果显示文本
  getBetResultText(betHistory: BetHistory): string {
    if (betHistory.status === 'pending') {
      return 'Waiting for result'
    }
    if (betHistory.status === 'cancel') {
      return 'Cancelled'
    }
    if (betHistory.result_numbers && betHistory.result_sum !== null) {
      return `${betHistory.result_numbers.join(', ')} (Sum: ${betHistory.result_sum})`
    }
    return 'No result'
  }
}

export const gameService = new GameService() 