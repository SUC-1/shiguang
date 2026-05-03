// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Calendar, MapPin, Users, FileText, Image as ImageIcon, Loader2, Clock } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

export default function FamilyActivityForm(props) {
  const {
    toast
  } = useToast();
  const navigateTo = props.$w.utils.navigateTo;
  const navigateBack = props.$w.utils.navigateBack;
  const currentUser = props.$w.auth.currentUser || {};
  const activityId = props.$w.page.dataset.params?.id;
  const isEdit = !!activityId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    maxParticipants: 10
  });
  const [familyGroupId, setFamilyGroupId] = useState(null);

  // 获取活动详情（编辑模式）
  const fetchActivityDetail = async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
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
        const startDateTime = new Date(result.startTime);
        const endDateTime = new Date(result.endTime);
        setFormData({
          name: result.name,
          description: result.description || '',
          coverImage: result.coverImage || '',
          startDate: startDateTime.toISOString().split('T')[0],
          startTime: startDateTime.toTimeString().slice(0, 5),
          endDate: endDateTime.toISOString().split('T')[0],
          endTime: endDateTime.toTimeString().slice(0, 5),
          location: result.location,
          maxParticipants: result.maxParticipants
        });
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
      toast({
        variant: 'destructive',
        title: '获取活动详情失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取当前用户的家庭组
  const fetchFamilyGroup = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'family_memberships',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                userId: {
                  $eq: currentUser.userId
                }
              }, {
                status: {
                  $eq: 'active'
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      });
      if (result && result.records && result.records.length > 0) {
        setFamilyGroupId(result.records[0].familyGroupId);
        return result.records[0].familyGroupId;
      }
      return null;
    } catch (error) {
      console.error('获取家庭组失败:', error);
      return null;
    }
  };

  // 页面初始化
  useEffect(() => {
    fetchFamilyGroup();
    if (isEdit) {
      fetchActivityDetail();
    }
  }, [activityId]);

  // 处理表单变化
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 验证表单
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: '请填写活动名称',
        description: '活动名称不能为空'
      });
      return false;
    }
    if (!formData.startDate || !formData.startTime) {
      toast({
        variant: 'destructive',
        title: '请选择开始时间',
        description: '开始时间不能为空'
      });
      return false;
    }
    if (!formData.endDate || !formData.endTime) {
      toast({
        variant: 'destructive',
        title: '请选择结束时间',
        description: '结束时间不能为空'
      });
      return false;
    }
    if (!formData.location.trim()) {
      toast({
        variant: 'destructive',
        title: '请填写活动地点',
        description: '活动地点不能为空'
      });
      return false;
    }
    if (formData.maxParticipants < 1) {
      toast({
        variant: 'destructive',
        title: '人数限制错误',
        description: '人数限制至少为1人'
      });
      return false;
    }

    // 验证结束时间是否晚于开始时间
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    if (endDateTime <= startDateTime) {
      toast({
        variant: 'destructive',
        title: '时间设置错误',
        description: '结束时间必须晚于开始时间'
      });
      return false;
    }
    return true;
  };

  // 保存活动
  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const startTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
      if (!familyGroupId) {
        toast({
          variant: 'destructive',
          title: '保存失败',
          description: '未找到家庭组信息'
        });
        return;
      }
      const activityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        coverImage: formData.coverImage.trim(),
        startTime: startTime,
        endTime: endTime,
        location: formData.location.trim(),
        maxParticipants: parseInt(formData.maxParticipants),
        familyGroupId: familyGroupId,
        createdBy: currentUser.userId,
        status: 'planning'
      };
      if (isEdit) {
        // 更新活动
        const result = await props.$w.cloud.callDataSource({
          dataSourceName: 'family_activities',
          methodName: 'wedaUpdateV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: activityId
                }
              }
            },
            data: activityData
          }
        });
        if (result) {
          toast({
            variant: 'default',
            title: '更新成功',
            description: '活动信息已更新'
          });
          navigateTo({
            pageId: 'family-activity-detail',
            params: {
              id: activityId
            }
          });
        }
      } else {
        // 创建活动
        const result = await props.$w.cloud.callDataSource({
          dataSourceName: 'family_activities',
          methodName: 'wedaCreateV2',
          params: {
            data: activityData
          }
        });
        if (result && result.id) {
          toast({
            variant: 'default',
            title: '创建成功',
            description: '活动已创建成功'
          });
          navigateTo({
            pageId: 'family-activity-detail',
            params: {
              id: result.id
            }
          });
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEdit ? '更新失败' : '创建失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8B4E]" />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FFEDD5] to-[#FFF8E7] pb-8">
      {/* 头部 */}
      <div className="bg-white rounded-b-3xl shadow-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <Button className="bg-[#FCEEB8] text-[#FF6B35] h-10 w-10 p-0 rounded-full" onClick={() => navigateBack()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#FF6B35]" style={{
          fontFamily: 'Quicksand'
        }}>
            {isEdit ? '编辑活动' : '创建活动'}
          </h1>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
          {/* 活动名称 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              <FileText className="h-4 w-4" />
              活动名称
            </label>
            <Input className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" placeholder="请输入活动名称" value={formData.name} onChange={e => handleChange('name', e.target.value)} maxLength={100} />
          </div>

          {/* 封面图片 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              <ImageIcon className="h-4 w-4" />
              封面图片
            </label>
            <Input className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" placeholder="请输入图片URL" value={formData.coverImage} onChange={e => handleChange('coverImage', e.target.value)} />
            {formData.coverImage && <div className="mt-3 rounded-xl overflow-hidden h-40">
                <img src={formData.coverImage} alt="封面预览" className="w-full h-full object-cover" onError={e => {
              e.target.src = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800';
            }} />
              </div>}
          </div>

          {/* 开始时间 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              <Clock className="h-4 w-4" />
              开始时间
            </label>
            <div className="flex gap-3">
              <Input type="date" className="flex-1 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
              <Input type="time" className="w-32 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" value={formData.startTime} onChange={e => handleChange('startTime', e.target.value)} />
            </div>
          </div>

          {/* 结束时间 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              <Clock className="h-4 w-4" />
              结束时间
            </label>
            <div className="flex gap-3">
              <Input type="date" className="flex-1 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} />
              <Input type="time" className="w-32 bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" value={formData.endTime} onChange={e => handleChange('endTime', e.target.value)} />
            </div>
          </div>

          {/* 活动地点 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              <MapPin className="h-4 w-4" />
              活动地点
            </label>
            <Input className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" placeholder="请输入活动地点" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
          </div>

          {/* 人数限制 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              <Users className="h-4 w-4" />
              人数限制
            </label>
            <Input type="number" min={1} max={100} className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl h-12 text-[#8B7355]" placeholder="请输入人数限制" value={formData.maxParticipants} onChange={e => handleChange('maxParticipants', e.target.value)} />
          </div>

          {/* 活动描述 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#FF6B35] mb-2" style={{
            fontFamily: 'Quicksand'
          }}>
              <FileText className="h-4 w-4" />
              活动描述
            </label>
            <textarea className="w-full bg-[#FCEEB8] border-2 border-[#FF8B4E] rounded-xl p-3 text-[#8B7355] resize-none" rows={4} placeholder="请输入活动描述" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
          </div>

          {/* 保存按钮 */}
          <Button className="w-full bg-[#FF8B4E] text-white h-14 rounded-xl font-bold text-lg shadow-lg hover:bg-[#FF6B35]" onClick={handleSave} disabled={saving}>
            {saving ? <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                保存中...
              </> : <>
                <Calendar className="h-5 w-5 mr-2" />
                {isEdit ? '更新活动' : '创建活动'}
              </>}
          </Button>
        </div>
      </div>
    </div>;
}