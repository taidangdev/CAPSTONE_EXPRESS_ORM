import axiosClient from "./axiosClient";

export const register = (payload) => axiosClient.post("/auth/register", payload).then((r) => r.data);

export const login = (payload) => axiosClient.post("/auth/login", payload).then((r) => r.data);
