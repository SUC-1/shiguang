interface GenerateCopywritingEvent {
  /** 媒体类型：image 或 video */
  mediaType: 'image' | 'video';
  /** 媒体文件 URL（云存储链接或外部链接） */
  mediaUrl: string;
  /** 用户提供的描述文字 */
  description: string;
  /** 生成文案的平台类型 */
  platform?: 'xiaohongshu' | 'wechat' | 'weibo' | 'douyin' | 'all';
  /** 文案风格 */
  style?: '活泼' | '专业' | '简洁' | '文艺' | '幽默';
  /** 生成文案数量 */
  count?: number;
}

interface CopywritingResult {
  /** 平台名称 */
  platform: string;
  /** 文案标题 */
  title: string;
  /** 文案正文 */
  content: string;
  /** 标签建议 */
  tags: string[];
  /** 表情建议 */
  emojis: string[];
}

export declare function main(event: GenerateCopywritingEvent, context: any): Promise<{
  success: boolean;
  message: string;
  results?: CopywritingResult[];
}>;