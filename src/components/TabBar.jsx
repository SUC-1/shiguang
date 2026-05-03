// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Home, ChefHat, Store, User, Sparkles } from 'lucide-react';

export function TabBar({
  activeTab,
  onTabChange,
  userRole,
  navigateTo
}) {
  const [pressedTab, setPressedTab] = useState(null);

  // 根据用户角色显示不同的导航项
  const getNavItems = () => {
    if (userRole === 'family') {
      return [{
        id: 'home',
        label: '首页',
        icon: Home
      }, {
        id: 'member',
        label: '点菜',
        icon: ChefHat
      }, {
        id: 'chef',
        label: '大厨',
        icon: ChefHat
      }, {
        id: 'ai',
        label: 'AI文案',
        icon: Sparkles
      }, {
        id: 'profile',
        label: '我的',
        icon: User
      }];
    } else if (userRole === 'dining') {
      return [{
        id: 'dining',
        label: '管理',
        icon: Store
      }, {
        id: 'orders',
        label: '订单',
        icon: Home
      }, {
        id: 'menu',
        label: '菜单',
        icon: ChefHat
      }, {
        id: 'ai',
        label: 'AI文案',
        icon: Sparkles
      }, {
        id: 'profile',
        label: '我的',
        icon: User
      }];
    }
    return [];
  };
  const navItems = getNavItems();
  const handleTabClick = item => {
    setPressedTab(item.id);
    setTimeout(() => setPressedTab(null), 150);
    if (item.id === 'ai') {
      navigateTo({
        pageId: 'ai-copywriting',
        params: {}
      });
    } else {
      onTabChange && onTabChange(item.id);
    }
  };
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#FCEEB8] shadow-lg z-50 safe-area-bottom">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPressed = pressedTab === item.id;
          return <button key={item.id} onClick={() => handleTabClick(item)} className={`
                flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl 
                transition-all duration-200 ease-out
                active:scale-90
                ${isActive ? 'text-[#FF8B4E] bg-[#FCEEB8] shadow-inner' : 'text-[#8B7355] hover:text-[#FF6B35] hover:bg-[#FFF9E6]'}
                ${isPressed ? 'scale-90' : ''}
              `}>
              <div className={`
                relative transition-transform duration-200
                ${isActive ? 'transform -translate-y-0.5' : ''}
              `}>
                <Icon className={`
                  h-6 w-6 transition-all duration-200
                  ${isActive ? 'drop-shadow-md' : ''}
                `} />
                {isActive && <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF8B4E] rounded-full" />}
              </div>
              <span className={`
                text-xs font-semibold transition-all duration-200
                ${isActive ? 'text-[#FF6B35]' : ''}
              `} style={{
              fontFamily: 'Quicksand'
            }}>
                {item.label}
              </span>
            </button>;
        })}
        </div>
      </div>
    </div>;
}
export default TabBar;