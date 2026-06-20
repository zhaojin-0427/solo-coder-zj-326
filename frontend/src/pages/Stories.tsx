import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import type { Story } from '@/types';
import { ERA_OPTIONS, STORY_STATUS_MAP, STORY_STATUS_BADGE } from '@/types';
import Pagination from '@/components/Pagination';
import {
  Search,
  Plus,
  BookOpenText,
  Calendar,
  Tag,
  ChevronRight,
  X,
  User,
  MapPin,
  Link as LinkIcon,
  History,
  ScrollText,
  Sparkles,
} from 'lucide-react';

const EMPTY_FORM = {
  title: '',
  narrator: '',
  recorder: '',
  location: '',
  era: '',
  content: '',
  mandarin_summary: '',
  original_fragments: '',
  elder_revision_notes: '',
  family_members: '' as string,
  tags: '' as string,
  related_terms: [] as number[],
  locations: [] as number[],
  status: 'draft' as Story['status'],
  created_by: '',
};

export default function Stories() {
  const navigate = useNavigate();
  const {
    stories,
    storiesPagination,
    allTerms,
    allLocations,
    storyFilters,
    loading,
    fetchStories,
    setStoriesPage,
    fetchAllTerms,
    createStory,
    updateStory,
    deleteStory,
    fetchStoryFilters,
    fetchAllLocations,
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterNarrator, setFilterNarrator] = useState('');
  const [filterEra, setFilterEra] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [termSearch, setTermSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllTerms();
    fetchStoryFilters();
    fetchAllLocations();
  }, [fetchAllTerms, fetchStoryFilters, fetchAllLocations]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterNarrator) params.narrator = filterNarrator;
    if (filterEra) params.era = filterEra;
    if (filterStatus) params.status = filterStatus;
    if (filterTag) params.tag = filterTag;
    fetchStories(params, true);
  }, [search, filterNarrator, filterEra, filterStatus, filterTag, fetchStories]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const familyMembers = form.family_members
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = form.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      ...form,
      family_members: familyMembers,
      tags,
      related_terms: form.related_terms,
      locations: form.locations,
    };
    if (editingId) {
      await updateStory(editingId, payload);
    } else {
      await createStory(payload);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteStory(id);
    setDeleteConfirmId(null);
  };

  const openDetail = (id: number) => {
    navigate(`/stories/${id}`);
  };

  const toggleRelatedTerm = (termId: number) => {
    setForm((prev) => ({
      ...prev,
      related_terms: prev.related_terms.includes(termId)
        ? prev.related_terms.filter((id) => id !== termId)
        : [...prev.related_terms, termId],
    }));
  };

  const filteredTerms = allTerms.filter(
    (t) =>
      !termSearch ||
      t.word.includes(termSearch) ||
      t.meaning.includes(termSearch)
  );

  const selectedTerms = allTerms.filter((t) => form.related_terms.includes(t.id));

  const allTags = storyFilters?.tags ?? [];
  const allNarrators = storyFilters?.narrators ?? [];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="section-title mb-0">方言故事档案</h1>
          </div>
          <p className="text-ink-500 ml-[52px]">
            将零散方言词串联成家庭共同维护的口述故事，留住家族记忆
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreateForm}>
          <Plus className="w-4 h-4" />
          新建故事
        </button>
      </div>

      <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="搜索标题、正文、标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field w-auto min-w-[140px]"
            value={filterNarrator}
            onChange={(e) => setFilterNarrator(e.target.value)}
          >
            <option value="">全部讲述人</option>
            {allNarrators.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select
            className="input-field w-auto min-w-[140px]"
            value={filterEra}
            onChange={(e) => setFilterEra(e.target.value)}
          >
            <option value="">全部年代</option>
            {ERA_OPTIONS.map((era) => (
              <option key={era} value={era}>{era}</option>
            ))}
          </select>
          <select
            className="input-field w-auto min-w-[140px]"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">全部标签</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <select
            className="input-field w-auto min-w-[160px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            {Object.entries(STORY_STATUS_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && !stories.length ? (
        <div className="text-center py-20 text-ink-400">
          <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
          加载中...
        </div>
      ) : !stories.length ? (
        <div className="text-center py-20">
          <ScrollText className="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p className="text-ink-400">暂无故事档案</p>
          <p className="text-sm text-ink-300 mt-1">点击右上角"新建故事"开始记录</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="card card-hover cursor-pointer p-5 group"
                onClick={() => openDetail(story.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display text-xl text-ink-900 group-hover:text-ochre-500 transition-colors line-clamp-2 flex-1">
                    {story.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 shrink-0 ${STORY_STATUS_BADGE[story.status]}`}
                  >
                    {STORY_STATUS_MAP[story.status]}
                  </span>
                </div>
                <p className="text-sm text-ink-600 mb-3 line-clamp-3 leading-relaxed">{story.content}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {story.era && (
                    <span className="inline-flex items-center gap-1 text-xs bg-cream-200/60 text-ink-600 px-2 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {story.era}
                    </span>
                  )}
                  {story.location && (
                    <span className="inline-flex items-center gap-1 text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {story.location}
                    </span>
                  )}
                </div>
                {(story.tags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs bg-ochre-50 text-ochre-700 px-2 py-0.5 rounded-full">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {(story.tags?.length ?? 0) > 3 && (
                      <span className="text-xs text-ink-400">+{story.tags!.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-cream-200 pt-3">
                  <div className="flex items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {story.narrator || '匿名'}
                    </span>
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" />
                      {story.related_terms_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <History className="w-3.5 h-3.5" />
                      {story.revision_count ?? 0}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ochre-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={storiesPagination.page}
            pageSize={storiesPagination.pageSize}
            total={storiesPagination.total}
            onPageChange={setStoriesPage}
          />
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl text-ink-900">
                {editingId ? '编辑故事' : '新建故事档案'}
              </h2>
              <button className="p-1 rounded-lg hover:bg-cream-100 transition-colors" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">故事标题 *</label>
                <input
                  className="input-field"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="给这个故事起个名字"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">讲述人</label>
                  <input
                    className="input-field"
                    value={form.narrator}
                    onChange={(e) => setForm({ ...form, narrator: e.target.value })}
                    placeholder="故事是谁讲述的"
                  />
                </div>
                <div>
                  <label className="label-text">记录人</label>
                  <input
                    className="input-field"
                    value={form.recorder}
                    onChange={(e) => setForm({ ...form, recorder: e.target.value })}
                    placeholder="谁记录了这个故事"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">发生地点</label>
                  <input
                    className="input-field"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="故事发生在哪里"
                  />
                </div>
                <div>
                  <label className="label-text">年代背景</label>
                  <select
                    className="input-field"
                    value={form.era}
                    onChange={(e) => setForm({ ...form, era: e.target.value })}
                  >
                    <option value="">选择年代</option>
                    {ERA_OPTIONS.map((era) => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">关联家庭成员</label>
                <input
                  className="input-field"
                  value={form.family_members}
                  onChange={(e) => setForm({ ...form, family_members: e.target.value })}
                  placeholder="用逗号分隔，如：爷爷, 奶奶, 父亲"
                />
              </div>
              <div>
                <label className="label-text">故事标签</label>
                <input
                  className="input-field"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="用逗号分隔，如：童年回忆, 过年习俗"
                />
              </div>
              <div>
                <label className="label-text">故事正文 *</label>
                <textarea
                  className="input-field min-h-[180px] resize-y"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="用方言口述记录故事内容..."
                />
              </div>
              <div>
                <label className="label-text">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sage-600" />
                    普通话整理摘要 <span className="text-xs text-ink-400 font-normal">（晚辈填写）</span>
                  </span>
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-y"
                  value={form.mandarin_summary}
                  onChange={(e) => setForm({ ...form, mandarin_summary: e.target.value })}
                  placeholder="用普通话整理和概括故事要点"
                />
              </div>
              <div>
                <label className="label-text">
                  <span className="flex items-center gap-1.5">
                    <BookOpenText className="w-4 h-4 text-ochre-600" />
                    原话片段补充 <span className="text-xs text-ink-400 font-normal">（长辈填写）</span>
                  </span>
                </label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  value={form.original_fragments}
                  onChange={(e) => setForm({ ...form, original_fragments: e.target.value })}
                  placeholder="补充方言原话片段，保留原汁原味"
                />
              </div>
              <div>
                <label className="label-text">长辈修订意见</label>
                <textarea
                  className="input-field min-h-[60px] resize-y"
                  value={form.elder_revision_notes}
                  onChange={(e) => setForm({ ...form, elder_revision_notes: e.target.value })}
                  placeholder="长辈对故事内容的修订意见或补充说明"
                />
              </div>
              <div>
                <label className="label-text">关联方言词</label>
                <div className="bg-cream-50 rounded-lg border border-cream-200 p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="text"
                      className="input-field pl-10 !bg-white"
                      placeholder="搜索词条..."
                      value={termSearch}
                      onChange={(e) => setTermSearch(e.target.value)}
                    />
                  </div>
                  {selectedTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-cream-200">
                      {selectedTerms.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1 text-xs bg-ochre-100 text-ochre-700 px-2 py-1 rounded-full cursor-pointer hover:bg-ochre-200 transition-colors"
                          onClick={() => toggleRelatedTerm(t.id)}
                        >
                          {t.word}
                          <X className="w-3 h-3" />
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredTerms.length === 0 ? (
                      <p className="text-center text-sm text-ink-400 py-4">无匹配词条</p>
                    ) : (
                      filteredTerms.map((t) => {
                        const selected = form.related_terms.includes(t.id);
                        return (
                          <div
                            key={t.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              selected ? 'bg-ochre-50' : 'hover:bg-cream-100'
                            }`}
                            onClick={() => toggleRelatedTerm(t.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleRelatedTerm(t.id)}
                              className="w-4 h-4 accent-ochre-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ink-900">{t.word}</p>
                              <p className="text-xs text-ink-500 truncate">{t.meaning}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-ochre-500" />
                  关联地点
                </label>
                <div className="bg-cream-50 rounded-lg border border-cream-200 p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="text"
                      className="input-field pl-10 !bg-white"
                      placeholder="搜索地点..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                    />
                  </div>
                  {form.locations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-cream-200">
                      {allLocations.filter((l) => form.locations.includes(l.id)).map((l) => (
                        <span
                          key={l.id}
                          className="inline-flex items-center gap-1 text-xs bg-ochre-100 text-ochre-700 px-2 py-1 rounded-full cursor-pointer hover:bg-ochre-200 transition-colors"
                          onClick={() => setForm({ ...form, locations: form.locations.filter((id) => id !== l.id) })}
                        >
                          {l.name}
                          <X className="w-3 h-3" />
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {allLocations
                      .filter((l) => !locationSearch || l.name.includes(locationSearch) || l.region.includes(locationSearch))
                      .filter((l) => !form.locations.includes(l.id))
                      .map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-cream-100 transition-colors"
                          onClick={() => setForm({ ...form, locations: [...form.locations, l.id] })}
                        >
                          <MapPin className="w-3.5 h-3.5 text-ink-400" />
                          <span className="text-sm text-ink-900">{l.name}</span>
                          {l.region && <span className="text-xs text-ink-500">{l.region}</span>}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">整理状态</label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Story['status'] })}
                  >
                    {Object.entries(STORY_STATUS_MAP).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">创建人</label>
                  <input
                    className="input-field"
                    value={form.created_by}
                    onChange={(e) => setForm({ ...form, created_by: e.target.value })}
                    placeholder="创建人姓名"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200 sticky bottom-0 bg-white">
              <button className="btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.title || !form.content}>
                {loading ? '提交中...' : editingId ? '保存修改' : '创建故事'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-ink-900 mb-3">确认删除</h3>
            <p className="text-sm text-ink-600 mb-6">确定要删除这个故事档案吗？此操作不可恢复。</p>
            <div className="flex items-center justify-end gap-3">
              <button className="btn-outline" onClick={() => setDeleteConfirmId(null)}>取消</button>
              <button
                className="btn-primary !bg-red-500 hover:!bg-red-600"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
