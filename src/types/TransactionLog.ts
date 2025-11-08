export interface TransactionLog {
  trans_date: string
  user_name: string
  module: string
  action_code: string
  activity_log: string
}

export interface TransactionLogResponse {
  data: TransactionLog[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next_page: boolean
  has_prev_page: boolean
}
