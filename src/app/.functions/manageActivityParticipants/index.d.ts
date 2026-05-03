/// <reference path="../../types/weda.d.ts" />

interface ParticipantData {
  activityId: string;
  userId: string;
  nickname: string;
  avatar?: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: string;
  notes?: string;
}

interface RegisterParams {
  activityId: string;
  notes?: string;
}

interface CancelRegistrationParams {
  participantId: string;
}

interface GetParticipantsParams {
  activityId: string;
  status?: string[];
  pageSize?: number;
  pageNumber?: number;
}

interface GetParticipantDetailParams {
  participantId: string;
}

interface CheckRegistrationParams {
  activityId: string;
}

export type {
  ParticipantData,
  RegisterParams,
  CancelRegistrationParams,
  GetParticipantsParams,
  GetParticipantDetailParams,
  CheckRegistrationParams
};
