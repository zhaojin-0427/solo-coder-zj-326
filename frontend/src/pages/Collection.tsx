import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import type { Term } from '@/types';
import { ERA_OPTIONS, CATEGORY_OPTIONS, STATUS_MAP } from '@/types';
import Pagination from '@/components/Pagination';
import {
  Search,
  Plus,
  BookOpen,
  Mic,
  PenTool,
  Users,
  X,
  Calendar,
  Tag,
  ChevronRight,
} from 'lucide-react';

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  needs_revision: 'badge-revision',
};

const EMPTY_FORM = {
  word: '',
  pronunciation_placeholder: '',
  meaning: '',
  usage_scene: '',
  era: '',
  category: '',
  status: 'pending' as Term['status'],
  created_by: '',
};

export default function Collection() {
  const { terms, termsPagination, currentTerm, loading, fetchTerms, setTermsPage, fetchTerm, createTerm, updateTerm, deleteTerm } = useStore();

  const [search, setSearch] = useState('');
  const [filterEra, setFilterEra] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterEra) params.era = filterEra;
    if (filterCategory) params.category = filterCategory;
    if (filterStatus) params.status = filterStatus;
    fetchTerms(params, true);
  }, [search, filterEra, filterCategory, filterStatus, fetchTerms]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (term: Term) => {
    setEditingId(term.id);
    setForm({
      word: term.word,
      pronunciation_placeholder: term.pronunciation_placeholder,
      meaning: term.meaning,
      usage_scene: term.usage_scene,
      era: term.era,
      category: term.category,
      status: term.status,
      created_by: term.created_by,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateTerm(editingId, form);
    } else {
      await createTerm(form);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteTerm(id);
    setShowDetail(false);
  };

  const openDetail = async (id: number) => {
    await fetchTerm(id);
    setShowDetail(true);
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">词条采集</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openCreateForm}>
          <Plus className="w-4 h-4" />
          新增词条
        </button>
      </div>

      <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="搜索词条..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field w-auto min-w-[140px]" value={filterEra} onChange={(e) => setFilterEra(e.target.value)}>
            <option value="">全部年代</option>
            {ERA_OPTIONS.map((era) => (
              <option key={era} value={era}>{era}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[140px]" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">全部分类</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[140px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            {Object.entries(STATUS_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && !terms.length ? (
        <div className="text-center py-20 text-ink-400">
          <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
          加载中...
        </div>
      ) : !terms.length ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p className="text-ink-400">暂无词条数据</p>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {terms.map((term) => (
            <div
              key={term.id}
              className="card card-hover cursor-pointer p-5 group"
              onClick={() => openDetail(term.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-xl text-ink-900 group-hover:text-ochre-500 transition-colors">
                  {term.word}
                </h3>
                <span className={STATUS_BADGE_CLASS[term.status]}>
                  {STATUS_MAP[term.status]}
                </span>
              </div>
              <p className="text-sm text-ink-600 mb-3 line-clamp-2">{term.meaning}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-xs bg-cream-200/60 text-ink-600 px-2 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3" />
                  {term.era}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" />
                  {term.category}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-cream-200 pt-3">
                <div className="flex items-center gap-3 text-xs text-ink-400">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" />
                    {term.pronunciation_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5" />
                    {term.annotation_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {term.version_count ?? 0}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ochre-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <Pagination
          page={termsPagination.page}
          pageSize={termsPagination.pageSize}
          total={termsPagination.total}
          onPageChange={setTermsPage}
        />
      </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <h2 className="font-display text-xl text-ink-900">
                {editingId ? '编辑词条' : '新增词条'}
              </h2>
              <button className="p-1 rounded-lg hover:bg-cream-100 transition-colors" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">词条</label>
                <input className="input-field" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="输入方言词条" />
              </div>
              <div>
                <label className="label-text">发音标注</label>
                <input className="input-field" value={form.pronunciation_placeholder} onChange={(e) => setForm({ ...form, pronunciation_placeholder: e.target.value })} placeholder="标注发音方式" />
              </div>
              <div>
                <label className="label-text">释义</label>
                <textarea className="input-field min-h-[80px] resize-y" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="输入词条释义" />
              </div>
              <div>
                <label className="label-text">使用场景</label>
                <input className="input-field" value={form.usage_scene} onChange={(e) => setForm({ ...form, usage_scene: e.target.value })} placeholder="描述使用场景" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">年代</label>
                  <select className="input-field" value={form.era} onChange={(e) => setForm({ ...form, era: e.target.value })}>
                    <option value="">选择年代</option>
                    {ERA_OPTIONS.map((era) => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">分类</label>
                  <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">选择分类</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">状态</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Term['status'] })}>
                    {Object.entries(STATUS_MAP).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">采集人</label>
                  <input className="input-field" value={form.created_by} onChange={(e) => setForm({ ...form, created_by: e.target.value })} placeholder="采集人姓名" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200">
              <button className="btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? '提交中...' : editingId ? '保存修改' : '创建词条'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && currentTerm && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowDetail(false)}>
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-cream-200 p-6 flex items-center justify-between z-10">
              <h2 className="font-display text-2xl text-ink-900">{currentTerm.word}</h2>
              <button className="p-2 rounded-lg hover:bg-cream-100 transition-colors" onClick={() => setShowDetail(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className={STATUS_BADGE_CLASS[currentTerm.status]}>
                  {STATUS_MAP[currentTerm.status]}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-cream-200/60 text-ink-600 px-2.5 py-1 rounded-full">
                  <Calendar className="w-3 h-3" />
                  {currentTerm.era}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-sage-100 text-sage-700 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {currentTerm.category}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink-500 mb-1">发音标注</h4>
                <p className="text-ink-900">{currentTerm.pronunciation_placeholder || '暂无'}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink-500 mb-1">释义</h4>
                <p className="text-ink-900 leading-relaxed">{currentTerm.meaning}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink-500 mb-1">使用场景</h4>
                <p className="text-ink-900 leading-relaxed">{currentTerm.usage_scene || '暂无'}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-ochre-50 rounded-lg p-3 text-center">
                  <Mic className="w-5 h-5 text-ochre-500 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-ink-900">{currentTerm.pronunciation_count ?? 0}</p>
                  <p className="text-xs text-ink-500">发音</p>
                </div>
                <div className="bg-sage-50 rounded-lg p-3 text-center">
                  <PenTool className="w-5 h-5 text-sage-500 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-ink-900">{currentTerm.annotation_count ?? 0}</p>
                  <p className="text-xs text-ink-500">标注</p>
                </div>
                <div className="bg-cream-100 rounded-lg p-3 text-center">
                  <BookOpen className="w-5 h-5 text-cream-500 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-ink-900">{currentTerm.version_count ?? 0}</p>
                  <p className="text-xs text-ink-500">版本</p>
                </div>
              </div>

              {currentTerm.pronunciations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-2">发音记录</h4>
                  <div className="space-y-2">
                    {currentTerm.pronunciations.map((p) => (
                      <div key={p.id} className="bg-cream-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-ink-900">{p.phonetic_spelling || p.ipa_notation}</span>
                          <span className={p.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
                            {p.role === 'elder' ? '长辈' : '晚辈'}
                          </span>
                        </div>
                        {p.tone_description && <p className="text-xs text-ink-500">声调：{p.tone_description}</p>}
                        {p.notes && <p className="text-xs text-ink-400 mt-1">{p.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentTerm.annotations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-2">标注信息</h4>
                  <div className="space-y-2">
                    {currentTerm.annotations.map((a) => (
                      <div key={a.id} className="bg-sage-50/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-sage-600">{a.type}</span>
                          <span className={a.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
                            {a.role === 'elder' ? '长辈' : '晚辈'}
                          </span>
                        </div>
                        <p className="text-sm text-ink-900">{a.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-cream-200 pt-4 space-y-2 text-xs text-ink-400">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>采集人：{currentTerm.created_by || '未知'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>创建于：{new Date(currentTerm.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>更新于：{new Date(currentTerm.updated_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => {
                    setShowDetail(false);
                    openEditForm(currentTerm);
                  }}
                >
                  编辑词条
                </button>
                <button
                  className="btn-outline flex-1 !border-red-400 !text-red-500 hover:!bg-red-50"
                  onClick={() => handleDelete(currentTerm.id)}
                >
                  删除词条
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
