// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Heart, ChefHat, ArrowRight } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export default function FamilyRole(props) {
  const {
    navigateTo
  } = props.$w.utils;
  return <div className="min-h-screen bg-gradient-to-br from-[#FCEEB8] via-[#FF8B4E] to-[#FF6B35] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{
          fontFamily: 'Quicksand'
        }}>
            温馨家庭
          </h1>
          <p className="text-lg text-white opacity-90" style={{
          fontFamily: 'Nunito'
        }}>
            请选择您的角色
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 家庭成员卡片 */}
          <div onClick={() => navigateTo({
          pageId: 'family-member',
          params: {}
        })} className="bg-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition-all hover:scale-105">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                家庭成员
              </h2>
              <p className="text-base text-[#8B7355] text-center" style={{
              fontFamily: 'Nunito'
            }}>
                点菜、留言、分享美食
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-[#FF6B35] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>
                  进入点菜
                </span>
                <ArrowRight className="h-5 w-5 text-[#FF6B35]" />
              </div>
            </div>
          </div>

          {/* 家庭大厨卡片 */}
          <div onClick={() => navigateTo({
          pageId: 'family-chef',
          params: {}
        })} className="bg-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition-all hover:scale-105">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#9CCF4E] to-[#FF6B35] rounded-full flex items-center justify-center shadow-lg">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#FF6B35]" style={{
              fontFamily: 'Quicksand'
            }}>
                家庭大厨
              </h2>
              <p className="text-base text-[#8B7355] text-center" style={{
              fontFamily: 'Nunito'
            }}>
                查看订单、准备食材、烹饪指导
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-[#FF6B35] font-semibold" style={{
                fontFamily: 'Nunito'
              }}>
                  进入管理
                </span>
                <ArrowRight className="h-5 w-5 text-[#FF6B35]" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => window.history.back()} className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] h-12 px-8 font-bold rounded-xl hover:bg-[#FF6B35] hover:text-white transition-colors" style={{
          fontFamily: 'Quicksand'
        }}>
            返回
          </Button>
        </div>
      </div>
    </div>;
}