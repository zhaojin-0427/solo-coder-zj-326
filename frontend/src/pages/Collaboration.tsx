import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import type { Term, Version } from '@/types';
import { STATUS_MAP, ROLE_MAP } from '@/types';
import {
  Users,
  Plus,
  Check,
  AlertCircle,
  Clock,
  Star,
  Edit3,
  Trash2,
  ChevronRight,
  User,
  X,
  RefreshCw,
} from 'lucide-react';

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  needs_revision: 'badge-revision',
};

const EMPTY_VERSION_FORM = {
  term: 0,
  interpretation: '',
  scope: '',
  is_common: false,
  contributed_by: '',
  role: 'elder' as Version['role'],
};

type ViewMode = 'collaboration' | 'all';

export default function Collaboration() {
  const {
    terms,
    currentTerm,
    versions,
    loading,
    fetchTerms,
    fetchTerm,
    fetchVersions,
    createVersion,
    updateVersion,
    deleteVersion,
    updateTerm,
  } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>('collaboration');
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [versionForm, setVersionForm] = useState(EMPTY_VERSION_FORM);
  const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
  const [statusConfirmId, setStatusConfirmId] = useState<number | null>(null);
  const [statusConfirmValue, setStatusConfirmValue] = useState<Term['status'] | null>(null);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  useEffect(() => {
    if (selectedTermId) {
      fetchTerm(selectedTermId);
      fetchVersions(selectedTermId);
    }
  }, [selectedTermId, fetchTerm, fetchVersions]);

  const collaborationTerms = terms.filter((t) => (t.version_count ?? 0) > 0);

  const contributorMap = versions.reduce<Map<string, { role: Version['role']; count: number }>>((acc, v) => {
    const name = v.contributed_by || '匿名';
    if (!acc.has(name)) {
      acc.set(name, { role: v.role, count: 0 });
    }
    acc.get(name)!.count += 1;
    return acc;
  }, new Map());

  const contributors = Array.from(contributorMap.entries())
    .map(([name, info]) => ({ name, ...info }))
    .sort((a, b) => b.count - a.count);

  const handleSelectTerm = (id: number) => {
    setSelectedTermId(id);
    setShowDetail(true);
  };

  const handleOpenVersionForm = () => {
    setEditingVersionId(null);
    setVersionForm({
      ...EMPTY_VERSION_FORM,
      term: selectedTermId ?? 0,
    });
    setShowVersionForm(true);
  };

  const handleEditVersion = (v: Version) => {
    setEditingVersionId(v.id);
    setVersionForm({
      term: v.term,
      interpretation: v.interpretation,
      scope: v.scope,
      is_common: v.is_common,
      contributed_by: v.contributed_by,
      role: v.role,
    });
    setShowVersionForm(true);
  };

  const handleSubmitVersion = async () => {
    if (editingVersionId) {
      await updateVersion(editingVersionId, versionForm);
    } else {
      await createVersion(versionForm);
    }
    setShowVersionForm(false);
    setVersionForm(EMPTY_VERSION_FORM);
    setEditingVersionId(null);
  };

  const handleDeleteVersion = async (id: number) => {
    await deleteVersion(id);
  };

  const handleToggleCommon = async (v: Version) => {
    await updateVersion(v.id, { ...v, is_common: !v.is_common });
  };

  const handleStatusChange = (termId: number, newStatus: Term['status']) => {
    setStatusConfirmId(termId);
    setStatusConfirmValue(newStatus);
  };

  const confirmStatusChange = async () => {
    if (statusConfirmId && statusConfirmValue) {
      await updateTerm(statusConfirmId, { status: statusConfirmValue });
    }
    setStatusConfirmId(null);
    setStatusConfirmValue(null);
  };

  const displayTerms = viewMode === 'collaboration' ? collaborationTerms : terms;

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-ochre-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-ochre-500" />
          </div>
          <h1 className="section-title mb-0">家庭共编</h1>
        </div>
        <p className="text-ink-500 ml-[52px]">
          长辈与晚辈携手共编方言词典，记录每一个词条的多版本解读，让家庭记忆在代际间传递
        </p>
      </div>

      <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 bg-cream-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'collaboration'
                  ? 'bg-white text-ochre-600 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
              onClick={() => setViewMode('collaboration')}
            >
              共编词条
              <span className="ml-1.5 text-xs opacity-70">{collaborationTerms.length}</span>
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-ochre-600 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
              onClick={() => setViewMode('all')}
            >
              全部词条
              <span className="ml-1.5 text-xs opacity-70">{terms.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink-500">
              共 <span className="font-semibold text-ochre-500">{displayTerms.length}</span> 个词条
            </p>
          </div>

          {loading && !terms.length ? (
            <div className="text-center py-20 text-ink-400">
              <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
              加载中...
            </div>
          ) : !displayTerms.length ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p className="text-ink-400">暂无共编词条</p>
              <p className="text-sm text-ink-300 mt-1">添加版本释义后，词条将出现在此</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayTerms.map((term) => (
                <div
                  key={term.id}
                  className={`card card-hover cursor-pointer p-5 group ${
                    selectedTermId === term.id ? 'ring-2 ring-ochre-500/50' : ''
                  }`}
                  onClick={() => handleSelectTerm(term.id)}
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
                  <div className="flex items-center justify-between border-t border-cream-200 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-ochre-100 text-ochre-700 px-2 py-0.5 rounded-full">
                        <Edit3 className="w-3 h-3" />
                        {term.version_count ?? 0} 版本
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ochre-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm overflow-hidden sticky top-8">
            <div className="px-5 py-4 border-b border-cream-200 bg-cream-50/50">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-ochre-500" />
                <h3 className="font-display text-base text-ink-900">贡献者</h3>
              </div>
            </div>
            {!contributors.length ? (
              <div className="p-5 text-center text-sm text-ink-400">
                选择词条后查看贡献者
              </div>
            ) : (
              <div className="divide-y divide-cream-200">
                {contributors.map((c) => (
                  <div key={c.name} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          c.role === 'elder'
                            ? 'bg-ochre-100 text-ochre-600'
                            : 'bg-sage-100 text-sage-600'
                        }`}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{c.name}</p>
                        <span className={c.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
                          {ROLE_MAP[c.role]}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-ochre-500">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetail && selectedTermId && currentTerm && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowDetail(false)}>
          <div
            className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-cream-200 p-6 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-2xl text-ink-900">{currentTerm.word}</h2>
                <button
                  className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
                  onClick={() => setShowDetail(false)}
                >
                  <X className="w-5 h-5 text-ink-400" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={STATUS_BADGE_CLASS[currentTerm.status]}>
                  {STATUS_MAP[currentTerm.status]}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-cream-200/60 text-ink-600 px-2.5 py-1 rounded-full">
                  <Edit3 className="w-3 h-3" />
                  {(currentTerm.version_count ?? 0)} 个版本
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-ink-500 mb-1">释义</h4>
                <p className="text-ink-900 leading-relaxed">{currentTerm.meaning}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-ink-500 mb-1">使用场景</h4>
                <p className="text-ink-900 leading-relaxed">{currentTerm.usage_scene || '暂无'}</p>
              </div>

              <div className="border-t border-cream-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-lg text-ink-900">版本时间线</h4>
                  <button
                    className="btn-primary flex items-center gap-1.5 text-sm !px-4 !py-2"
                    onClick={handleOpenVersionForm}
                  >
                    <Plus className="w-4 h-4" />
                    添加新版本
                  </button>
                </div>

                {!versions.length ? (
                  <div className="text-center py-10 text-ink-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-cream-400" />
                    <p className="text-sm">暂无版本记录</p>
                  </div>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-cream-200" />
                    <div className="space-y-4">
                      {versions.map((v) => (
                        <div key={v.id} className="relative">
                          <div className="absolute -left-3.5 top-3 w-5 h-5 rounded-full border-2 border-ochre-300 bg-white flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${v.is_common ? 'bg-ochre-500' : 'bg-cream-300'}`} />
                          </div>
                          <div className="card p-4 ml-2">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={v.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
                                  {ROLE_MAP[v.role]}
                                </span>
                                {v.is_common && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                    <Star className="w-3 h-3" />
                                    常用
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                                    v.is_common
                                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                      : 'bg-cream-100 text-ink-400 hover:bg-amber-50 hover:text-amber-500'
                                  }`}
                                  onClick={() => handleToggleCommon(v)}
                                >
                                  <Star className={`w-3.5 h-3.5 ${v.is_common ? 'fill-amber-400' : ''}`} />
                                  {v.is_common ? '取消常用' : '标记为常用'}
                                </button>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors"
                                  onClick={() => handleEditVersion(v)}
                                >
                                  <Edit3 className="w-4 h-4 text-ink-400 hover:text-ochre-500" />
                                </button>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                  onClick={() => handleDeleteVersion(v.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-ink-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>

                            <div className="mb-2">
                              <p className="text-ink-900 leading-relaxed">{v.interpretation}</p>
                            </div>

                            {v.scope && (
                              <div className="mb-2">
                                <span className="inline-flex items-center gap-1 text-xs bg-sage-50 text-sage-700 px-2 py-0.5 rounded-full">
                                  适用范围：{v.scope}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-xs text-ink-400 pt-2 border-t border-cream-200/50">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {v.contributed_by || '匿名'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(v.created_at).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-cream-200 pt-4">
                <h4 className="font-display text-lg text-ink-900 mb-3">词条确认</h4>
                <p className="text-sm text-ink-500 mb-3">根据家庭成员的共编成果，确认词条的审核状态</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentTerm.status === 'confirmed'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    onClick={() => handleStatusChange(currentTerm.id, 'confirmed')}
                  >
                    <Check className="w-4 h-4" />
                    已确认
                  </button>
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentTerm.status === 'pending'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                    onClick={() => handleStatusChange(currentTerm.id, 'pending')}
                  >
                    <Clock className="w-4 h-4" />
                    待确认
                  </button>
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentTerm.status === 'needs_revision'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                    onClick={() => handleStatusChange(currentTerm.id, 'needs_revision')}
                  >
                    <AlertCircle className="w-4 h-4" />
                    需修订
                  </button>
                </div>
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-2 text-xs text-ink-400">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>采集人：{currentTerm.created_by || '未知'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>创建于：{new Date(currentTerm.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>更新于：{new Date(currentTerm.updated_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVersionForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          onClick={() => setShowVersionForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <h2 className="font-display text-xl text-ink-900">
                {editingVersionId ? '编辑版本' : '添加新版本'}
              </h2>
              <button
                className="p-1 rounded-lg hover:bg-cream-100 transition-colors"
                onClick={() => setShowVersionForm(false)}
              >
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">释义解读</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  value={versionForm.interpretation}
                  onChange={(e) => setVersionForm({ ...versionForm, interpretation: e.target.value })}
                  placeholder="输入此版本的释义解读"
                />
              </div>

              <div>
                <label className="label-text">适用范围</label>
                <input
                  className="input-field"
                  value={versionForm.scope}
                  onChange={(e) => setVersionForm({ ...versionForm, scope: e.target.value })}
                  placeholder="如：日常对话、书面用语"
                />
              </div>

              <div>
                <label className="label-text mb-3">标记为常用</label>
                <button
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    versionForm.is_common
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-white border-cream-300 text-ink-500 hover:border-amber-200'
                  }`}
                  onClick={() => setVersionForm({ ...versionForm, is_common: !versionForm.is_common })}
                >
                  <Star className={`w-4 h-4 ${versionForm.is_common ? 'fill-amber-400 text-amber-500' : ''}`} />
                  {versionForm.is_common ? '已标记为常用' : '标记为常用'}
                </button>
              </div>

              <div>
                <label className="label-text">贡献人</label>
                <input
                  className="input-field"
                  value={versionForm.contributed_by}
                  onChange={(e) => setVersionForm({ ...versionForm, contributed_by: e.target.value })}
                  placeholder="贡献人姓名"
                />
              </div>

              <div>
                <label className="label-text mb-3">身份角色</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ver-role"
                      value="elder"
                      checked={versionForm.role === 'elder'}
                      onChange={() => setVersionForm({ ...versionForm, role: 'elder' })}
                      className="w-4 h-4 text-ochre-500 accent-ochre-500"
                    />
                    <span className="badge-elder">{ROLE_MAP.elder}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ver-role"
                      value="youth"
                      checked={versionForm.role === 'youth'}
                      onChange={() => setVersionForm({ ...versionForm, role: 'youth' })}
                      className="w-4 h-4 text-sage-500 accent-sage-500"
                    />
                    <span className="badge-youth">{ROLE_MAP.youth}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200">
              <button className="btn-outline" onClick={() => setShowVersionForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmitVersion} disabled={loading}>
                {loading ? '提交中...' : editingVersionId ? '保存修改' : '添加版本'}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusConfirmId && statusConfirmValue && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
          onClick={() => { setStatusConfirmId(null); setStatusConfirmValue(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-display text-lg text-ink-900">确认状态变更</h3>
            </div>
            <p className="text-sm text-ink-600 mb-6">
              确定将词条状态更改为
              <span className={`ml-1 ${STATUS_BADGE_CLASS[statusConfirmValue]}`}>
                {STATUS_MAP[statusConfirmValue]}
              </span>
              吗？
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                className="btn-outline"
                onClick={() => { setStatusConfirmId(null); setStatusConfirmValue(null); }}
              >
                取消
              </button>
              <button className="btn-primary" onClick={confirmStatusChange}>
                确认变更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
