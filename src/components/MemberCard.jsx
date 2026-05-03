// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Users, Crown, Shield, User, ChevronRight } from 'lucide-react';

// 成员头像组件
const MemberAvatar = ({
  nickname,
  avatar,
  role,
  size = 'md'
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-xl'
  };
  const getRoleIcon = () => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-[#9CCF4E]" />;
      default:
        return null;
    }
  };
  const getRoleColor = () => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'admin':
        return 'bg-gradient-to-br from-[#9CCF4E] to-[#7CB342]';
      default:
        return 'bg-gradient-to-br from-[#FF8B4E] to-[#FF6B35]';
    }
  };
  return <div className="relative inline-block">
      {avatar ? <img src={avatar} alt={nickname} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-md`} /> : <div className={`${sizes[size]} ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
          {nickname ? nickname.charAt(0).toUpperCase() : '?'}
        </div>}
      {/* 角色标识 */}
      {(role === 'owner' || role === 'admin') && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
          {getRoleIcon()}
        </div>}
    </div>;
};

// 成员卡片组件
const MemberCard = ({
  member,
  onClick,
  showRole = true,
  showActions = false,
  onAction
}) => {
  const getRoleText = role => {
    switch (role) {
      case 'owner':
        return '所有者';
      case 'admin':
        return '管理员';
      case 'member':
        return '成员';
      default:
        return '成员';
    }
  };
  const getRoleBadgeStyle = role => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-700';
      case 'admin':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-orange-100 text-orange-700';
    }
  };
  return <div className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MemberAvatar nickname={member.nickname} avatar={member.avatar} role={member.role} size="lg" />
          <div>
            <h4 className="font-bold text-[#FF6B35]" style={{
            fontFamily: 'Quicksand'
          }}>
              {member.nickname || '未命名'}
            </h4>
            {showRole && <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeStyle(member.role)}`}>
                {getRoleText(member.role)}
              </span>}
          </div>
        </div>
        {showActions && <button className="text-[#FF8B4E] hover:text-[#FF6B35] transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>}
      </div>
    </div>;
};

// 成员列表组件
const MemberList = ({
  members,
  onMemberClick,
  emptyText = '暂无家庭成员',
  maxDisplay
}) => {
  const displayMembers = maxDisplay ? members.slice(0, maxDisplay) : members;
  if (!members || members.length === 0) {
    return <div className="text-center py-8">
        <Users className="h-12 w-12 text-[#FF8B4E] mx-auto mb-3 opacity-50" />
        <p className="text-sm text-[#8B7355]" style={{
        fontFamily: 'Nunito'
      }}>
          {emptyText}
        </p>
      </div>;
  }
  return <div className="space-y-3">
      {displayMembers.map(member => <MemberCard key={member.id} member={member} onClick={onMemberClick ? () => onMemberClick(member) : undefined} showRole={true} />)}
      {maxDisplay && members.length > maxDisplay && <p className="text-center text-sm text-[#8B7355]" style={{
      fontFamily: 'Nunito'
    }}>
          还有 {members.length - maxDisplay} 位成员...
        </p>}
    </div>;
};

// 成员头像组组件
const MemberAvatarGroup = ({
  members,
  maxShow = 3,
  size = 'md'
}) => {
  if (!members || members.length === 0) return null;
  const display = members.slice(0, maxShow);
  const remaining = members.length - maxShow;
  return <div className="flex items-center -space-x-2">
      {display.map((member, index) => <div key={member.id || index} className="relative">
          <MemberAvatar nickname={member.nickname} avatar={member.avatar} role={member.role} size={size} />
          {index === 0 && member.role === 'owner' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="h-2 w-2 text-white" />
            </div>}
        </div>)}
      {remaining > 0 && <div className={`w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white`}>
          +{remaining}
        </div>}
    </div>;
};
export { MemberAvatar, MemberCard, MemberList, MemberAvatarGroup };