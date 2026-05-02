interface CreateTemplateParams {
  action: 'create';
  /** 模板名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 菜品列表 */
  items: string[];
  /** 模板图片 */
  image?: string;
}

interface QueryTemplatesParams {
  action: 'query';
  /** 查询方式 */
  queryType: 'all' | 'byName';
  /** 模板名称（queryType=byName 时必填） */
  name?: string;
  /** 分页页码，从 1 开始 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
}

interface UpdateTemplateParams {
  action: 'update';
  /** 模板 ID */
  templateId: string;
  /** 模板名称 */
  name?: string;
  /** 描述 */
  description?: string;
  /** 菜品列表 */
  items?: string[];
  /** 模板图片 */
  image?: string;
}

interface DeleteTemplateParams {
  action: 'delete';
  /** 模板 ID */
  templateId: string;
}

interface TemplateInfo {
  _id: string;
  name: string;
  description: string;
  items: string[];
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult {
  templates: TemplateInfo[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CreateTemplateResponse {
  success: boolean;
  message: string;
  template?: TemplateInfo;
}

interface QueryTemplatesResponse {
  success: boolean;
  message: string;
  data?: PaginatedResult;
}

interface UpdateTemplateResponse {
  success: boolean;
  message: string;
  template?: TemplateInfo;
}

interface DeleteTemplateResponse {
  success: boolean;
  message: string;
}

type ManageMenuTemplatesEvent =
  | CreateTemplateParams
  | QueryTemplatesParams
  | UpdateTemplateParams
  | DeleteTemplateParams;

type ManageMenuTemplatesResponse =
  | CreateTemplateResponse
  | QueryTemplatesResponse
  | UpdateTemplateResponse
  | DeleteTemplateResponse;

export declare function main(event: any, context: any): Promise<any>;