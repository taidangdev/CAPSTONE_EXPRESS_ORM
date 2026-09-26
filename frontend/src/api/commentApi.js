import axiosClient from "./axiosClient";

export const listComments = (imageId, { page = 1, limit = 20 } = {}) =>
  axiosClient.get(`/images/${imageId}/comments`, { params: { page, limit } }).then((r) => r.data);

export const createComment = (imageId, content) =>
  axiosClient.post(`/images/${imageId}/comments`, { content }).then((r) => r.data);
