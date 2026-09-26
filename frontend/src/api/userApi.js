import axiosClient from "./axiosClient";

export const getMe = () => axiosClient.get("/users/me").then((r) => r.data);

export const updateMe = ({ fullName, age, avatarFile }) => {
  const form = new FormData();
  if (fullName !== undefined) form.append("fullName", fullName);
  if (age !== undefined && age !== "") form.append("age", age);
  if (avatarFile) form.append("avatar", avatarFile);
  return axiosClient.put("/users/me", form).then((r) => r.data);
};

export const getCreatedImages = ({ page = 1, limit = 20 } = {}) =>
  axiosClient.get("/users/me/created-images", { params: { page, limit } }).then((r) => r.data);

export const getSavedImages = ({ page = 1, limit = 20 } = {}) =>
  axiosClient.get("/users/me/saved-images", { params: { page, limit } }).then((r) => r.data);
