interface FamilyPermission {
  userId: string;
  familyId: string;
  permissions: {
    canManageDishes: boolean;
    canManageTemplates: boolean;
    canManagePayments: boolean;
    canInviteMembers: boolean;
    canViewReports: boolean;
  };
  role: 'owner' | 'admin' | 'member' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

interface CloudFunctionEvent {
  action: 'create' | 'query' | 'update' | 'delete' | 'assign' | 'verify';
  userId?: string;
  familyId?: string;
  permissionId?: string;
  permissions?: Partial<FamilyPermission['permissions']>;
  role?: FamilyPermission['role'];
  queryType?: 'all' | 'byUser' | 'byFamily' | 'byRole';
  page?: number;
  pageSize?: number;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<any>;