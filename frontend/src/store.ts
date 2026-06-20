import { create } from 'zustand';
import type {
  Term,
  TermDetail,
  Pronunciation,
  Annotation,
  Version,
  Statistics,
  Story,
  StoryDetail,
  StoryRevision,
  StoryFilters,
  Location,
  LocationDetail,
  LocationFilters,
  HeritageTask,
  HeritageTaskDetail,
  HeritageTaskFilters,
} from '@/types';
import { api } from '@/api';

interface PaginationState {
  count: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AppStore {
  terms: Term[];
  termsPagination: PaginationState;
  currentTerm: TermDetail | null;
  pronunciations: Pronunciation[];
  pronunciationsPagination: PaginationState;
  annotations: Annotation[];
  annotationsPagination: PaginationState;
  versions: Version[];
  versionsPagination: PaginationState;
  stories: Story[];
  storiesPagination: PaginationState;
  currentStory: StoryDetail | null;
  storyFilters: StoryFilters | null;
  allTerms: Term[];
  allLocations: Location[];
  locations: Location[];
  locationsPagination: PaginationState;
  currentLocation: LocationDetail | null;
  locationFilters: LocationFilters | null;
  heritageTasks: HeritageTask[];
  heritageTasksPagination: PaginationState;
  currentHeritageTask: HeritageTaskDetail | null;
  heritageTaskFilters: HeritageTaskFilters | null;
  statistics: Statistics | null;
  loading: boolean;
  error: string | null;

  fetchTerms: (params?: Record<string, string>, reset?: boolean) => Promise<void>;
  fetchTerm: (id: number) => Promise<void>;
  createTerm: (data: Partial<Term> & { locations?: number[] }) => Promise<void>;
  updateTerm: (id: number, data: Partial<Term> & { locations?: number[] }) => Promise<void>;
  deleteTerm: (id: number) => Promise<void>;
  setTermsPage: (page: number) => void;
  fetchAllTerms: () => Promise<void>;

  fetchPronunciations: (params?: Record<string, string>, reset?: boolean) => Promise<void>;
  createPronunciation: (data: Partial<Pronunciation>) => Promise<void>;
  updatePronunciation: (id: number, data: Partial<Pronunciation>) => Promise<void>;
  deletePronunciation: (id: number) => Promise<void>;
  setPronunciationsPage: (page: number) => void;

  fetchAnnotations: (params?: Record<string, string>, reset?: boolean) => Promise<void>;
  createAnnotation: (data: Partial<Annotation>) => Promise<void>;
  updateAnnotation: (id: number, data: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (id: number) => Promise<void>;
  setAnnotationsPage: (page: number) => void;

  fetchVersions: (params?: Record<string, string>, reset?: boolean) => Promise<void>;
  createVersion: (data: Partial<Version>) => Promise<void>;
  updateVersion: (id: number, data: Partial<Version>) => Promise<void>;
  deleteVersion: (id: number) => Promise<void>;
  setVersionsPage: (page: number) => void;

  fetchStories: (params?: Record<string, string>, reset?: boolean) => Promise<void>;
  fetchStory: (id: number) => Promise<void>;
  createStory: (data: Partial<Story> & { related_terms?: number[]; locations?: number[] }) => Promise<void>;
  updateStory: (id: number, data: Partial<Story> & { related_terms?: number[]; locations?: number[] }) => Promise<void>;
  deleteStory: (id: number) => Promise<void>;
  setStoriesPage: (page: number) => void;
  fetchStoryFilters: () => Promise<void>;
  createStoryRevision: (data: Partial<StoryRevision>) => Promise<void>;

  fetchLocations: (params?: Record<string, string>, reset?: boolean) => Promise<void>;
  fetchLocation: (id: number) => Promise<void>;
  createLocation: (data: Partial<Location>) => Promise<void>;
  updateLocation: (id: number, data: Partial<Location>) => Promise<void>;
  deleteLocation: (id: number) => Promise<void>;
  setLocationsPage: (page: number) => void;
  fetchLocationFilters: () => Promise<void>;
  fetchAllLocations: () => Promise<void>;

  fetchHeritageTasks: (params?: Record<string, string>, reset?: boolean) => Promise<void>;
  fetchHeritageTask: (id: number) => Promise<void>;
  createHeritageTask: (data: Partial<HeritageTask> & { related_terms?: number[]; related_stories?: number[]; related_locations?: number[] }) => Promise<void>;
  updateHeritageTask: (id: number, data: Partial<HeritageTask> & { related_terms?: number[]; related_stories?: number[]; related_locations?: number[] }) => Promise<void>;
  deleteHeritageTask: (id: number) => Promise<void>;
  setHeritageTasksPage: (page: number) => void;
  fetchHeritageTaskFilters: () => Promise<void>;
  changeHeritageTaskStatus: (id: number, data: { to_status: string; comment?: string; rework_reason?: string; is_final_confirmation?: boolean; operated_by?: string; role?: string }) => Promise<void>;

  fetchStatistics: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_PAGINATION: PaginationState = { count: 0, total: 0, page: 1, pageSize: 20, totalPages: 1 };

function parsePagination(count: number, page: number, pageSize: number = 20): PaginationState {
  return { count, total: count, page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)) };
}

export const useStore = create<AppStore>((set, get) => ({
  terms: [],
  termsPagination: { ...DEFAULT_PAGINATION },
  currentTerm: null,
  pronunciations: [],
  pronunciationsPagination: { ...DEFAULT_PAGINATION },
  annotations: [],
  annotationsPagination: { ...DEFAULT_PAGINATION },
  versions: [],
  versionsPagination: { ...DEFAULT_PAGINATION },
  stories: [],
  storiesPagination: { ...DEFAULT_PAGINATION },
  currentStory: null,
  storyFilters: null,
  allTerms: [],
  allLocations: [],
  locations: [],
  locationsPagination: { ...DEFAULT_PAGINATION },
  currentLocation: null,
  locationFilters: null,
  heritageTasks: [],
  heritageTasksPagination: { ...DEFAULT_PAGINATION },
  currentHeritageTask: null,
  heritageTaskFilters: null,
  statistics: null,
  loading: false,
  error: null,

  fetchTerms: async (params, reset) => {
    set({ loading: true, error: null });
    try {
      const p = { ...params };
      if (!reset && !p.page) {
        p.page = String(get().termsPagination.page);
      } else if (reset) {
        p.page = '1';
      }
      const res = await api.terms.list(p);
      set({ terms: res.results, termsPagination: parsePagination(res.count, Number(p.page)), loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchTerm: async (id) => {
    set({ loading: true, error: null });
    try {
      const term = await api.terms.get(id);
      set({ currentTerm: term, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createTerm: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.terms.create(data);
      await get().fetchTerms(undefined, true);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateTerm: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.terms.update(id, data);
      await get().fetchTerms();
      if (get().currentTerm?.id === id) await get().fetchTerm(id);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteTerm: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.terms.delete(id);
      await get().fetchTerms();
      if (get().currentTerm?.id === id) set({ currentTerm: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setTermsPage: (page) => {
    set({ termsPagination: { ...get().termsPagination, page } });
  },

  fetchAllTerms: async () => {
    try {
      const res = await api.terms.list({ page_size: '200' });
      set({ allTerms: res.results });
    } catch (e: unknown) {
      console.error('Failed to fetch all terms:', e);
    }
  },

  fetchPronunciations: async (params, reset) => {
    set({ loading: true, error: null });
    try {
      const p = { ...params };
      if (!reset && !p.page) {
        p.page = String(get().pronunciationsPagination.page);
      } else if (reset) {
        p.page = '1';
      }
      const res = await api.pronunciations.list(p);
      set({ pronunciations: res.results, pronunciationsPagination: parsePagination(res.count, Number(p.page)), loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createPronunciation: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.pronunciations.create(data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchPronunciations();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updatePronunciation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.pronunciations.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchPronunciations();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deletePronunciation: async (id) => {
    set({ loading: true, error: null });
    try {
      const pro = get().pronunciations.find((p) => p.id === id);
      await api.pronunciations.delete(id);
      if (pro) await get().fetchTerm(pro.term);
      await get().fetchPronunciations();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setPronunciationsPage: (page) => {
    set({ pronunciationsPagination: { ...get().pronunciationsPagination, page } });
  },

  fetchAnnotations: async (params, reset) => {
    set({ loading: true, error: null });
    try {
      const p = { ...params };
      if (!reset && !p.page) {
        p.page = String(get().annotationsPagination.page);
      } else if (reset) {
        p.page = '1';
      }
      const res = await api.annotations.list(p);
      set({ annotations: res.results, annotationsPagination: parsePagination(res.count, Number(p.page)), loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createAnnotation: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.annotations.create(data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchAnnotations();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateAnnotation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.annotations.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchAnnotations();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteAnnotation: async (id) => {
    set({ loading: true, error: null });
    try {
      const ann = get().annotations.find((a) => a.id === id);
      await api.annotations.delete(id);
      if (ann) await get().fetchTerm(ann.term);
      await get().fetchAnnotations();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setAnnotationsPage: (page) => {
    set({ annotationsPagination: { ...get().annotationsPagination, page } });
  },

  fetchVersions: async (params, reset) => {
    set({ loading: true, error: null });
    try {
      const p = { ...params };
      if (!reset && !p.page) {
        p.page = String(get().versionsPagination.page);
      } else if (reset) {
        p.page = '1';
      }
      const res = await api.versions.list(p);
      set({ versions: res.results, versionsPagination: parsePagination(res.count, Number(p.page)), loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createVersion: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.versions.create(data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchVersions();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateVersion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.versions.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchVersions();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteVersion: async (id) => {
    set({ loading: true, error: null });
    try {
      const ver = get().versions.find((v) => v.id === id);
      await api.versions.delete(id);
      if (ver) await get().fetchTerm(ver.term);
      await get().fetchVersions();
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setVersionsPage: (page) => {
    set({ versionsPagination: { ...get().versionsPagination, page } });
  },

  fetchStories: async (params, reset) => {
    set({ loading: true, error: null });
    try {
      const p = { ...params };
      if (!reset && !p.page) {
        p.page = String(get().storiesPagination.page);
      } else if (reset) {
        p.page = '1';
      }
      const res = await api.stories.list(p);
      set({ stories: res.results, storiesPagination: parsePagination(res.count, Number(p.page)), loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchStory: async (id) => {
    set({ loading: true, error: null });
    try {
      const story = await api.stories.get(id);
      set({ currentStory: story, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createStory: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.stories.create(data);
      await get().fetchStories(undefined, true);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateStory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.stories.update(id, data);
      await get().fetchStories();
      if (get().currentStory?.id === id) await get().fetchStory(id);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteStory: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.stories.delete(id);
      await get().fetchStories();
      if (get().currentStory?.id === id) set({ currentStory: null });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setStoriesPage: (page) => {
    set({ storiesPagination: { ...get().storiesPagination, page } });
  },

  fetchStoryFilters: async () => {
    try {
      const filters = await api.stories.getFilters();
      set({ storyFilters: filters });
    } catch (e: unknown) {
      console.error('Failed to fetch story filters:', e);
    }
  },

  createStoryRevision: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.storyRevisions.create(data);
      if (data.story) await get().fetchStory(data.story);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchLocations: async (params, reset) => {
    set({ loading: true, error: null });
    try {
      const p = { ...params };
      if (!reset && !p.page) {
        p.page = String(get().locationsPagination.page);
      } else if (reset) {
        p.page = '1';
      }
      const res = await api.locations.list(p);
      set({ locations: res.results, locationsPagination: parsePagination(res.count, Number(p.page)), loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchLocation: async (id) => {
    set({ loading: true, error: null });
    try {
      const location = await api.locations.get(id);
      set({ currentLocation: location, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createLocation: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.locations.create(data);
      await get().fetchLocations(undefined, true);
      await get().fetchAllLocations();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateLocation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.locations.update(id, data);
      await get().fetchLocations();
      await get().fetchAllLocations();
      if (get().currentLocation?.id === id) await get().fetchLocation(id);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteLocation: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.locations.delete(id);
      await get().fetchLocations();
      await get().fetchAllLocations();
      if (get().currentLocation?.id === id) set({ currentLocation: null });
      set({ loading: false });
    } catch (e: unknown) {
      const errMsg = (e as Error).message;
      set({ error: errMsg, loading: false });
      throw e;
    }
  },

  setLocationsPage: (page) => {
    set({ locationsPagination: { ...get().locationsPagination, page } });
  },

  fetchLocationFilters: async () => {
    try {
      const filters = await api.locations.getFilters();
      set({ locationFilters: filters });
    } catch (e: unknown) {
      console.error('Failed to fetch location filters:', e);
    }
  },

  fetchAllLocations: async () => {
    try {
      const res = await api.locations.list({ page_size: '200' });
      set({ allLocations: res.results });
    } catch (e: unknown) {
      console.error('Failed to fetch all locations:', e);
    }
  },

  fetchHeritageTasks: async (params, reset) => {
    set({ loading: true, error: null });
    try {
      const p = { ...params };
      if (!reset && !p.page) {
        p.page = String(get().heritageTasksPagination.page);
      } else if (reset) {
        p.page = '1';
      }
      const res = await api.heritageTasks.list(p);
      set({ heritageTasks: res.results, heritageTasksPagination: parsePagination(res.count, Number(p.page)), loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchHeritageTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const task = await api.heritageTasks.get(id);
      set({ currentHeritageTask: task, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createHeritageTask: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.heritageTasks.create(data);
      await get().fetchHeritageTasks(undefined, true);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateHeritageTask: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.heritageTasks.update(id, data);
      await get().fetchHeritageTasks();
      if (get().currentHeritageTask?.id === id) await get().fetchHeritageTask(id);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteHeritageTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.heritageTasks.delete(id);
      await get().fetchHeritageTasks();
      if (get().currentHeritageTask?.id === id) set({ currentHeritageTask: null });
      set({ loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setHeritageTasksPage: (page) => {
    set({ heritageTasksPagination: { ...get().heritageTasksPagination, page } });
  },

  fetchHeritageTaskFilters: async () => {
    try {
      const filters = await api.heritageTasks.getFilters();
      set({ heritageTaskFilters: filters });
    } catch (e: unknown) {
      console.error('Failed to fetch heritage task filters:', e);
    }
  },

  changeHeritageTaskStatus: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const task = await api.heritageTasks.changeStatus(id, data);
      set({ currentHeritageTask: task, loading: false });
      await get().fetchHeritageTasks();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchStatistics: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await api.statistics.get();
      set({ statistics: stats, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
