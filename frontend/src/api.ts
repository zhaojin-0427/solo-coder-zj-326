import type { Term, TermDetail, Pronunciation, Annotation, Version, Statistics, PaginatedResponse, Story, StoryDetail, StoryRevision, StoryFilters, Location, LocationDetail, LocationFilters, HeritageTask, HeritageTaskDetail, HeritageTaskFilters } from '@/types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  terms: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<Term>>(`/terms/${qs}`);
    },
    get: (id: number) => request<TermDetail>(`/terms/${id}/`),
    create: (data: Partial<Term> & { locations?: number[] }) => request<Term>('/terms/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Term> & { locations?: number[] }) => request<Term>(`/terms/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/terms/${id}/`, { method: 'DELETE' }),
  },
  pronunciations: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<Pronunciation>>(`/pronunciations/${qs}`);
    },
    create: (data: Partial<Pronunciation>) => request<Pronunciation>('/pronunciations/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Pronunciation>) => request<Pronunciation>(`/pronunciations/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/pronunciations/${id}/`, { method: 'DELETE' }),
  },
  annotations: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<Annotation>>(`/annotations/${qs}`);
    },
    create: (data: Partial<Annotation>) => request<Annotation>('/annotations/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Annotation>) => request<Annotation>(`/annotations/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/annotations/${id}/`, { method: 'DELETE' }),
  },
  versions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<Version>>(`/versions/${qs}`);
    },
    create: (data: Partial<Version>) => request<Version>('/versions/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Version>) => request<Version>(`/versions/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/versions/${id}/`, { method: 'DELETE' }),
  },
  stories: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<Story>>(`/stories/${qs}`);
    },
    get: (id: number) => request<StoryDetail>(`/stories/${id}/`),
    create: (data: Partial<Story> & { related_terms?: number[] | string; locations?: number[] }) => request<Story>('/stories/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Story> & { related_terms?: number[] | string; locations?: number[] }) => request<Story>(`/stories/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/stories/${id}/`, { method: 'DELETE' }),
    getFilters: () => request<StoryFilters>('/story-filters/'),
  },
  storyRevisions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<StoryRevision>>(`/story-revisions/${qs}`);
    },
    create: (data: Partial<StoryRevision>) => request<StoryRevision>('/story-revisions/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<StoryRevision>) => request<StoryRevision>(`/story-revisions/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/story-revisions/${id}/`, { method: 'DELETE' }),
  },
  locations: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<Location>>(`/locations/${qs}`);
    },
    get: (id: number) => request<LocationDetail>(`/locations/${id}/`),
    create: (data: Partial<Location>) => request<Location>('/locations/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Location>) => request<Location>(`/locations/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/locations/${id}/`, { method: 'DELETE' }),
    getFilters: () => request<LocationFilters>('/location-filters/'),
  },
  heritageTasks: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<PaginatedResponse<HeritageTask>>(`/heritage-tasks/${qs}`);
    },
    get: (id: number) => request<HeritageTaskDetail>(`/heritage-tasks/${id}/`),
    create: (data: Partial<HeritageTask> & { related_terms?: number[]; related_stories?: number[]; related_locations?: number[] }) => request<HeritageTask>('/heritage-tasks/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<HeritageTask> & { related_terms?: number[]; related_stories?: number[]; related_locations?: number[] }) => request<HeritageTask>(`/heritage-tasks/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/heritage-tasks/${id}/`, { method: 'DELETE' }),
    changeStatus: (id: number, data: { to_status: string; comment?: string; rework_reason?: string; is_final_confirmation?: boolean; operated_by?: string; role?: string }) =>
      request<HeritageTaskDetail>(`/heritage-tasks/${id}/change_status/`, { method: 'POST', body: JSON.stringify(data) }),
    getFilters: () => request<HeritageTaskFilters>('/heritage-task-filters/'),
  },
  statistics: {
    get: () => request<Statistics>('/statistics/'),
  },
};
