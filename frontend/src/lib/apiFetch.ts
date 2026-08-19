export const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
