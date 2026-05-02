/**
 * 工具函数
 */

module.exports = {
  /**
   * 验证媒体 URL 是否有效
   * @param {string} url - 媒体 URL
   * @returns {boolean} - 是否有效
   */
  isValidMediaUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    // 简单验证 URL 格式
    return url.startsWith('http://') || url.startsWith('https://');
  },

  /**
   * 从媒体 URL 中提取文件类型
   * @param {string} url - 媒体 URL
   * @returns {string} - 文件类型
   */
  getMediaTypeFromUrl(url) {
    const extension = url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'flv', 'webm', 'mkv'];

    if (imageExtensions.includes(extension)) {
      return 'image';
    } else if (videoExtensions.includes(extension)) {
      return 'video';
    }
    return 'unknown';
  },

  /**
   * 清理和格式化标签
   * @param {string[]} tags - 标签数组
   * @returns {string[]} - 清理后的标签数组
   */
  formatTags(tags) {
    return tags.filter(tag => tag && tag.length > 0).map(tag => {
      if (!tag.startsWith('#')) {
        tag = '#' + tag;
      }
      return tag;
    });
  },

  /**
   * 生成唯一 ID
   * @returns {string} - 唯一 ID
   */
  generateUniqueId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}-${random}`;
  }
};