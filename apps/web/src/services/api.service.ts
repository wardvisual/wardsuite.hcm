import axios, { AxiosError } from 'axios';
import { firebaseAuth } from '@web/lib/firebase';

const http = axios.create({ baseURL: '/api' });

http.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const idToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message = err.response?.data?.message ?? err.message ?? 'Request failed';
    throw new Error(message);
  },
);

type ApiResponse<T> = { data: T };

export const apiRequest = {
  get: <T>(path: string) =>
    http.get<ApiResponse<T>>(path).then((r) => r.data.data),

  post: <T>(path: string, body?: unknown) =>
    http.post<ApiResponse<T>>(path, body).then((r) => r.data.data),

  patch: <T>(path: string, body?: unknown) =>
    http.patch<ApiResponse<T>>(path, body).then((r) => r.data.data),

  delete: <T>(path: string, body?: unknown) =>
    http.delete<ApiResponse<T>>(path, { data: body }).then((r) => r.data.data),
};
