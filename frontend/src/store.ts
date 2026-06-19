import { create } from 'zustand';
import type { Term, TermDetail, Pronunciation, Annotation, Version, Statistics } from '@/types';
import { api } from '@/api';

interface AppStore {
  terms: Term[];
  termsCount: number;
  currentTerm: TermDetail | null;
  pronunciations: Pronunciation[];
  annotations: Annotation[];
  versions: Version[];
  statistics: Statistics | null;
  loading: boolean;
  error: string | null;

  fetchTerms: (params?: Record<string, string>) => Promise<void>;
  fetchTerm: (id: number) => Promise<void>;
  createTerm: (data: Partial<Term>) => Promise<void>;
  updateTerm: (id: number, data: Partial<Term>) => Promise<void>;
  deleteTerm: (id: number) => Promise<void>;

  fetchPronunciations: (termId?: number) => Promise<void>;
  createPronunciation: (data: Partial<Pronunciation>) => Promise<void>;
  updatePronunciation: (id: number, data: Partial<Pronunciation>) => Promise<void>;
  deletePronunciation: (id: number) => Promise<void>;

  fetchAnnotations: (termId?: number) => Promise<void>;
  createAnnotation: (data: Partial<Annotation>) => Promise<void>;
  updateAnnotation: (id: number, data: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (id: number) => Promise<void>;

  fetchVersions: (termId?: number) => Promise<void>;
  createVersion: (data: Partial<Version>) => Promise<void>;
  updateVersion: (id: number, data: Partial<Version>) => Promise<void>;
  deleteVersion: (id: number) => Promise<void>;

  fetchStatistics: () => Promise<void>;

  clearError: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  terms: [],
  termsCount: 0,
  currentTerm: null,
  pronunciations: [],
  annotations: [],
  versions: [],
  statistics: null,
  loading: false,
  error: null,

  fetchTerms: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await api.terms.list(params);
      set({ terms: res.results, termsCount: res.count, loading: false });
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
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateTerm: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.terms.update(id, data);
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  deleteTerm: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.terms.delete(id);
      await get().fetchTerms();
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchPronunciations: async (termId) => {
    set({ loading: true, error: null });
    try {
      const params = termId ? { term: String(termId) } : undefined;
      const res = await api.pronunciations.list(params);
      set({ pronunciations: res.results, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createPronunciation: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.pronunciations.create(data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchPronunciations(data.term);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updatePronunciation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.pronunciations.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchPronunciations(data.term);
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
      await get().fetchPronunciations(pro?.term);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchAnnotations: async (termId) => {
    set({ loading: true, error: null });
    try {
      const params = termId ? { term: String(termId) } : undefined;
      const res = await api.annotations.list(params);
      set({ annotations: res.results, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createAnnotation: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.annotations.create(data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchAnnotations(data.term);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateAnnotation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.annotations.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchAnnotations(data.term);
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
      await get().fetchAnnotations(ann?.term);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchVersions: async (termId) => {
    set({ loading: true, error: null });
    try {
      const params = termId ? { term: String(termId) } : undefined;
      const res = await api.versions.list(params);
      set({ versions: res.results, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createVersion: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.versions.create(data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchVersions(data.term);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateVersion: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.versions.update(id, data);
      if (data.term) await get().fetchTerm(data.term);
      await get().fetchVersions(data.term);
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
      await get().fetchVersions(ver?.term);
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
