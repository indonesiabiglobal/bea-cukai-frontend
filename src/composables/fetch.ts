import type { H3Event } from 'h3'
import { ofetch } from 'ofetch'

export function useApiFetch(event?: H3Event) {
  const token = useUserToken(event)

  return ofetch.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
    // We set an interceptor for each request to
    // include Bearer token to the request if user is logged in
    onRequest: ({ options }) => {
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        }
      }
    },
  })
}

export async function postApi(url: string, dataSave: { [key: string]: unknown }) {
  const response = await fetch(`http://203.142.86.243:3131/api/${url}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataSave)
  });

  const res = await response.json();

  if (response.ok) {
    sessionStorage.setItem('authToken', res.result.token);
    return res;
  } else {
    return res;
    // throw new Error(res.meta.message);
  }
}

export async function getApi(url: string) {
  const token = sessionStorage.getItem('authToken');
  const response = await fetch(`http://203.142.86.243:3131/api/${url}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}` // Gunakan token dari sessionStorage
    }
  });

  const res = await response.json();

  if (response.ok) {
    return res;
  } else {
    throw new Error(res.message);
  }
}


