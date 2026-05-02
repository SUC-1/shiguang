// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Sparkles, Upload, Copy, Share2, Image as ImageIcon, Video, X, RefreshCw, CheckCircle, Star, Heart, MessageCircle } from 'lucide-react';

export default function AICopywriting(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack
  } = props.$w.utils.navigateBack;
  const currentUser = props.$w.auth.currentUser || {};
  const [step, setStep] = useState(1); // 1: 上传, 2: 选择风格, 3: 生成中, 4: 结果
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 平台风格选项
  const platforms = [{
    id: 'xiaohongshu',
    name: '小红书',
    icon: Star,
    color: '#FF2442',
    description: '种草风格，带emoji和话题标签',
    style: '活泼可爱'
  }, {
    id: 'wechat',
    name: '朋友圈',
    icon: MessageCircle,
    color: '#07C160',
    description: '轻松自然，适合朋友分享',
    style: '日常分享'
  }, {
    id: 'douyin',
    name: '抖音',
    icon: Video,
    color: '#000000',
    description: '短小精悍，突出亮点',
    style: '视频配文'
  }, {
    id: 'weibo',
    name: '微博',
    icon: Share2,
    color: '#E6162D',
    description: '简洁明了，适合快速传播',
    style: '热点话题'
  }];

  // 模拟生成的文案
  const mockGeneratedContent = {
    xiaohongshu: {
      title: '今日份家庭美食打卡✨',
      content: '\n\n🍳 今天给家人做了一道超级美味的红烧肉！\n\n食材清单：\n🥩 五花肉 500g\n🫒 生抽、老抽、冰糖、料酒\n\n做法超简单：\n1️⃣ 五花肉切块焯水\n2️⃣ 热锅下油炒糖色\n3️⃣ 下肉块上色\n4️⃣ 加调料炖煮40分钟\n\n出锅后软糯香甜，老公孩子都抢着吃！💕\n\n#美食分享 #家常菜 #红烧肉 #今日美食',
      hashtags: ['#美食分享', '#家常菜', '#红烧肉', '#今日美食']
    },
    wechat: {
      title: '',
      content: '今天心血来潮，给家人做了红烧肉。没想到味道还不错，软糯香甜，孩子吃了两大块。做饭的过程其实很简单，关键是要有耐心。生活就是这样，用心去做，总会有惊喜。',
      hashtags: []
    },
    douyin: {
      title: '3步搞定红烧肉',
      content: '五花肉焯水→炒糖色→炖煮40分钟，软糯香甜的红烧肉就做好了！简单易学，新手也能成功！',
      hashtags: ['#红烧肉教程', '#家常美食', '#下厨房']
    },
    weibo: {
      title: '',
      content: '今日份美食打卡：红烧肉。软糯香甜，家人都爱吃。美食带来的幸福感就是这么简单。#美食 #家常菜 #红烧肉',
      hashtags: ['#美食', '#家常菜', '#红烧肉']
    }
  };
  const handleFileUpload = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 限制最多上传3个文件
    const remainingSlots = 3 - uploadedFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);
    const newFiles = filesToAdd.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    toast({
      variant: 'default',
      title: '上传成功',
      description: `已添加 ${filesToAdd.length} 个文件`
    });
  };
  const handleRemoveFile = index => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };
  const handlePlatformSelect = platformId => {
    setSelectedPlatform(platformId);
    setStep(3);
  };
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      const content = mockGeneratedContent[selectedPlatform] || mockGeneratedContent.xiaohongshu;
      setGeneratedContent(content);
      setStep(4);
      toast({
        variant: 'default',
        title: '生成成功',
        description: '文案已生成完成！'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '生成失败',
        description: error.message || '请重试'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleCopy = () => {
    const textToCopy = (generatedContent.title ? generatedContent.title + '\n\n' : '') + generatedContent.content;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        variant: 'default',
        title: '复制成功',
        description: '文案已复制到剪贴板'
      });
    });
  };
  const handleShare = async () => {
    try {
      // 模拟分享功能
      toast({
        variant: 'default',
        title: '分享成功',
        description: '已打开分享页面'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '分享失败',
        description: '请重试'
      });
    }
    ;
  };
  const handleRegenerate = () => {
    setStep(3);
    setIsGenerating(true);
    handleGenerate();
  };
  const handleReset = () => {
    setStep(1);
    setUploadedFiles([]);
    setSelectedPlatform(null);
    setGeneratedContent(null);
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35]">
      <div className="max-w-2xl mx-auto p-6">
        {/* 头部 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-10 w-10 text-[#FF8B4E]" />
              <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                AI文案生成
              </h1>
            </div>
            <Button className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 px-4 rounded-xl hover:bg-[#FF6B35] hover:text-white" onClick={navigateBack} style={{
            fontFamily: 'Nunito'
          }}>
              返回
            </Button>
          </div>
          
          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mt-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 1 ? 'bg-[#FF6B35]' : 'bg-gray-300'}`} style={{
              fontFamily: 'Quicksand'
            }}>1</div>
              <span className="text-sm font-semibold" style={{
              fontFamily: 'Nunito'
            }}>上传素材</span>
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-[#FF6B35]' : 'bg-gray-300'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 2 ? 'bg-[#FF6B35]' : 'bg-gray-300'}`} style={{
              fontFamily: 'Quicksand'
            }}>2</div>
              <span className="text-sm font-semibold" style={{
              fontFamily: 'Nunito'
            }}>选择风格</span>
            </div>
            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-[#FF6B35]' : 'bg-gray-300'}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 3 ? 'bg-[#FF6B35]' : 'bg-gray-300'}`} style={{
              fontFamily: 'Quicksand'
            }}>3</div>
              <span className="text-sm font-semibold" style={{
              fontFamily: 'Nunito'
            }}>生成文案</span>
            </div>
          </div>
        </div>

        {/* 步骤1: 上传素材 */}
        {step === 1 && <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
              上传烹饪照片或视频
            </h2>
            
            <p className="text-base text-[#8B7355] mb-6" style={{
          fontFamily: 'Nunito'
        }}>
              支持 JPG、PNG、MP4 格式，最多上传3个文件
            </p>

            {/* 上传区域 */}
            <div className="border-2 border-dashed border-[#FF8B4E] rounded-2xl p-8 text-center mb-6 hover:bg-[#FCEEB8] transition-colors">
              <input type="file" accept="image/*,video/*" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <Upload className="h-16 w-16 text-[#FF8B4E]" />
                <div>
                  <p className="text-lg font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                    点击或拖拽文件上传
                  </p>
                  <p className="text-sm text-[#8B7355] mt-2" style={{
                fontFamily: 'Nunito'
              }}>
                    支持图片和视频文件
                  </p>
                </div>
              </label>
            </div>

            {/* 已上传文件列表 */}
            {uploadedFiles.length > 0 && <div className="grid grid-cols-3 gap-4 mb-6">
                {uploadedFiles.map((file, index) => <div key={index} className="relative rounded-xl overflow-hidden shadow-lg">
                    {file.type === 'video' ? <video src={file.url} className="w-full h-32 object-cover" /> : <img src={file.url} alt="Uploaded" className="w-full h-32 object-cover" />}
                    <button onClick={() => handleRemoveFile(index)} className="absolute top-2 right-2 w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#E85A42] transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>)}
              </div>}

            {/* 下一步按钮 */}
            <Button className="w-full bg-[#FF8B4E] text-white h-12 text-lg font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={() => setStep(2)} disabled={uploadedFiles.length === 0} style={{
          fontFamily: 'Quicksand'
        }}>
              下一步：选择风格
            </Button>
          </div>}

        {/* 步骤2: 选择风格 */}
        {step === 2 && <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
              选择文案风格
            </h2>
            
            <p className="text-base text-[#8B7355] mb-6" style={{
          fontFamily: 'Nunito'
        }}>
              根据您的发布平台选择合适的文案风格
            </p>

            {/* 平台选项 */}
            <div className="space-y-4">
              {platforms.map(platform => {
            const Icon = platform.icon;
            return <div key={platform.id} onClick={() => handlePlatformSelect(platform.id)} className={`p-4 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${selectedPlatform === platform.id ? 'bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] text-white' : 'bg-white border-2 border-[#FF8B4E] hover:bg-[#FCEEB8]'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPlatform === platform.id ? 'bg-white' : 'bg-[#FF8B4E]'}`}>
                        <Icon className={`h-6 w-6 ${selectedPlatform === platform.id ? 'text-[#FF6B35]' : 'text-white'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-bold ${selectedPlatform === platform.id ? 'text-white' : 'text-[#FF6B35]'}`} style={{
                      fontFamily: 'Quicksand'
                    }}>
                            {platform.name}
                          </h3>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${selectedPlatform === platform.id ? 'bg-white text-[#FF6B35]' : 'bg-[#FCEEB8] text-[#FF6B35]'}`} style={{
                      fontFamily: 'Nunito'
                    }}>
                            {platform.style}
                          </span>
                        </div>
                        <p className={`text-sm ${selectedPlatform === platform.id ? 'text-white' : 'text-[#8B7355]'}`} style={{
                    fontFamily: 'Nunito'
                  }}>
                          {platform.description}
                        </p>
                      </div>
                    </div>
                  </div>;
          })}
            </div>

            {/* 上一步按钮 */}
            <Button className="w-full bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 mt-6 font-bold rounded-xl hover:bg-[#FCEEB8]" onClick={() => setStep(1)} style={{
          fontFamily: 'Quicksand'
        }}>
              上一步
            </Button>
          </div>}

        {/* 步骤3: 生成中 */}
        {step === 3 && <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="animate-bounce mb-6">
              <Sparkles className="h-24 w-24 text-[#FF8B4E] mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
              AI正在为您生成文案...
            </h2>
            <p className="text-base text-[#8B7355]" style={{
          fontFamily: 'Nunito'
        }}>
              请稍候，这可能需要几秒钟
            </p>
            {isGenerating && handleGenerate()}
          </div>}

        {/* 步骤4: 生成结果 */}
        {step === 4 && generatedContent && <div className="space-y-6">
            {/* 生成的文案卡片 */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-[#9CCF4E]" />
                  <h2 className="text-xl font-bold text-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                    文案生成完成
                  </h2>
                </div>
                <Button className="bg-[#9CCF4E] text-white h-8 px-4 font-bold rounded-xl flex items-center gap-2 hover:bg-[#FF6B35]" onClick={handleRegenerate} style={{
              fontFamily: 'Quicksand'
            }}>
                  <RefreshCw className="h-4 w-4" />
                  重新生成
                </Button>
              </div>

              {/* 文案内容 */}
              <div className="bg-gradient-to-br from-[#FCEEB8] to-[#FF8B4E] rounded-2xl p-6 mb-6">
                {generatedContent.title && <h3 className="text-xl font-bold text-[#FF6B35] mb-4" style={{
              fontFamily: 'Quicksand'
            }}>
                    {generatedContent.title}
                  </h3>}
                <p className="text-base text-[#8B7355] whitespace-pre-line leading-relaxed" style={{
              fontFamily: 'Nunito'
            }}>
                  {generatedContent.content}
                </p>
                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && <div className="flex flex-wrap gap-2 mt-4">
                    {generatedContent.hashtags.map((tag, index) => <span key={index} className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-[#FF6B35]" style={{
                fontFamily: 'Nunito'
              }}>
                        {tag}
                      </span>)}
                  </div>}
              </div>

              {/* 操作按钮 */}
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-[#FF8B4E] text-white h-12 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FF6B35]" onClick={handleCopy} style={{
              fontFamily: 'Quicksand'
            }}>
                  <Copy className="h-5 w-5" />
                  一键复制
                </Button>
                <Button className="bg-[#9CCF4E] text-white h-12 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FF6B35]" onClick={handleShare} style={{
              fontFamily: 'Quicksand'
            }}>
                  <Share2 className="h-5 w-5" />
                  分享发布
                </Button>
              </div>
            </div>

            {/* 重新开始按钮 */}
            <Button className="w-full bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 font-bold rounded-xl hover:bg-[#FCEEB8]" onClick={handleReset} style={{
          fontFamily: 'Quicksand'
        }}>
              重新开始
            </Button>
          </div>}
      </div>
    </div>;
}