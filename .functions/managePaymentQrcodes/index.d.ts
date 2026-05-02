interface CreateQrcodeParams {
  action: 'create';
  /** 收款码图片 */
  qrCode: string;
  /** 是否启用，默认 true */
  isActive?: boolean;
  /** 说明 */
  description?: string;
}

interface QueryQrcodesParams {
  action: 'query';
  /** 查询方式 */
  queryType: 'all' | 'byIsActive';
  /** 启用状态（queryType=byIsActive 时必填） */
  isActive?: boolean;
  /** 分页页码，从 1 开始 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
}

interface UpdateQrcodeParams {
  action: 'update';
  /** 收款码 ID */
  qrcodeId: string;
  /** 收款码图片 */
  qrCode?: string;
  /** 是否启用 */
  isActive?: boolean;
  /** 说明 */
  description?: string;
}

interface DeleteQrcodeParams {
  action: 'delete';
  /** 收款码 ID */
  qrcodeId: string;
}

interface QrcodeInfo {
  _id: string;
  qrCode: string;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult {
  qrcodes: QrcodeInfo[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CreateQrcodeResponse {
  success: boolean;
  message: string;
  qrcode?: QrcodeInfo;
}

interface QueryQrcodesResponse {
  success: boolean;
  message: string;
  data?: PaginatedResult;
}

interface UpdateQrcodeResponse {
  success: boolean;
  message: string;
  qrcode?: QrcodeInfo;
}

interface DeleteQrcodeResponse {
  success: boolean;
  message: string;
}

type ManagePaymentQrcodesEvent =
  | CreateQrcodeParams
  | QueryQrcodesParams
  | UpdateQrcodeParams
  | DeleteQrcodeParams;

type ManagePaymentQrcodesResponse =
  | CreateQrcodeResponse
  | QueryQrcodesResponse
  | UpdateQrcodeResponse
  | DeleteQrcodeResponse;

export declare function main(event: any, context: any): Promise<any>;