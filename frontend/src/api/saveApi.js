import axiosClient from "./axiosClient";

export const isSaved = (imageId) => axiosClient.get(`/images/${imageId}/saved`).then((r) => r.data);

export const saveImage = (imageId) => axiosClient.post(`/images/${imageId}/save`).then((r) => r.data);

export const unsaveImage = (imageId) =>
  axiosClient.delete(`/images/${imageId}/save`).then((r) => r.data);
