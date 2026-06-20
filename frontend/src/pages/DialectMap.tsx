import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store';
import type { Location } from '@/types';
import { ERA_OPTIONS, CATEGORY_OPTIONS } from '@/types';
import Pagination from '@/components/Pagination';
import {
  MapPin,
  Plus,
  X,
  Calendar,
  Users,
  BookOpen,
  ScrollText,
  Search,
  ChevronRight,
  Clock,
  Edit3,
  Trash2,
  AlertCircle,
  Navigation,
  History,
  Tag,
  User,
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  region: '',
  latitude: '' as string,
  longitude: '' as string,
  era_start: '',
  era_end: '',
  family_members: '' as string,
  description: '',
};

export default function DialectMap() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    locations,
    locationsPagination,
    currentLocation,
    allTerms,
    locationFilters,
    loading,
    error,
    fetchLocations,
    setLocationsPage,
    fetchLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    fetchLocationFilters,
    fetchAllTerms,
    fetchAllLocations,
    allLocations,
    clearError,
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterEra, setFilterEra] = useState('');
  const [filterFamilyMember, setFilterFamilyMember] = useState('');
  const [filterNarrator, setFilterNarrator] = useState('');
  const [filterTermCategory, setFilterTermCategory] = useState('');
  const [filterStoryTag, setFilterStoryTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'list'>('map');

  useEffect(() => {
    fetchLocationFilters();
    fetchAllTerms();
    fetchAllLocations();
  }, [fetchLocationFilters, fetchAllTerms, fetchAllLocations]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterRegion) params.region = filterRegion;
    if (filterEra) params.era = filterEra;
    if (filterFamilyMember) params.family_member = filterFamilyMember;
    if (filterNarrator) params.narrator = filterNarrator;
    if (filterTermCategory) params.term_category = filterTermCategory;
    if (filterStoryTag) params.story_tag = filterStoryTag;
    fetchLocations(params, true);
  }, [search, filterRegion, filterEra, filterFamilyMember, filterNarrator, filterTermCategory, filterStoryTag, fetchLocations]);

  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam && !showDetail) {
      const locId = parseInt(locationParam, 10);
      if (!isNaN(locId)) {
        openDetail(locId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) {
      setDeleteError(error);
      clearError();
    }
  }, [error, clearError]);

  const openDetail = async (id: number) => {
    await fetchLocation(id);
    setShowDetail(true);
    const params = new URLSearchParams(searchParams);
    params.set('location', String(id));
    setSearchParams(params, { replace: true });
  };

  const closeDetail = () => {
    setShowDetail(false);
    const params = new URLSearchParams(searchParams);
    params.delete('location');
    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (page: number) => {
    setLocationsPage(page);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterRegion) params.region = filterRegion;
    if (filterEra) params.era = filterEra;
    if (filterFamilyMember) params.family_member = filterFamilyMember;
    if (filterNarrator) params.narrator = filterNarrator;
    if (filterTermCategory) params.term_category = filterTermCategory;
    if (filterStoryTag) params.story_tag = filterStoryTag;
    params.page = String(page);
    fetchLocations(params, false);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (loc: Location) => {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      region: loc.region,
      latitude: loc.latitude != null ? String(loc.latitude) : '',
      longitude: loc.longitude != null ? String(loc.longitude) : '',
      era_start: loc.era_start,
      era_end: loc.era_end,
      family_members: (loc.family_members || []).join(', '),
      description: loc.description,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const familyMembers = form.family_members
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      name: form.name,
      region: form.region,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      era_start: form.era_start,
      era_end: form.era_end,
      family_members: familyMembers,
      description: form.description,
    };
    if (editingId) {
      await updateLocation(editingId, payload);
    } else {
      await createLocation(payload);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    setDeleteError('');
    try {
      await deleteLocation(id);
      setDeleteConfirmId(null);
      setDeleteError('');
      if (showDetail && currentLocation?.id === id) {
        closeDetail();
      }
    } catch (e: unknown) {
      const err = e as Error;
      let errorMsg = '删除失败，该地点仍有关联内容';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.detail) {
          errorMsg = parsed.detail;
          if (parsed.term_count != null && parsed.story_count != null) {
            errorMsg = `该地点仍关联 ${parsed.term_count} 个词条和 ${parsed.story_count} 个故事，无法删除`;
          }
        }
      } catch {
          errorMsg = err.message || '删除失败，该地点仍有关联内容';
        }
      setDeleteError(errorMsg);
    }
  };

  const filteredLocations = locations.length > 0 ? locations : allLocations;

  const activeFilters = { search, filterRegion, filterEra, filterFamilyMember, filterNarrator, filterTermCategory, filterStoryTag };

  const applyFiltersToList = (list: Location[]) => {
    return list.filter((loc) => {
      if (search && !loc.name.includes(search) && !loc.region?.includes(search) && !loc.description?.includes(search)) return false;
      if (filterRegion && loc.region !== filterRegion) return false;
      if (filterEra) {
        const matchEraStart = loc.era_start === filterEra;
        const matchEraEnd = loc.era_end === filterEra;
        const matchEraRange = loc.era_start && loc.era_end && loc.era_start <= filterEra && loc.era_end >= filterEra;
        if (!matchEraStart && !matchEraEnd && !matchEraRange) return false;
      }
      if (filterFamilyMember && !loc.family_members?.includes(filterFamilyMember)) return false;
      return true;
    });
  };

  const mapLocations = applyFiltersToList(
    allLocations.filter((loc) => loc.latitude != null && loc.longitude != null)
  );

  const timelineLocations = applyFiltersToList(
    allLocations
      .filter((loc) => loc.era_start || loc.era_end)
      .sort((a, b) => (a.era_start || '').localeCompare(b.era_start || '', 'zh-CN'))
  );

  const mapMinLat = mapLocations.length > 0 ? Math.min(...mapLocations.map((l) => l.latitude!)) - 2 : 20;
  const mapMaxLat = mapLocations.length > 0 ? Math.max(...mapLocations.map((l) => l.latitude!)) + 2 : 55;
  const mapMinLng = mapLocations.length > 0 ? Math.min(...mapLocations.map((l) => l.longitude!)) - 2 : 100;
  const mapMaxLng = mapLocations.length > 0 ? Math.max(...mapLocations.map((l) => l.longitude!)) + 2 : 135;

  const toSvgX = useCallback(
    (lng: number) => {
      const range = mapMaxLng - mapMinLng || 1;
      return ((lng - mapMinLng) / range) * 700 + 50;
    },
    [mapMinLng, mapMaxLng]
  );

  const toSvgY = useCallback(
    (lat: number) => {
      const range = mapMaxLat - mapMinLat || 1;
      return 450 - ((lat - mapMinLat) / range) * 400 + 25;
    },
    [mapMinLat, mapMaxLat]
  );

  const allRegions = locationFilters?.regions ?? [];
  const allEras = locationFilters?.eras ?? [];
  const allFamilyMembers = locationFilters?.family_members ?? [];
  const allNarrators = locationFilters?.narrators ?? [];
  const allTermCategories = locationFilters?.term_categories ?? [];
  const allStoryTags = locationFilters?.story_tags ?? [];

  const eraGroups: Record<string, Location[]> = {};
  timelineLocations.forEach((loc) => {
    const era = loc.era_start || loc.era_end || '未标注年代';
    if (!eraGroups[era]) eraGroups[era] = [];
    eraGroups[era].push(loc);
  });

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-ochre-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-ochre-600" />
            </div>
            <h1 className="section-title mb-0">方言迁徙地图</h1>
          </div>
          <p className="text-ink-500 ml-[52px]">
            按家庭地点与年代串联展示词条、语义注解和故事档案
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreateForm}>
          <Plus className="w-4 h-4" />
          新增地点
        </button>
      </div>

      <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="搜索地点名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field w-auto min-w-[140px]" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
            <option value="">全部地区</option>
            {allRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[140px]" value={filterEra} onChange={(e) => setFilterEra(e.target.value)}>
            <option value="">全部年代</option>
            {(allEras.length > 0 ? allEras : ERA_OPTIONS).map((era) => (
              <option key={era} value={era}>{era}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[140px]" value={filterFamilyMember} onChange={(e) => setFilterFamilyMember(e.target.value)}>
            <option value="">全部家庭成员</option>
            {allFamilyMembers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[140px]" value={filterNarrator} onChange={(e) => setFilterNarrator(e.target.value)}>
            <option value="">全部讲述人</option>
            {allNarrators.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[140px]" value={filterTermCategory} onChange={(e) => setFilterTermCategory(e.target.value)}>
            <option value="">全部词条分类</option>
            {(allTermCategories.length > 0 ? allTermCategories : CATEGORY_OPTIONS).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[140px]" value={filterStoryTag} onChange={(e) => setFilterStoryTag(e.target.value)}>
            <option value="">全部故事标签</option>
            {allStoryTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex bg-cream-100 rounded-lg p-1">
          {(['map', 'timeline', 'list'] as const).map((mode) => (
            <button
              key={mode}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-white text-ochre-500 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'map' ? '坐标视图' : mode === 'timeline' ? '年代时间轴' : '列表视图'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'map' && (
        <div className="card p-6 mb-6">
          <h3 className="section-title text-lg !mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-ochre-500" />
            地点坐标视图
          </h3>
          {mapLocations.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p className="text-ink-400">暂无带有坐标的地点</p>
              <p className="text-sm text-ink-300 mt-1">新增地点时填写经纬度即可在地图上显示</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <svg viewBox="0 0 800 500" className="w-full max-w-4xl mx-auto">
                <rect x="0" y="0" width="800" height="500" fill="#F9F5EB" rx="12" />
                {[0.25, 0.5, 0.75].map((pct) => (
                  <line
                    key={`hl-${pct}`}
                    x1="50"
                    y1={25 + pct * 450}
                    x2="750"
                    y2={25 + pct * 450}
                    stroke="#E8DFC8"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                  />
                ))}
                {[0.25, 0.5, 0.75].map((pct) => (
                  <line
                    key={`vl-${pct}`}
                    x1={50 + pct * 700}
                    y1="25"
                    x2={50 + pct * 700}
                    y2="475"
                    stroke="#E8DFC8"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                  />
                ))}
                {mapLocations.map((loc) => {
                  const x = toSvgX(loc.longitude!);
                  const y = toSvgY(loc.latitude!);
                  return (
                    <g key={loc.id} className="cursor-pointer" onClick={() => openDetail(loc.id)}>
                      <circle cx={x} cy={y} r="8" fill="#C8553D" opacity="0.2" />
                      <circle cx={x} cy={y} r="5" fill="#C8553D" stroke="#fff" strokeWidth="1.5" />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fill="#3D3D3D"
                        fontSize="11"
                        fontWeight="500"
                      >
                        {loc.name}
                      </text>
                      {(loc.term_count ?? 0) > 0 && (
                        <text
                          x={x}
                          y={y + 18}
                          textAnchor="middle"
                          fill="#6B6B6B"
                          fontSize="9"
                        >
                          {loc.term_count}词 · {loc.story_count}故事
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="card p-6 mb-6">
          <h3 className="section-title text-lg !mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ochre-500" />
            年代时间轴
          </h3>
          {Object.keys(eraGroups).length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p className="text-ink-400">暂无带有年代标注的地点</p>
            </div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-cream-200" />
              {Object.entries(eraGroups).map(([era, locs]) => (
                <div key={era} className="relative mb-8">
                  <div className="absolute -left-5 top-3 w-5 h-5 rounded-full border-2 border-ochre-300 bg-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-ochre-500" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ochre-600 mb-3">{era}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-2">
                      {locs.map((loc) => (
                        <div
                          key={loc.id}
                          className="bg-cream-50 rounded-lg p-4 border border-cream-200 cursor-pointer hover:border-ochre-300 hover:shadow-sm transition-all"
                          onClick={() => openDetail(loc.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-ink-900 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-ochre-500" />
                              {loc.name}
                            </h5>
                            <ChevronRight className="w-4 h-4 text-ink-300" />
                          </div>
                          {loc.region && (
                            <p className="text-xs text-ink-500 mb-1">{loc.region}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-ink-400">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {loc.term_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <ScrollText className="w-3 h-3" />
                              {loc.story_count ?? 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <>
          {loading && !locations.length ? (
            <div className="text-center py-20 text-ink-400">
              <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
              加载中...
            </div>
          ) : !locations.length ? (
            <div className="text-center py-20">
              <MapPin className="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p className="text-ink-400">暂无地点数据</p>
              <p className="text-sm text-ink-300 mt-1">点击右上角"新增地点"开始录入</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="card card-hover cursor-pointer p-5 group"
                    onClick={() => openDetail(loc.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-xl text-ink-900 group-hover:text-ochre-500 transition-colors flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-ochre-500 shrink-0" />
                        {loc.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ochre-500 transition-colors shrink-0 mt-1" />
                    </div>
                    {loc.region && (
                      <p className="text-sm text-ink-500 mb-2">{loc.region}</p>
                    )}
                    {loc.description && (
                      <p className="text-sm text-ink-600 mb-3 line-clamp-2">{loc.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {loc.era_start && (
                        <span className="inline-flex items-center gap-1 text-xs bg-cream-200/60 text-ink-600 px-2 py-0.5 rounded-full">
                          <Calendar className="w-3 h-3" />
                          {loc.era_start}{loc.era_end && loc.era_end !== loc.era_start ? ` - ${loc.era_end}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-cream-200 pt-3">
                      <div className="flex items-center gap-3 text-xs text-ink-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {loc.term_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ScrollText className="w-3.5 h-3.5" />
                          {loc.story_count ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1 rounded hover:bg-cream-100 transition-colors"
                          onClick={(e) => { e.stopPropagation(); openEditForm(loc); }}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-ink-400 hover:text-ochre-500" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-cream-100 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(loc.id); setDeleteError(''); }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-ink-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={locationsPagination.page}
                pageSize={locationsPagination.pageSize}
                total={locationsPagination.total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl text-ink-900">
                {editingId ? '编辑地点' : '新增地点'}
              </h2>
              <button className="p-1 rounded-lg hover:bg-cream-100 transition-colors" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">地点名称 *</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="输入地点名称" />
              </div>
              <div>
                <label className="label-text">所属地区</label>
                <input className="input-field" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="如：湖南省邵阳市" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">经度（占位）</label>
                <input className="input-field" type="number" step="0.001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="如：27.239" />
                </div>
                <div>
                  <label className="label-text">纬度（占位）</label>
                <input className="input-field" type="number" step="0.001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="如：111.468" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">起始年代</label>
                  <select className="input-field" value={form.era_start} onChange={(e) => setForm({ ...form, era_start: e.target.value })}>
                    <option value="">选择年代</option>
                    {ERA_OPTIONS.map((era) => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">结束年代</label>
                  <select className="input-field" value={form.era_end} onChange={(e) => setForm({ ...form, era_end: e.target.value })}>
                    <option value="">选择年代</option>
                    {ERA_OPTIONS.map((era) => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">关联家庭成员</label>
                <input className="input-field" value={form.family_members} onChange={(e) => setForm({ ...form, family_members: e.target.value })} placeholder="用逗号分隔，如：爷爷, 奶奶" />
              </div>
              <div>
                <label className="label-text">地点说明</label>
                <textarea className="input-field min-h-[80px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="描述该地点与家庭的关系..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200 sticky bottom-0 bg-white">
              <button className="btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.name}>
                {loading ? '提交中...' : editingId ? '保存修改' : '创建地点'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && currentLocation && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={closeDetail}>
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-cream-200 p-6 flex items-center justify-between z-10">
              <h2 className="font-display text-2xl text-ink-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-ochre-500" />
                {currentLocation.name}
              </h2>
              <button className="p-2 rounded-lg hover:bg-cream-100 transition-colors" onClick={closeDetail}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {currentLocation.region && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-1">所属地区</h4>
                  <p className="text-ink-900">{currentLocation.region}</p>
                </div>
              )}

              {(currentLocation.era_start || currentLocation.era_end) && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    年代范围
                  </h4>
                  <p className="text-ink-900">
                    {currentLocation.era_start || '?'} - {currentLocation.era_end || '?'}
                  </p>
                </div>
              )}

              {currentLocation.description && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-1">地点说明</h4>
                  <p className="text-ink-900 leading-relaxed">{currentLocation.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-ochre-50 rounded-lg p-3 text-center">
                  <BookOpen className="w-5 h-5 text-ochre-500 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-ink-900">{currentLocation.term_count ?? 0}</p>
                  <p className="text-xs text-ink-500">关联词条</p>
                </div>
                <div className="bg-sage-50 rounded-lg p-3 text-center">
                  <ScrollText className="w-5 h-5 text-sage-500 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-ink-900">{currentLocation.story_count ?? 0}</p>
                  <p className="text-xs text-ink-500">关联故事</p>
                </div>
              </div>

              {currentLocation.top_terms && currentLocation.top_terms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    高频词条
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentLocation.top_terms.map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 text-xs bg-ochre-50 text-ochre-700 px-2.5 py-1 rounded-full cursor-pointer hover:bg-ochre-100 transition-colors"
                        onClick={() => { closeDetail(); navigate(`/collection?term=${t.id}`); }}
                      >
                        {t.word}
                        <Tag className="w-3 h-3 text-ochre-400" />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentLocation.representative_story && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-2 flex items-center gap-1.5">
                    <ScrollText className="w-4 h-4" />
                    代表故事
                  </h4>
                  <div
                    className="bg-cream-50 rounded-lg p-3 cursor-pointer hover:bg-cream-100 transition-colors"
                    onClick={() => { closeDetail(); navigate(`/stories/${currentLocation.representative_story!.id}`); }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-900">{currentLocation.representative_story.title}</span>
                      <ChevronRight className="w-4 h-4 text-ink-300" />
                    </div>
                    {(currentLocation.representative_story.era || currentLocation.representative_story.narrator) && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-ink-500">
                        {currentLocation.representative_story.era && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {currentLocation.representative_story.era}
                          </span>
                        )}
                        {currentLocation.representative_story.narrator && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {currentLocation.representative_story.narrator}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentLocation.related_family_members && currentLocation.related_family_members.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    相关家庭成员
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentLocation.related_family_members.map((m) => (
                      <span key={m} className="text-sm bg-sage-50 text-sage-700 px-2.5 py-1 rounded-full">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentLocation.recent_revisions && currentLocation.recent_revisions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-2 flex items-center gap-1.5">
                    <History className="w-4 h-4" />
                    最近修订
                  </h4>
                  <div className="space-y-2">
                    {currentLocation.recent_revisions.map((r) => (
                      <div key={r.id} className="bg-cream-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-ink-900">{r.change_note}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-ink-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {r.contributed_by || '匿名'}
                          </span>
                          {r.created_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(r.created_at).toLocaleDateString('zh-CN')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-cream-200 pt-4 space-y-2 text-xs text-ink-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>创建于：{new Date(currentLocation.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>更新于：{new Date(currentLocation.updated_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => {
                    closeDetail();
                    openEditForm(currentLocation);
                  }}
                >
                  编辑地点
                </button>
                <button
                  className="btn-outline flex-1 !border-red-400 !text-red-500 hover:!bg-red-50"
                  onClick={() => {
                    setDeleteConfirmId(currentLocation.id);
                    setDeleteError('');
                  }}
                >
                  删除地点
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => { setDeleteConfirmId(null); setDeleteError(''); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-display text-lg text-ink-900">确认删除地点</h3>
            </div>
            {deleteError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            ) : (
              <p className="text-sm text-ink-600 mb-6">确定要删除这个地点吗？如果该地点仍有关联的词条或故事，将无法删除。</p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button className="btn-outline" onClick={() => { setDeleteConfirmId(null); setDeleteError(''); }}>取消</button>
              {!deleteError && (
                <button
                  className="btn-primary !bg-red-500 hover:!bg-red-600"
                  onClick={() => handleDelete(deleteConfirmId)}
                >
                  删除
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
