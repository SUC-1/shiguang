interface NutritionInfo {
  /** 卡路里 */
  calories?: number;
  /** 蛋白质(g) */
  protein?: number;
  /** 碳水化合物(g) */
  carbs?: number;
  /** 脂肪(g) */
  fat?: number;
  /** 营养描述 */
  description?: string;
}

interface CreateDishParams {
  action: 'create';
  /** 菜品名称 */
  name: string;
  /** 菜品图片 */
  image?: string;
  /** 菜系 */
  cuisine?: string;
  /** 价格 */
  price: number;
  /** 是否自定义 */
  isCustom?: boolean;
  /** 营养信息 */
  nutrition?: NutritionInfo;
  /** 配料 */
  ingredients?: string[];
  /** 业务类型 */
  businessType: 'family' | 'dining';
}

interface QueryDishesParams {
  action: 'query';
  /** 查询方式 */
  queryType: 'all' | 'byCuisine' | 'byBusinessType' | 'byIsCustom';
  /** 菜系（queryType=byCuisine 时必填） */
  cuisine?: string;
  /** 业务类型（queryType=byBusinessType 时必填） */
  businessType?: 'family' | 'dining';
  /** 是否自定义（queryType=byIsCustom 时必填） */
  isCustom?: boolean;
  /** 分页页码，从 1 开始 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
}

interface UpdateDishParams {
  action: 'update';
  /** 菜品 ID */
  dishId: string;
  /** 菜品名称 */
  name?: string;
  /** 菜品图片 */
  image?: string;
  /** 菜系 */
  cuisine?: string;
  /** 价格 */
  price?: number;
  /** 是否自定义 */
  isCustom?: boolean;
  /** 营养信息 */
  nutrition?: NutritionInfo;
  /** 配料 */
  ingredients?: string[];
}

interface DeleteDishParams {
  action: 'delete';
  /** 菜品 ID */
  dishId: string;
}

interface DishInfo {
  _id: string;
  name: string;
  image: string;
  cuisine: string;
  price: number;
  isCustom: boolean;
  nutrition: NutritionInfo;
  ingredients: string[];
  businessType: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult {
  dishes: DishInfo[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CreateDishResponse {
  success: boolean;
  message: string;
  dish?: DishInfo;
}

interface QueryDishesResponse {
  success: boolean;
  message: string;
  data?: PaginatedResult;
}

interface UpdateDishResponse {
  success: boolean;
  message: string;
  dish?: DishInfo;
}

interface DeleteDishResponse {
  success: boolean;
  message: string;
}

export declare function main(event: CreateDishParams | QueryDishesParams | UpdateDishParams | DeleteDishParams, context: any): Promise<CreateDishResponse | QueryDishesResponse | UpdateDishResponse | DeleteDishResponse>;