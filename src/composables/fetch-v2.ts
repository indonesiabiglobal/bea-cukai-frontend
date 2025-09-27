import { log } from 'console';
import type { H3Event } from 'h3'
import { ofetch } from 'ofetch'
import { useToast } from 'primevue/usetoast';

export function useApiFetchV2(event?: H3Event) {
  const token = useUserToken(event);
  const toast = useToast();

  // Definisikan ofetch instance dengan konfigurasi global
  const api = ofetch.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
    headers: {
      'Accept': 'application/json',
    },
    onRequest: ({ options }) => {
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        };
      }
    },
  });

  // Wrapper untuk metode API yang secara otomatis menampilkan toast saat sukses atau gagal
  async function apiCall(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, options?: Record<string, any>, body?: any, showToastOption: boolean = true) {
    try {
      const response = await api(url, { method, body, ...options });

      if (showToastOption) {
        const successMessage = response.meta.message || response.statusText || 'Unknown success message';

        toast.add({
          severity: 'success',
          summary: `Success`,
          detail: successMessage,
          life: 5000,
        });
      }

      return response;
    } catch (error: any) {
      if (showToastOption) {
        const errorMessage = error?.response?._data?.meta?.message || error.response._data.message ||   'Unknown error message';

        toast.add({
          severity: 'error',
          summary: `Error ${error.response?.status || 'Unknown'}`,
          detail: errorMessage,
          life: 5000,
        });
      }
      throw error;
    }
  }

  // Definisikan wrapper untuk mempermudah pemanggilan dengan metode post, get, dll.
  return {
    get: (url: string, params?: Record<string, any>, showToastOption: boolean = true, options?: Record<string, any>) =>
      apiCall('GET', url, { params, ...options }, undefined, showToastOption),

    post: (url: string, body: any, showToastOption: boolean = true, options?: Record<string, any>) =>
      apiCall('POST', url, options, body, showToastOption),

    put: (url: string, body: any, showToastOption: boolean = true, options?: Record<string, any>) =>
      apiCall('PUT', url, options, body, showToastOption),

    delete: (url: string, body?: any, showToastOption: boolean = true, options?: Record<string, any>) =>
      apiCall('DELETE', url, options, body, showToastOption),
  };
}