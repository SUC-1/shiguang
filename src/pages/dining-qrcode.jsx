// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { QrCode, Upload, Download, Store, X, Check } from 'lucide-react';

import TabBar from '@/components/TabBar';
export default function DiningQrCode(props) {
  const {
    toast
  } = useToast();
  const {
    navigateBack
  } = props.$w.utils;
  const [qrCode, setQrCode] = useState('https://via.placeholder.com/300x300/FF8B4E/FFFFFF?text=QR+CODE');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const handleUpload = async e => {
    e.preventDefault();
    try {
      if (!uploadUrl) {
        toast({
          variant: 'destructive',
          title: '上传失败',
          description: '请先选择图片'
        });
        return;
      }
      setQrCode(uploadUrl);
      setShowUploadModal(false);
      setUploadUrl('');
      toast({
        variant: 'default',
        title: '上传成功',
        description: '收款码已更新'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error.message || '请重试'
      });
    }
  };
  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = '收款码.png';
      link.click();
      toast({
        variant: 'default',
        title: '下载成功',
        description: '收款码已保存到本地'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '下载失败',
        description: error.message || '请重试'
      });
    }
  };
  const handleGenerateNew = async () => {
    try {
      toast({
        variant: 'default',
        title: '生成中',
        description: '正在生成新的收款码...'
      });
      // 这里可以调用实际的生成API
      setTimeout(() => {
        const newQrCode = `https://via.placeholder.com/300x300/FF6B35/FFFFFF?text=QR+CODE+${Date.now()}`;
        setQrCode(newQrCode);
        toast({
          variant: 'default',
          title: '生成成功',
          description: '新收款码已生成'
        });
      }, 1500);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '生成失败',
        description: error.message || '请重试'
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35]">
      <div className="max-w-6xl mx-auto p-6 pb-24">
        {/* 头部区域 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <QrCode className="h-10 w-10 text-[#FF8B4E]" />
              <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                收款码管理
              </h1>
            </div>
            <Button onClick={navigateBack} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-10 px-4 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white" style={{
            fontFamily: 'Nunito'
          }}>
              返回
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* 收款码展示区域 */}
            <div className="flex-1">
              <div className="bg-gradient-to-br from-[#FCEEB8] to-[#FF8B4E] rounded-3xl p-8 shadow-xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <img src={qrCode} alt="收款码" className="w-full h-auto max-w-xs mx-auto" />
                </div>
                <p className="text-center mt-4 text-white font-semibold" style={{
                fontFamily: 'Quicksand'
              }}>
                  扫码点餐支付
                </p>
              </div>
            </div>

            {/* 操作区域 */}
            <div className="flex-1 space-y-4">
              <div className="bg-[#FCEEB8] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#FF6B35] mb-4" style={{
                fontFamily: 'Quicksand'
              }}>
                  收款码说明
                </h2>
                <ul className="space-y-2 text-sm text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#9CCF4E] mt-0.5 flex-shrink-0" />
                    <span>顾客扫描此二维码即可点餐</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#9CCF4E] mt-0.5 flex-shrink-0" />
                    <span>支持微信、支付宝等多种支付方式</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#9CCF4E] mt-0.5 flex-shrink-0" />
                    <span>订单信息实时同步到管理后台</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#9CCF4E] mt-0.5 flex-shrink-0" />
                    <span>可将收款码打印张贴，方便顾客扫码</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => setShowUploadModal(true)} className="bg-[#FF8B4E] text-white h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
                fontFamily: 'Quicksand'
              }}>
                  <Upload className="h-5 w-5 mr-2" />
                  上传收款码
                </Button>
                <Button onClick={handleDownload} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35] hover:text-white" style={{
                fontFamily: 'Quicksand'
              }}>
                  <Download className="h-5 w-5 mr-2" />
                  下载收款码
                </Button>
              </div>

              <Button onClick={handleGenerateNew} className="w-full bg-gradient-to-r from-[#FF8B4E] to-[#FF6B35] text-white h-12 font-bold rounded-xl shadow-lg hover:shadow-xl" style={{
              fontFamily: 'Quicksand'
            }}>
                <Store className="h-5 w-5 mr-2" />
                生成新收款码
              </Button>
            </div>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-[#FF6B35] mb-4" style={{
          fontFamily: 'Quicksand'
        }}>
            使用提示
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FCEEB8] rounded-2xl p-4">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                线上宣传
              </h3>
              <p className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                将收款码分享到微信、朋友圈等社交平台
              </p>
            </div>
            <div className="bg-[#FCEEB8] rounded-2xl p-4">
              <div className="text-3xl mb-2">🖨️</div>
              <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                线下张贴
              </h3>
              <p className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                下载并打印收款码，张贴在店铺显眼位置
              </p>
            </div>
            <div className="bg-[#FCEEB8] rounded-2xl p-4">
              <div className="text-3xl mb-2">🔗</div>
              <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
              fontFamily: 'Quicksand'
            }}>
                多渠道推广
              </h3>
              <p className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                可在美团、饿了么等平台同步展示
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 上传收款码弹窗 */}
      {showUploadModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                上传收款码
              </h2>
              <Button onClick={() => {
            setShowUploadModal(false);
            setUploadUrl('');
          }} className="bg-transparent text-[#8B7355] h-8 w-8 p-0 hover:bg-[#FCEEB8] rounded-lg">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <div className="border-2 border-dashed border-[#FF8B4E] rounded-xl p-8 text-center cursor-pointer hover:border-[#FF6B35] transition-colors">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-[#FF8B4E]" />
                  <p className="text-sm text-[#8B7355] mb-2" style={{
                fontFamily: 'Nunito'
              }}>
                    点击选择图片或拖拽至此
                  </p>
                  <p className="text-xs text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                    支持 JPG、PNG 格式，大小不超过 5MB
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" onClick={() => {
              setShowUploadModal(false);
              setUploadUrl('');
            }} className="flex-1 bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 font-bold rounded-xl hover:bg-[#FCEEB8]" style={{
              fontFamily: 'Quicksand'
            }}>
                  取消
                </Button>
                <Button type="submit" className="flex-1 bg-[#FF8B4E] text-white h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                  <Check className="h-5 w-5 mr-2" />
                  确认上传
                </Button>
              </div>
            </form>
          </div>
        </div>}

      <TabBar activeTab="qrcode" navigateTo={navigateTo} onTabChange={tabId => console.log(tabId)} userRole="dining" />
    </div>;
}