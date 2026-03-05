/**
 * Student API Service
 * All calls include the JWT stored in localStorage as a Bearer token.
 */

const BASE_URL = '/api/v1';

const getToken = (): string | null => localStorage.getItem('authToken');

const authHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = { ...authHeaders(), ...(options.headers as Record<string, string> | undefined) };

    // If body is FormData, do not set Content-Type so browser can set boundaries automatically
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || data.message || 'Request failed');
    }
    return data;
}

// ─────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────
export const getMyProfile = () => request('/students/me/profile');

export const updateMyProfile = (data: Record<string, unknown>) =>
    request('/students/me/profile', { method: 'PUT', body: JSON.stringify(data) });

// ─────────────────────────────────────────────────────────
// MARKS
// ─────────────────────────────────────────────────────────
export const getMyMarks = (params?: { semester?: number; academicYear?: string }) => {
    const qs = new URLSearchParams();
    if (params?.semester) qs.set('semester', String(params.semester));
    if (params?.academicYear) qs.set('academicYear', params.academicYear);
    return request(`/student/marks${qs.toString() ? `?${qs}` : ''}`);
};

export const getMyInternalMarks = (params?: { semester?: number; internalNumber?: number }) => {
    const qs = new URLSearchParams();
    if (params?.semester) qs.set('semester', String(params.semester));
    if (params?.internalNumber) qs.set('internalNumber', String(params.internalNumber));
    return request(`/student/marks/internal${qs.toString() ? `?${qs}` : ''}`);
};

export const getMarksSummary = () => request('/student/marks/summary');

// ─────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────
export const getMyProjects = (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return request(`/student/projects${qs}`);
};

export const createProject = (data: FormData | Record<string, unknown>) =>
    request('/student/projects', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) });

export const updateProject = (id: string | number, data: FormData | Record<string, unknown>) =>
    request(`/student/projects/${id}`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) });

export const deleteProject = (id: string | number) =>
    request(`/student/projects/${id}`, { method: 'DELETE' });

// ─────────────────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────────────────
export const getMyCertifications = () => request('/student/certifications');

export const createCertification = (data: FormData | Record<string, unknown>) =>
    request('/student/certifications', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) });

export const updateCertification = (id: string | number, data: FormData | Record<string, unknown>) =>
    request(`/student/certifications/${id}`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) });

export const deleteCertification = (id: string | number) =>
    request(`/student/certifications/${id}`, { method: 'DELETE' });

// ─────────────────────────────────────────────────────────
// SPORTS
// ─────────────────────────────────────────────────────────
export const getMySports = () => request('/student/extracurricular/sports');

export const createSport = (data: FormData | Record<string, unknown>) =>
    request('/student/extracurricular/sports', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) });

export const updateSport = (id: string | number, data: FormData | Record<string, unknown>) =>
    request(`/student/extracurricular/sports/${id}`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) });

export const deleteSport = (id: string | number) =>
    request(`/student/extracurricular/sports/${id}`, { method: 'DELETE' });

// ─────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────
export const getMyEvents = () => request('/student/extracurricular/events');

export const createEvent = (data: FormData | Record<string, unknown>) =>
    request('/student/extracurricular/events', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) });

export const updateEvent = (id: string | number, data: FormData | Record<string, unknown>) =>
    request(`/student/extracurricular/events/${id}`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) });

export const deleteEvent = (id: string | number) =>
    request(`/student/extracurricular/events/${id}`, { method: 'DELETE' });

// ─────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────
export const getMyNotifications = (params?: { isRead?: boolean; type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.isRead !== undefined) qs.set('isRead', String(params.isRead));
    if (params?.type) qs.set('type', params.type);
    return request(`/student/notifications${qs.toString() ? `?${qs}` : ''}`);
};

export const markNotificationRead = (id: string | number) =>
    request(`/student/notifications/${id}/read`, { method: 'PUT' });

export const markAllNotificationsRead = () =>
    request('/student/notifications/read-all', { method: 'PUT' });

// ─────────────────────────────────────────────────────────
// LEAVES
// ─────────────────────────────────────────────────────────
export const getMyLeaves = (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return request(`/student-leaves${qs}`);
};

export const applyLeave = (data: FormData | Record<string, unknown>) =>
    request('/student-leaves', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) });

export const updateLeave = (id: string | number, data: FormData | Record<string, unknown>) =>
    request(`/student-leaves/${id}`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) });

export const cancelLeave = (id: string | number) =>
    request(`/student-leaves/${id}`, { method: 'DELETE' });

