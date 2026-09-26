import axiosClient from "./axiosClient";

export const listImages = ({ page = 1, limit = 20 } = {}) =>
  axiosClient.get("/images", { params: { page, limit } }).then((r) => r.data);

export const searchImages = ({ name, page = 1, limit = 20 }) =>
  axiosClient.get("/images/search", { params: { name, page, limit } }).then((r) => r.data);

export const getImage = (id) => axiosClient.get(`/images/${id}`).then((r) => r.data);

export const createImage = ({ name, description, file, onUploadProgress }) => {
  const form = new FormData();
  form.append("name", name);
  if (description) form.append("description", description);
  form.append("image", file);
  return axiosClient.post("/images", form, { onUploadProgress }).then((r) => r.data);
};

export const deleteImage = (id) => axiosClient.delete(`/images/${id}`).then((r) => r.data);
