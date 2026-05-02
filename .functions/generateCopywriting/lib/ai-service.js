/**
 * AI 大模型服务
 * 调用混元大模型生成文案
 */

const fetch = require('node-fetch');

module.exports = {
  /**
   * 调用混元大模型生成文案
   * @param {string} prompt - 提示词
   * @returns {Promise<string>} - 生成的文本
   */
  async generateText(prompt) {
    try {
      // 使用腾讯云混元大模型 API
      // 注意：实际使用时需要配置 API 密钥和端点
      const apiUrl = process.env.AI_API_URL || 'https://hunyuan.tencentcloudapi.com/v1/chat/completions';
      const apiKey = process.env.AI_API_KEY;

      if (!apiKey) {
        throw new Error('AI API 密钥未配置，请在环境变量中设置 AI_API_KEY');
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'hunyuan-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.8
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`AI API 调用失败: ${data.error?.message || response.statusText}`);
      }

      const generatedText = data.choices[0]?.message?.content || '';
      return generatedText;
    } catch (error) {
      console.error('AI 服务调用错误:', error);
      throw error;
    }
  },

  /**
   * 批量生成多个版本的文案
   * @param {string} prompt - 提示词
   * @param {number} count - 生成数量
   * @returns {Promise<string[]>} - 生成的文本列表
   */
  async generateTextVariations(prompt, count = 1) {
    const results = [];
    const variations = [
      '', // 原始提示词
      '\n要求：换一种表达方式，更加口语化',
      '\n要求：增加一些互动元素，让文案更有吸引力',
      '\n要求：突出重点，简短精炼',
      '\n要求：加入一些幽默元素，让文案更有趣'
    ];

    for (let i = 0; i < count && i < variations.length; i++) {
      try {
        const text = await this.generateText(prompt + variations[i]);
        results.push(text);
      } catch (error) {
        console.error(`生成第 ${i + 1} 个版本失败:`, error);
      }
    }

    return results;
  }
};