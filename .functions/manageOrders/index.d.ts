interface DishItem {
  /** 菜品名称 */
  name: string;
  /** 数量 */
  quantity: number;
  /** 单价 */
  price: number;
}

interface CreateOrderParams {
  action: 'create';
  /** 用户名称 */
  userName: string;
  /** 菜品列表 */
  dishes: DishItem[];
  /** 留言 */
  message?: string;
  /** 留言板颜色 */
  boardColor?: string;
  /** 业务类型 */
  businessType: 'family' | 'dining';
  /** 同步目标 */
  syncTarget?: string;
}

interface QueryOrdersParams {
  action: 'query';
  /** 查询方式 */
  queryType: 'all' | 'byUser' | 'byStatus' | 'byBusinessType';
  /** 用户名称（queryType=byUser 时必填） */
  userName?: string;
  /** 订单状态（queryType=byStatus 时必填） */
  status?: 'pending' | 'cooking' | 'completed' | 'cancelled';
  /** 业务类型（queryType=byBusinessType 时必填） */
  businessType?: 'family' | 'dining';
  /** 分页页码，从 1 开始 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
}

interface UpdateOrderParams {
  action: 'updateStatus';
  /** 订单 ID */
  orderId: string;
  /** 新状态 */
  status: 'pending' | 'cooking' | 'completed' | 'cancelled';
}

interface OrderInfo {
  _id: string;
  userName: string;
  dishes: DishItem[];
  message: string;
  boardColor: string;
  status: string;
  total: number;
  businessType: string;
  syncTarget: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult {
  orders: OrderInfo[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  order?: OrderInfo;
}

interface QueryOrdersResponse {
  success: boolean;
  message: string;
  data?: PaginatedResult;
}

interface UpdateOrderResponse {
  success: boolean;
  message: string;
  order?: OrderInfo;
}

export declare function main(event: CreateOrderParams | QueryOrdersParams | UpdateOrderParams, context: any): Promise<CreateOrderResponse | QueryOrdersResponse | UpdateOrderResponse>;