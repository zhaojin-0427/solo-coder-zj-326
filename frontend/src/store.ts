import { create } from 'zustand';
import type { Term, TermDetail, Pronunciation, Annotation, Version, Statistics, Story, StoryDetail, StoryRevision, StoryFilters } from '@/types';
import { api } from '@/api';

const DEFAULT_PAGE_SIZE = 10;

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface AppStore {
  terms: Term[];
  termsPagination: PaginationState;
  termsFilterParams: Record<string, string>;
  allTerms: Term[];
  currentTerm: TermDetail | null;

  pronunciations: Pronunciation[];
  pronunciationsPagination: PaginationState;
  pronunciationsFilterParams: Record<string, string>;

  annotations: Annotation[];
  annotationsPagination: PaginationState;
  annotationsFilterParams: Record<string, string>;

  versions: Version[];
  versionsPagination: PaginationState;
  versionsFilterParams: Record<string, string>;

  stories: Story[];
  storiesPagination: PaginationState;
  storiesFilterParams: Record<string, string>;
  currentStory: StoryDetail | null;
  storyFilters: StoryFilters | null;

  storyRevisions: StoryRevision[];
  storyRevisionsPagination: PaginationState;

  statistics: Statistics | null;
  loading: boolean;
  error: string | null;

  fetchTerms: (params?: Record<string, string>, resetPage?: boolean) => Promise<void>;
  setTermsPage: (page: number) => Promise<void>;
  fetchAllTerms: () => Promise<void>;
  fetchTerm: (id: number) => Promise<void>;
  createTerm: (data: Partial<Term>) => Promise<void>;
  updateTerm: (id: number, data: Partial<Term>) => Promise<void>;
  deleteTerm: (id: number) => Promise<void>;

  fetchPronunciations: (params?: Record<string, string>, resetPage?: boolean) => Promise<void>;
  setPronunciationsPage: (page: number) => Promise<void>;
  createPronunciation: (data: Partial<Pronunciation>) => Promise<void>;
  updatePronunciation: (id: number, data: Partial<Pronunciation>) => Promise<void>;
  deletePronunciation: (id: number) => Promise<void>;

  fetchAnnotations: (params?: Record<string, string>, resetPage?: boolean) => Promise<void>;
  setAnnotationsPage: (page: number) => Promise<void>;
  createAnnotation: (data: Partial<Annotation>) => Promise<void>;
  updateAnnotation: (id: number, data: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (id: number) => Promise<void>;

  fetchVersions: (params?: Record<string, string>, resetPage?: boolean) => Promise<void>;
  setVersionsPage: (page: number) => Promise<void>;
  createVersion: (data: Partial<Version>) => Promise<void>;
  updateVersion: (id: number, data: Partial<Version>) => Promise<void>;
  deleteVersion: (id: number) => Promise<void>;

  fetchStories: (params?: Record<string, string>, resetPage?: boolean) => Promise<void>;
  setStoriesPage: (page: number) => Promise<void>;
  fetchStory: (id: number) => Promise<void>;
  createStory: (data: Partial<Story> & { related_terms?: number[] }) => Promise<void>;
  updateStory: (id: number, data: Partial<Story> & { related_terms?: number[] }) => Promise<void>;
  deleteStory: (id: number) => Promise<void>;
  fetchStoryFilters: () => Promise<void>;

  createStoryRevision: (data: Partial<StoryRevision>) => Promise<void>;
  fetchStoryRevisions: (storyId: number) => Promise<void>;

  fetchStatistics: () => Promise<void>;

  clearError: () => void;
}

function buildParamsWithPagination(
  baseParams: Record<string, string> | undefined,
  page: number,
  pageSize: number
): Record<string, string> {
  const params: Record<string, string> = { ...baseParams };
  params.page = String(page);
  params.page_size = String(pageSize);
  return params;
}

export const useStore = create<AppStore>((set, get) => ({
  terms: [],
  termsPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
  termsFilterParams: {},
  allTerms: [],
  currentTerm: null,

  pronunciations: [],
  pronunciationsPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
  pronunciationsFilterParams: {},

  annotations: [],
  annotationsPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
  annotationsFilterParams: {},

  versions: [],
  versionsPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
  versionsFilterParams: {},

  stories: [],
  storiesPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
  storiesFilterParams: {},
  currentStory: null,
  storyFilters: null,

  storyRevisions: [],
  storyRevisionsPagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },

  statistics: null,
  loading: false,
  error: null,

  fetchTerms: async (params, resetPage = true) => {
    set({ loading: true, error: null });
    try {
      const filterParams = params ?? get().termsFilterParams;
      const { page, pageSize } = get().termsPagination;
      const currentPage = resetPage ? 1 : page;
      const queryParams = buildParamsWithPagination(filterParams, currentPage, pageSize);
      const res = await api.terms.list(queryParams);
      set({
        terms: res.results,
        termsPagination: { page: currentPage, pageSize, total: res.count },
        termsFilterParams: filterParams,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setTermsPage: async (page: number) => {
    set({ loading: true, error: null });
    try {
      const { termsFilterParams, termsPagination } = get();
      const queryParams = buildParamsWithPagination(termsFilterParams, page, termsPagination.pageSize);
      const res = await api.terms.list(queryParams);
      set({
        terms: res.results,
        termsPagination: { ...termsPagination, page, total: res.count },
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchAllTerms: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.terms.list({ page_size: '1000' });
      set({ allTerms: res.results, loading: false });
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
      const { termsFilterParams, termsPagination } = get();
      await get().fetchTerms(termsFilterParams, false);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateTerm: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.terms.update(id, data);
      const { termsFilterParams, termsPagination } = get();
      await get().fetchTerms(termsFilterParams, false);
      if (get().currentTerm?.id === id) {
        await get().fetchTerm(id);
      }
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteTerm: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.terms.delete(id);
      const { termsFilterParams, termsPagination } = get();
      let { page } = termsPagination;
      const queryParams = buildParamsWithPagination(termsFilterParams, page, termsPagination.pageSize);
      const res = await api.terms.list(queryParams);
      if (res.results.length === 0 && page > 1) {
        page -= 1;
        const prevParams = buildParamsWithPagination(termsFilterParams, page, termsPagination.pageSize);
        const prevRes = await api.terms.list(prevParams);
        set({
          terms: prevRes.results,
          termsPagination: { ...termsPagination, page, total: prevRes.count },
          loading: false,
        });
      } else {
        set({
          terms: res.results,
          termsPagination: { ...termsPagination, total: res.count },
          loading: false,
        });
      }
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchPronunciations: async (params, resetPage = true) => {
    set({ loading: true, error: null });
    try {
      const filterParams = params ?? get().pronunciationsFilterParams;
      const { page, pageSize } = get().pronunciationsPagination;
      const currentPage = resetPage ? 1 : page;
      const queryParams = buildParamsWithPagination(filterParams, currentPage, pageSize);
      const res = await api.pronunciations.list(queryParams);
      set({
        pronunciations: res.results,
        pronunciationsPagination: { page: currentPage, pageSize, total: res.count },
        pronunciationsFilterParams: filterParams,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setPronunciationsPage: async (page: number) => {
    set({ loading: true, error: null });
    try {
      const { pronunciationsFilterParams, pronunciationsPagination } = get();
      const queryParams = buildParamsWithPagination(pronunciationsFilterParams, page, pronunciationsPagination.pageSize);
      const res = await api.pronunciations.list(queryParams);
      set({
        pronunciations: res.results,
        pronunciationsPagination: { ...pronunciationsPagination, page, total: res.count },
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createPronunciation: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.pronunciations.create(data);
      if (data.term) await get().fetchTerm(data.term);
      const { pronunciationsFilterParams, pronunciationsPagination } = get();
      await get().fetchPronunciations(pronunciationsFilterParams, false);
      await get().fetchTerms(get().termsFilterParams, false);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updatePronunciation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.pronunciations.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      const { pronunciationsFilterParams, pronunciationsPagination } = get();
      await get().fetchPronunciations(pronunciationsFilterParams, false);
      await get().fetchTerms(get().termsFilterParams, false);
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
      const { pronunciationsFilterParams, pronunciationsPagination } = get();
      let { page } = pronunciationsPagination;
      const queryParams = buildParamsWithPagination(pronunciationsFilterParams, page, pronunciationsPagination.pageSize);
      const res = await api.pronunciations.list(queryParams);
      if (res.results.length === 0 && page > 1) {
        page -= 1;
        const prevParams = buildParamsWithPagination(pronunciationsFilterParams, page, pronunciationsPagination.pageSize);
        const prevRes = await api.pronunciations.list(prevParams);
        set({
          pronunciations: prevRes.results,
          pronunciationsPagination: { ...pronunciationsPagination, page, total: prevRes.count },
          loading: false,
        });
      } else {
        set({
          pronunciations: res.results,
          pronunciationsPagination: { ...pronunciationsPagination, total: res.count },
          loading: false,
        });
      }
      await get().fetchTerms(get().termsFilterParams, false);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchAnnotations: async (params, resetPage = true) => {
    set({ loading: true, error: null });
    try {
      const filterParams = params ?? get().annotationsFilterParams;
      const { page, pageSize } = get().annotationsPagination;
      const currentPage = resetPage ? 1 : page;
      const queryParams = buildParamsWithPagination(filterParams, currentPage, pageSize);
      const res = await api.annotations.list(queryParams);
      set({
        annotations: res.results,
        annotationsPagination: { page: currentPage, pageSize, total: res.count },
        annotationsFilterParams: filterParams,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setAnnotationsPage: async (page: number) => {
    set({ loading: true, error: null });
    try {
      const { annotationsFilterParams, annotationsPagination } = get();
      const queryParams = buildParamsWithPagination(annotationsFilterParams, page, annotationsPagination.pageSize);
      const res = await api.annotations.list(queryParams);
      set({
        annotations: res.results,
        annotationsPagination: { ...annotationsPagination, page, total: res.count },
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createAnnotation: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.annotations.create(data);
      if (data.term) await get().fetchTerm(data.term);
      const { annotationsFilterParams, annotationsPagination } = get();
      await get().fetchAnnotations(annotationsFilterParams, false);
      await get().fetchTerms(get().termsFilterParams, false);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateAnnotation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.annotations.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      const { annotationsFilterParams, annotationsPagination } = get();
      await get().fetchAnnotations(annotationsFilterParams, false);
      await get().fetchTerms(get().termsFilterParams, false);
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
      const { annotationsFilterParams, annotationsPagination } = get();
      let { page } = annotationsPagination;
      const queryParams = buildParamsWithPagination(annotationsFilterParams, page, annotationsPagination.pageSize);
      const res = await api.annotations.list(queryParams);
      if (res.results.length === 0 && page > 1) {
        page -= 1;
        const prevParams = buildParamsWithPagination(annotationsFilterParams, page, annotationsPagination.pageSize);
        const prevRes = await api.annotations.list(prevParams);
        set({
          annotations: prevRes.results,
          annotationsPagination: { ...annotationsPagination, page, total: prevRes.count },
          loading: false,
        });
      } else {
        set({
          annotations: res.results,
          annotationsPagination: { ...annotationsPagination, total: res.count },
          loading: false,
        });
      }
      await get().fetchTerms(get().termsFilterParams, false);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchVersions: async (params, resetPage = true) => {
    set({ loading: true, error: null });
    try {
      const filterParams = params ?? get().versionsFilterParams;
      const { page, pageSize } = get().versionsPagination;
      const currentPage = resetPage ? 1 : page;
      const queryParams = buildParamsWithPagination(filterParams, currentPage, pageSize);
      const res = await api.versions.list(queryParams);
      set({
        versions: res.results,
        versionsPagination: { page: currentPage, pageSize, total: res.count },
        versionsFilterParams: filterParams,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setVersionsPage: async (page: number) => {
    set({ loading: true, error: null });
    try {
      const { versionsFilterParams, versionsPagination } = get();
      const queryParams = buildParamsWithPagination(versionsFilterParams, page, versionsPagination.pageSize);
      const res = await api.versions.list(queryParams);
      set({
        versions: res.results,
        versionsPagination: { ...versionsPagination, page, total: res.count },
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createVersion: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.versions.create(data);
      if (data.term) await get().fetchTerm(data.term);
      const { versionsFilterParams, versionsPagination } = get();
      await get().fetchVersions(versionsFilterParams, false);
      await get().fetchTerms(get().termsFilterParams, false);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateVersion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.versions.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      const { versionsFilterParams, versionsPagination } = get();
      await get().fetchVersions(versionsFilterParams, false);
      await get().fetchTerms(get().termsFilterParams, false);
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
      const { versionsFilterParams, versionsPagination } = get();
      let { page } = versionsPagination;
      const queryParams = buildParamsWithPagination(versionsFilterParams, page, versionsPagination.pageSize);
      const res = await api.versions.list(queryParams);
      if (res.results.length === 0 && page > 1) {
        page -= 1;
        const prevParams = buildParamsWithPagination(versionsFilterParams, page, versionsPagination.pageSize);
        const prevRes = await api.versions.list(prevParams);
        set({
          versions: prevRes.results,
          versionsPagination: { ...versionsPagination, page, total: prevRes.count },
          loading: false,
        });
      } else {
        set({
          versions: res.results,
          versionsPagination: { ...versionsPagination, total: res.count },
          loading: false,
        });
      }
      await get().fetchTerms(get().termsFilterParams, false);
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

  fetchStories: async (params, resetPage = true) => {
    set({ loading: true, error: null });
    try {
      const filterParams = params ?? get().storiesFilterParams;
      const { page, pageSize } = get().storiesPagination;
      const currentPage = resetPage ? 1 : page;
      const queryParams = buildParamsWithPagination(filterParams, currentPage, pageSize);
      const res = await api.stories.list(queryParams);
      set({
        stories: res.results,
        storiesPagination: { page: currentPage, pageSize, total: res.count },
        storiesFilterParams: filterParams,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setStoriesPage: async (page: number) => {
    set({ loading: true, error: null });
    try {
      const { storiesFilterParams, storiesPagination } = get();
      const queryParams = buildParamsWithPagination(storiesFilterParams, page, storiesPagination.pageSize);
      const res = await api.stories.list(queryParams);
      set({
        stories: res.results,
        storiesPagination: { ...storiesPagination, page, total: res.count },
        loading: false,
      });
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
      const { storiesFilterParams } = get();
      await get().fetchStories(storiesFilterParams, false);
      await get().fetchStoryFilters();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateStory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.stories.update(id, data);
      const { storiesFilterParams } = get();
      await get().fetchStories(storiesFilterParams, false);
      await get().fetchStoryFilters();
      if (get().currentStory?.id === id) {
        await get().fetchStory(id);
      }
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteStory: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.stories.delete(id);
      const { storiesFilterParams, storiesPagination } = get();
      let { page } = storiesPagination;
      const queryParams = buildParamsWithPagination(storiesFilterParams, page, storiesPagination.pageSize);
      const res = await api.stories.list(queryParams);
      if (res.results.length === 0 && page > 1) {
        page -= 1;
        const prevParams = buildParamsWithPagination(storiesFilterParams, page, storiesPagination.pageSize);
        const prevRes = await api.stories.list(prevParams);
        set({
          stories: prevRes.results,
          storiesPagination: { ...storiesPagination, page, total: prevRes.count },
          loading: false,
        });
      } else {
        set({
          stories: res.results,
          storiesPagination: { ...storiesPagination, total: res.count },
          loading: false,
        });
      }
      await get().fetchStoryFilters();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchStoryFilters: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.stories.getFilters();
      set({
        storyFilters: res,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createStoryRevision: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.storyRevisions.create(data);
      if (data.story) await get().fetchStory(data.story);
      set({ loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchStoryRevisions: async (storyId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.storyRevisions.list({ story: String(storyId), page_size: '1000' });
      set({ storyRevisions: res.results, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
