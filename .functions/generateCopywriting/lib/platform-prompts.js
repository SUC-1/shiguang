/**
 * 各平台的文案生成提示词模板
 */

module.exports = {
  // 小红书文案风格
  xiaohongshu: {
    promptTemplate: (description, style) => {
      const styleDescriptions = {
        '活泼': '充满活力，语气亲切，多用感叹号，贴近年轻人的表达方式',
        '专业': '客观严谨，数据支撑，突出产品优势和实用价值',
        '简洁': '言简意赅，直击重点，适合快速浏览',
        '文艺': '诗意优美，注重情感共鸣，文字有温度',
        '幽默': '轻松有趣，适当调侃，让人会心一笑'
      };
      return `请根据以下内容生成一篇小红书种草文案：

内容描述：${description}

要求：
1. 风格：${styleDescriptions[style] || '亲切自然，容易引起共鸣'}
2. 标题要吸睛，不超过15字
3. 正文分段清晰，每段不超过50字
4. 使用emoji表情增加趣味性
5. 包含5-8个相关话题标签
6. 语言口语化，贴近小红书用户的表达习惯

输出格式：
标题：[标题]
正文：[正文内容]
标签：[标签列表，用空格分隔]
表情：[推荐emoji列表]`;
    },
    formatOutput: (text) => {
      const lines = text.split('\n');
      let title = '', content = '', tags = [], emojis = [];
      
      lines.forEach(line => {
        if (line.startsWith('标题：')) {
          title = line.replace('标题：', '').trim();
        } else if (line.startsWith('正文：')) {
          content = line.replace('正文：', '').trim();
        } else if (line.startsWith('标签：')) {
          tags = line.replace('标签：', '').trim().split(' ').filter(t => t);\n        } else if (line.startsWith('表情：')) {
          emojis = line.replace('表情：', '').trim().split(' ').filter(e => e);
        }
      });
      
      return { title, content, tags, emojis };
    }
  },

  // 朋友圈文案风格
  wechat: {
    promptTemplate: (description, style) => {
      const styleDescriptions = {
        '活泼': '轻松愉快，适合日常生活分享',
        '专业': '适合工作、学习相关的分享',
        '简洁': '简单直接，一目了然',
        '文艺': '有诗意，适合情感表达',
        '幽默': '风趣幽默，适合调侃'
      };
      return `请根据以下内容生成一篇朋友圈文案：

内容描述：${description}

要求：
1. 风格：${styleDescriptions[style] || '真诚自然，不做作'}
2. 文案长度控制在100-200字
3. 适合朋友间的轻松分享氛围
4. 可以适当使用emoji
5. 不要过于商业化，保持真实感

输出格式：
文案：[朋友圈文案内容]
表情：[推荐emoji]`;
    },
    formatOutput: (text) => {
      const lines = text.split('\n');
      let content = '', emojis = [];
      
      lines.forEach(line => {
        if (line.startsWith('文案：')) {
          content = line.replace('文案：', '').trim();
        } else if (line.startsWith('表情：')) {
          emojis = line.replace('表情：', '').trim().split(' ').filter(e => e);
        }
      });
      
      return { title: '', content, tags: [], emojis };
    }
  },

  // 微博文案风格
  weibo: {
    promptTemplate: (description, style) => {
      const styleDescriptions = {
        '活泼': '充满活力，适合年轻人',
        '专业': '观点鲜明，适合行业分享',
        '简洁': '言简意赅，适合快速传播',
        '文艺': '有深度，适合情感话题',
        '幽默': '轻松有趣，适合搞笑内容'
      };
      return `请根据以下内容生成一篇微博文案：

内容描述：${description}

要求：
1. 风格：${styleDescriptions[style] || '真实自然，有感染力'}
2. 控制在140字以内
3. 适合公开话题讨论
4. 可以包含话题标签（#话题#）
5. 语言简练有力

输出格式：
文案：[微博文案]
话题：[话题标签列表]
表情：[推荐emoji]`;
    },
    formatOutput: (text) => {
      const lines = text.split('\n');
      let content = '', tags = [], emojis = [];
      
      lines.forEach(line => {
        if (line.startsWith('文案：')) {
          content = line.replace('文案：', '').trim();
        } else if (line.startsWith('话题：')) {
          tags = line.replace('话题：', '').trim().split(' ').filter(t => t.includes('#'));
        } else if (line.startsWith('表情：')) {
          emojis = line.replace('表情：', '').trim().split(' ').filter(e => e);
        }
      });
      
      return { title: '', content, tags, emojis };
    }
  },

  // 抖音文案风格
  douyin: {
    promptTemplate: (description, style) => {
      const styleDescriptions = {
        '活泼': '充满活力，适合短视频氛围',
        '专业': '知识分享，干货满满',
        '简洁': '一句话总结，朗朗上口',
        '文艺': '有故事感，适合情感视频',
        '幽默': '搞笑吐槽，轻松有趣'
      };
      return `请根据以下内容生成一篇抖音文案：

内容描述：${description}

要求：
1. 风格：${styleDescriptions[style] || '有趣吸引人，快速抓住眼球'}
2. 开头要有悬念或吸引力
3. 适合短视频的节奏感
4. 包含互动引导（点赞、评论、关注）
5. 添加热门话题标签
6. 控制在50字以内

输出格式：
文案：[抖音文案]
话题：[话题标签列表]
互动：[互动引导语]`;
    },
    formatOutput: (text) => {
      const lines = text.split('\n');
      let content = '', tags = [], emojis = [];
      
      lines.forEach(line => {
        if (line.startsWith('文案：')) {
          content = line.replace('文案：', '').trim();
        } else if (line.startsWith('话题：')) {
          tags = line.replace('话题：', '').trim().split(' ').filter(t => t);
        } else if (line.startsWith('互动：')) {
          content += '\n' + line.replace('互动：', '').trim();
        } else if (line.startsWith('表情：')) {
          emojis = line.replace('表情：', '').trim().split(' ').filter(e => e);
        }
      });
      
      return { title: '', content, tags, emojis };
    }
  }
};