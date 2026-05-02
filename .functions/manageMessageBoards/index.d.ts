interface SendMessageParams {
  action: 'send';
  /** 留言内容 */
  content: string;
  /** 背景色，如 #FF8B4E */
  backgroundColor?: string;
  /** 发送人ID */
  senderId: string;
  /** 发送人昵称 */
  senderName: string;
  /** 接收人类型 */
  recipientType: 'chef' | 'all' | 'member';
  /** 特定接收人ID（recipientType=member 时必填） */
  recipientId?: string;
  /** 留言分类 */
  category: 'order' | 'daily' | 'announcement';
}

interface QueryMessagesParams {
  action: 'query';
  /** 查询方式 */
  queryType: 'all' | 'bySender' | 'byRecipientType' | 'byCategory';
  /** 发送人ID（queryType=bySender 时必填） */
  senderId?: string;
  /** 接收人类型（queryType=byRecipientType 时必填） */
  recipientType?: 'chef' | 'all' | 'member';
  /** 留言分类（queryType=byCategory 时必填） */
  category?: 'order' | 'daily' | 'announcement';
  /** 分页页码，从 1 开始 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
}

interface DeleteMessageParams {
  action: 'delete';
  /** 留言 ID */
  messageId: string;
}

interface MessageInfo {
  _id: string;
  content: string;
  backgroundColor: string;
  senderId: string;
  senderName: string;
  recipientType: string;
  recipientId: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult {
  messages: MessageInfo[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  messageInfo?: MessageInfo;
}

interface QueryMessagesResponse {
  success: boolean;
  message: string;
  data?: PaginatedResult;
}

interface DeleteMessageResponse {
  success: boolean;
  message: string;
}

export declare function main(event: SendMessageParams | QueryMessagesParams | DeleteMessageParams, context: any): Promise<SendMessageResponse | QueryMessagesResponse | DeleteMessageResponse>;