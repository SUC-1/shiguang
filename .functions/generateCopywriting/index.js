/**
 * generateCopywriting 云函数
 * 功能：根据用户上传的图片/视频及描述，生成小红书、朋友圈等平台的种草文案
 */

const tcb = require('@cloudbase/node-sdk');
const cloud = tcb.init({
  env: process.env.TCB_ENV_ID
});

const aiService = require('./lib/ai-service');
const platformPrompts = require('./lib/platform-prompts');
const utils = require('./lib/utils');

/**
 * 主函数
 * @param {GenerateCopywritingEvent} event - 事件数据
 * @param {any} context - 云函数上下文
 * @returns {Promise<any>} - 返回结果
 */
exports.main = async function(event, context) {
  try {
    // 验证参数
    const { mediaType, mediaUrl, description, platform = 'xiaohongshu', style = '活泼', count = 1 } = event;

    if (!mediaUrl || !description) {
      return {
        success: false,
        message: '缺少必要参数：mediaUrl 或 description'
      };
    }

    // 验证媒体 URL
    if (!utils.isValidMediaUrl(mediaUrl)) {
      return {
        success: false,
        message: 'mediaUrl 格式无效'
      };
    }

    // 自动检测媒体类型（如果未提供）
    const detectedType = utils.getMediaTypeFromUrl(mediaUrl);
    const finalMediaType = mediaType || detectedType;

    if (finalMediaType === 'unknown') {
      return {
        success: false,
        message: '无法识别媒体类型，请检查 URL 格式'
      };
    }

    // 确定要生成的平台列表
    let platforms = [];
    if (platform === 'all') {
      platforms = ['xiaohongshu', 'wechat', 'weibo', 'douyin'];
    } else {
      platforms = [platform];
    }

    // 生成结果数组
    const results = [];

    // 为每个平台生成文案
    for (const p of platforms) {
      const platformConfig = platformPrompts[p];
      
      if (!platformConfig) {
        console.error(`不支持的平台: ${p}`);
        continue;
      }

      // 构建提示词
      const mediaContext = finalMediaType === 'image' 
        ? '这是一张图片' 
        : '这是一段视频';
      
      const fullDescription = `${mediaContext}\n${description}`;
      
      const prompt = platformConfig.promptTemplate(fullDescription, style);

      // 生成文案（可能生成多个版本）
      const generatedTexts = await aiService.generateTextVariations(prompt, count);

      // 格式化输出每个版本
      for (const text of generatedTexts) {
        const formatted = platformConfig.formatOutput(text);
        const result = {
          platform: p,
          title: formatted.title || '',
          content: formatted.content || '',
          tags: utils.formatTags(formatted.tags || []),
          emojis: formatted.emojis || []
        };
        
        results.push(result);
      }
    }

    // 如果没有成功生成任何文案
    if (results.length === 0) {
      return {
        success: false,
        message: '文案生成失败，请稍后重试'
      };
    }

    // 记录生成历史（可选：保存到云数据库）
    try {
      const db = cloud.database();
      const collection = db.collection('copywriting_history');
      
      await collection.add({
        data: {
          mediaType: finalMediaType,
          mediaUrl,
          description,
          platforms,
          style,
          count,
          results,
          createdAt: new Date().toISOString(),
          requestId: context.requestId
        }
      });
    } catch (dbError) {
      console.error('保存历史记录失败:', dbError);
      // 不影响主流程，继续返回结果
    }

    return {
      success: true,
      message: `成功生成 ${results.length} 条文案`,
      results
    };

  } catch (error) {
    console.error('generateCopywriting 云函数执行错误:', error);
    return {
      success: false,
      message: `文案生成失败: ${error.message}`,
      error: error.message
    };
  }
};