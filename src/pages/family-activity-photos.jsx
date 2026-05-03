// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Image as ImageIcon, Upload, X, Loader2, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

export default function FamilyActivityPhotos(props) {
  const {
    toast
  } = useToast();
  const navigateTo = props.$w.utils.navigateTo;
  const navigateBack = props.$w.utils.navigateBack;
  const currentUser = props.$w.auth.currentUser || {};
  const activityId = props.$w.page.dataset.params?.id;
  const [activity, setActivity] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    url: '',
    description: ''
  });

  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activities',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: activityId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result) {
        setActivity({
          id: result._id,
          name: result.name
        });
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
    }
  };

  // 获取活动照片
  const fetchPhotos = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_photos',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              activityId: {
                $eq: activityId
              }
            }
          },
          orderBy: [{
            uploadedAt: 'desc'
          }],
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setPhotos(result.records.map(p => ({
          id: p._id,
          url: p.url,
          thumbnailUrl: p.thumbnailUrl,
          description: p.description,
          uploaderNickname: p.uploaderNickname,
          uploadedAt: p.uploadedAt
        })));
      }
    } catch (error) {
      console.error('获取活动照片失败:', error);
      toast({
        variant: 'destructive',
        title: '获取照片失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 上传照片
  const handleUpload = async () => {
    if (!uploadForm.url.trim()) {
      toast({
        variant: 'destructive',
        title: '请填写图片URL',
        description: '图片URL不能为空'
      });
      return;
    }
    try {
      setUploading(true);
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_photos',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            activityId: activityId,
            url: uploadForm.url.trim(),
            thumbnailUrl: uploadForm.url.trim(),
            description: uploadForm.description.trim(),
            uploadedBy: currentUser.userId,
            uploaderNickname: currentUser.nickName || currentUser.name || '匿名用户',
            uploadedAt: new Date().toISOString()
          }
        }
      });
      if (result && result.id) {
        toast({
          variant: 'default',
          title: '上传成功',
          description: '照片已上传成功'
        });
        setShowUploadModal(false);
        setUploadForm({
          url: '',
          description: ''
        });
        await fetchPhotos();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setUploading(false);
    }
  };

  // 删除照片
  const handleDeletePhoto = async photoId => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_activity_photos',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: photoId
              }
            }
          }
        }
      });
      if (result) {
        toast({
          variant: 'default',
          title: '删除成功',
          description: '照片已删除'
        });
        setSelectedPhoto(null);
        await fetchPhotos();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  // 页面初始化
  useEffect(() => {
    if (!activityId) {
      navigateBack();
      return;
    }
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchActivityDetail(), fetchPhotos()]);
      setLoading(false);
    };
    loadData();
  }, [activityId]);

  // 格式化日期
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 切换到上一张照片
  const goToPreviousPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };

  // 切换到下一张照片
  const goToNextPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8B4E]" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] pb-8">
      {/* 头部 */}
      <div className="bg-white rounded-b-3xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button className="bg-[#FCEEB8] text-[#FF6B35] h-10 w-10 p-0 rounded-full" onClick={() => navigateBack()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                活动相册
              </h1>
              {activity && <p className="text-sm text-[#8B7355]" style={{
              fontFamily: 'Nunito'
            }}>
                  {activity.name}
                </p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 视图切换 */}
            <Button className={`h-10 w-10 p-0 rounded-xl ${viewMode === 'grid' ? 'bg-[#FF8B4E] text-white' : 'bg-[#FCEEB8] text-[#8B7355]'}`} onClick={() => setViewMode('grid')}>
              <Grid className="h-5 w-5" />
            </Button>
            <Button className={`h-10 w-10 p-0 rounded-xl ${viewMode === 'list' ? 'bg-[#FF8B4E] text-white' : 'bg-[#FCEEB8] text-[#8B7355]'}`} onClick={() => setViewMode('list')}>
              <List className="h-5 w-5" />
            </Button>
            {/* 上传按钮 */}
            <Button className="bg-[#FF8B4E] text-white h-10 px-4 rounded-xl" onClick={() => setShowUploadModal(true)}>
              <Upload className="h-5 w-5 mr-1" />
              上传
            </Button>
          </div>
        </div>
        
        {/* 照片统计 */}
        <div className="mt-4 flex items-center gap-4 text-sm text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          <span className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            共 {photos.length} 张照片
          </span>
        </div>
      </div>

      {/* 照片内容 */}
      <div className="px-4">
        {photos.length > 0 ? viewMode === 'grid' ?
      // 网格视图
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setSelectedPhoto(photo)}>
                  <img src={photo.thumbnailUrl || photo.url} alt={photo.description || `照片 ${index + 1}`} className="w-full h-full object-cover" />
                  {photo.description && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs line-clamp-2" style={{
              fontFamily: 'Nunito'
            }}>
                        {photo.description}
                      </p>
                    </div>}
                </div>)}
            </div> :
      // 列表视图
      <div className="space-y-4">
              {photos.map((photo, index) => <div key={photo.id} className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setSelectedPhoto(photo)}>
                  <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0">
                      <img src={photo.thumbnailUrl || photo.url} alt={photo.description || `照片 ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      {photo.description && <p className="text-sm text-[#8B7355] line-clamp-2 mb-2" style={{
                fontFamily: 'Nunito'
              }}>
                          {photo.description}
                        </p>}
                      <div className="flex items-center gap-2 text-xs text-[#8B7355]" style={{
                fontFamily: 'Nunito'
              }}>
                        <span>上传者: {photo.uploaderNickname}</span>
                        <span>·</span>
                        <span>{formatDate(photo.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div> :
      // 空状态
      <div className="text-center py-20">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-[#FF8B4E] opacity-50" />
            <h3 className="text-lg font-bold text-[#FF6B35] mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
              暂无照片
            </h3>
            <p className="text-sm text-[#8B7355] mb-4" style={{
          fontFamily: 'Nunito'
        }}>
              上传第一张照片，记录美好时刻
            </p>
            <Button className="bg-[#FF8B4E] text-white h-12 px-6 rounded-xl" onClick={() => setShowUploadModal(true)}>
              <Upload className="h-5 w-5 mr-2" />
              上传照片
            </Button>
          </div>}
      </div>

      {/* 照片详情弹窗 */}
      {selectedPhoto && <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <Button className="absolute top-4 right-4 bg-white/20 text-white h-10 w-10 p-0 rounded-full hover:bg-white/30" onClick={() => setSelectedPhoto(null)}>
            <X className="h-6 w-6" />
          </Button>
          
          {/* 导航按钮 */}
          {photos.length > 1 && <>
              <Button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white h-12 w-12 p-0 rounded-full hover:bg-white/30" onClick={goToPreviousPhoto} disabled={photos.findIndex(p => p.id === selectedPhoto.id) === 0}>
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white h-12 w-12 p-0 rounded-full hover:bg-white/30" onClick={goToNextPhoto} disabled={photos.findIndex(p => p.id === selectedPhoto.id) === photos.length - 1}>
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>}
          
          {/* 图片 */}
          <div className="max-w-4xl max-h-[80vh]">
            <img src={selectedPhoto.url} alt={selectedPhoto.description || '照片'} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            
            {/* 信息栏 */}
            <div className="mt-4 text-white text-center">
              {selectedPhoto.description && <p className="text-lg mb-2" style={{
            fontFamily: 'Nunito'
          }}>
                  {selectedPhoto.description}
                </p>}
              <div className="flex items-center justify-center gap-4 text-sm opacity-80" style={{
            fontFamily: 'Nunito'
          }}>
                <span>上传者: {selectedPhoto.uploaderNickname}</span>
                <span>·</span>
                <span>{formatDate(selectedPhoto.uploadedAt)}</span>
                <span>·</span>
                <span>{photos.findIndex(p => p.id === selectedPhoto.id) + 1} / {photos.length}</span>
              </div>
            </div>
          </div>
        </div>}

      {/* 上传弹窗 */}
      {showUploadModal && <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
                上传照片
              </h2>
              <Button className="bg-white text-gray-800 border-2 border-gray-300 rounded-xl p-2 hover:bg-gray-100" onClick={() => setShowUploadModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* 图片URL */}
              <div>
                <label className="text-sm font-semibold text-[#FF6B35] mb-2 block" style={{
              fontFamily: 'Quicksand'
            }}>
                  图片URL
                </label>
                <Input className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" placeholder="请输入图片URL" value={uploadForm.url} onChange={e => setUploadForm({
              ...uploadForm,
              url: e.target.value
            })} />
                {uploadForm.url && <div className="mt-3 rounded-xl overflow-hidden h-40">
                    <img src={uploadForm.url} alt="预览" className="w-full h-full object-cover" onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800';
              }} />
                  </div>}
              </div>
              
              {/* 描述 */}
              <div>
                <label className="text-sm font-semibold text-[#FF6B35] mb-2 block" style={{
              fontFamily: 'Quicksand'
            }}>
                  照片描述
                </label>
                <textarea className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl p-3 text-[#8B7355] resize-none" rows={3} placeholder="请输入照片描述（可选）" value={uploadForm.description} onChange={e => setUploadForm({
              ...uploadForm,
              description: e.target.value
            })} />
              </div>
              
              {/* 上传按钮 */}
              <Button className="w-full bg-[#FF8B4E] text-white h-12 font-bold rounded-xl shadow-lg hover:bg-[#FF6B35]" onClick={handleUpload} disabled={uploading}>
                {uploading ? <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    上传中...
                  </> : <>
                    <Upload className="h-5 w-5 mr-2" />
                    上传照片
                  </>}
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}