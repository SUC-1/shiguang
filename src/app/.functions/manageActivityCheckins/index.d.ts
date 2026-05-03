/// <reference path="../../types/weda.d.ts" />

interface CheckinData {
  activityId: string;
  userId: string;
  nickname: string;
  avatar?: string;
  checkinTime: string;
  checkinLocation?: string;
  checkinPhoto?: string;
  notes?: string;
}

interface CheckinParams {
  activityId: string;
  checkinLocation?: string;
  checkinPhoto?: string;
  notes?: string;
}

interface GetCheckinsParams {
  activityId: string;
  pageSize?: number;
  pageNumber?: number;
}

interface GetCheckinStatsParams {
  activityId: string;
}

interface CheckCheckinParams {
  activityId: string;
}

export type {
  CheckinData,
  CheckinParams,
  GetCheckinsParams,
  GetCheckinStatsParams,
  CheckCheckinParams
};
