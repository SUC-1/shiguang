/// <reference path="../../types/weda.d.ts" />

interface PhotoData {
  activityId: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  uploadedBy: string;
  uploaderNickname: string;
  uploadedAt: string;
}

interface UploadPhotoParams {
  activityId: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
}

interface GetPhotosParams {
  activityId: string;
  pageSize?: number;
  pageNumber?: number;
}

interface DeletePhotoParams {
  photoId: string;
}

interface UpdatePhotoParams {
  photoId: string;
  description?: string;
}

export type {
  PhotoData,
  UploadPhotoParams,
  GetPhotosParams,
  DeletePhotoParams,
  UpdatePhotoParams
};
