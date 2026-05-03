/// <reference path="../../types/weda.d.ts" />

interface ActivityData {
  name: string;
  description?: string;
  coverImage?: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  familyGroupId: string;
  createdBy: string;
}

interface CreateActivityParams {
  data: ActivityData;
}

interface UpdateActivityParams {
  filter: {
    where: {
      _id: { $eq: string };
    };
  };
  data: Partial<ActivityData>;
}

interface DeleteActivityParams {
  filter: {
    where: {
      _id: { $eq: string };
    };
  };
}

interface GetActivityParams {
  filter: {
    where: {
      _id: { $eq: string };
    };
  };
}

interface ListActivitiesParams {
  filter?: {
    where?: any;
  };
  orderBy?: Array<{ [key: string]: 'asc' | 'desc' }>;
  pageSize?: number;
  pageNumber?: number;
}

interface UpdateStatusParams {
  activityId: string;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
}

export type {
  ActivityData,
  CreateActivityParams,
  UpdateActivityParams,
  DeleteActivityParams,
  GetActivityParams,
  ListActivitiesParams,
  UpdateStatusParams
};
