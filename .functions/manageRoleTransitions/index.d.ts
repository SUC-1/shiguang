interface RoleTransition {
  _id?: string;
  applicantId: string;           // 申请人ID
  targetUserId: string;          // 目标用户ID
  familyId: string;              // 家庭ID
  currentRole: string;           // 当前角色
  targetRole: string;            // 目标角色
  reason: string;                // 变更原因
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'; // 审批状态
  approverId?: string;           // 审批人ID
  approvalComment?: string;      // 审批意见
  appliedAt: Date;               // 申请时间
  approvedAt?: Date;             // 审批时间
  effectiveAt?: Date;            // 生效时间
}

interface RoleHistory {
  _id?: string;
  userId: string;                // 用户ID
  familyId: string;              // 家庭ID
  fromRole: string;              // 原角色
  toRole: string;                // 新角色
  transitionId: string;          // 关联的流转记录ID
  changedBy: string;             // 变更操作人
  changedAt: Date;               // 变更时间
  reason: string;                // 变更原因
}

interface CloudFunctionEvent {
  action: 'apply' | 'approve' | 'reject' | 'cancel' | 'query' | 'history';
  transitionId?: string;
  applicantId?: string;
  targetUserId?: string;
  familyId?: string;
  targetRole?: string;
  reason?: string;
  approvalComment?: string;
  queryType?: 'pending' | 'byApplicant' | 'byFamily' | 'byStatus' | 'all';
  status?: string;
  page?: number;
  pageSize?: number;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<any>;