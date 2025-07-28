interface Reply {
  title: string
  value: string
  messageId?: number | string
}

interface QuickReplies {
  type: 'radio' | 'checkbox'
  values: Reply[]
  keepIt?: boolean
}
export interface TMessage {
  _id: string | number
  text: string
  createdAt?: Date | number
  user: 'user' | 'adk' | 'system';
  image?: string
  video?: string
  audio?: string

  sent?: boolean
  received?: boolean
  pending?: boolean
  quickReplies?: QuickReplies
}