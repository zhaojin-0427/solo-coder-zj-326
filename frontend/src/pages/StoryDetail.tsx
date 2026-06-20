import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store';
import { STORY_STATUS_MAP, STORY_STATUS_BADGE, ROLE_MAP } from '@/types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Tag,
  Link as LinkIcon,
  History,
  Volume2,
  BookOpenText,
  Sparkles,
  Edit3,
  Clock,
  Users,
  Save,
  X,
  ScrollText,
  ChevronRight,
  Trash2,
  Check,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storyId = Number(id);
  const {
    currentStory,
    loading,
    fetchStory,
    updateStory,
    deleteStory,
    createStoryRevision,
  } = useStore();

  const [editingMode, setEditingMode] = useState<'none' | 'summary' | 'fragments' | 'notes' | 'status'>('none');
  const [editValue, setEditValue] = useState('');
  const [newRevision, setNewRevision] = useState({
    change_note: '',
    contributed_by: '',
    role: 'youth' as 'elder' | 'youth',
  });
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [relatedTermSearch, setRelatedTermSearch] = useState('');

  useEffect(() => {
    if (storyId) {
      fetchStory(storyId);
    }
  }, [storyId, fetchStory]);

  const startEdit = (mode: 'summary' | 'fragments' | 'notes' | 'status') => {
    if (!currentStory) return;
    setEditingMode(mode);
    if (mode === 'summary') setEditValue(currentStory.mandarin_summary);
    if (mode === 'fragments') setEditValue(currentStory.original_fragments);
    if (mode === 'notes') setEditValue(currentStory.elder_revision_notes);
    if (mode === 'status') setEditValue(currentStory.status);
  };

  const saveEdit = async () => {
    if (!currentStory || editingMode === 'none') return;
    const updates: Record<string, string> = {};
    if (editingMode === 'summary') updates.mandarin_summary = editValue;
    if (editingMode === 'fragments') updates.original_fragments = editValue;
    if (editingMode === 'notes') updates.elder_revision_notes = editValue;
    if (editingMode === 'status') updates.status = editValue;
    await updateStory(currentStory.id, updates);
    setEditingMode('none');
    setEditValue('');
  };

  const handleAddRevision = async () => {
    if (!currentStory || !newRevision.change_note) return;
    await createStoryRevision({
      story: currentStory.id,
      ...newRevision,
    });
    setNewRevision({ change_note: '', contributed_by: '', role: 'youth' });
    setShowRevisionForm(false);
  };

  const handleDelete = async () => {
    if (!currentStory) return;
    await deleteStory(currentStory.id);
    navigate('/stories');
  };

  const filteredRelatedTerms = (currentStory?.related_terms || []).filter(
    (t) => !relatedTermSearch || t.word.includes(relatedTermSearch) || t.meaning.includes(relatedTermSearch)
  );

  const contentParagraphs = currentStory?.content
    ? currentStory.content.split(/\n+/).filter((p) => p.trim())
    : [];

  if (loading && !currentStory) {
    return (
      <div className="page-container">
        <div className="text-center py-20 text-ink-400">
          <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
          加载中...
        </div>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="page-container">
        <div className="text-center py-20">
          <ScrollText className="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p className="text-ink-400">未找到该故事</p>
          <button className="btn-outline mt-4" onClick={() => navigate('/stories')}>
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <button
          className="flex items-center gap-2 text-ink-500 hover:text-ochre-500 transition-colors mb-4"
          onClick={() => navigate('/stories')}
        >
          <ArrowLeft className="w-4 h-4" />
          返回故事列表
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl text-ink-900">{currentStory.title}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STORY_STATUS_BADGE[currentStory.status]}`}
              >
                {STORY_STATUS_MAP[currentStory.status]}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-ink-500">
              {currentStory.narrator && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  讲述人：{currentStory.narrator}
                </span>
              )}
              {currentStory.recorder && (
                <span className="flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  记录人：{currentStory.recorder}
                </span>
              )}
              {currentStory.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {currentStory.location}
                </span>
              )}
              {currentStory.era && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {currentStory.era}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-outline flex items-center gap-1.5"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {(currentStory.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentStory.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs bg-ochre-50 text-ochre-700 px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {(currentStory.family_members?.length ?? 0) > 0 && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-sage-600" />
                <span className="text-sm font-medium text-ink-700">关联家庭成员</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentStory.family_members?.map((m) => (
                  <span key={m} className="text-sm bg-sage-50 text-sage-700 px-2.5 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="font-display text-lg text-ink-900 mb-4 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-ochre-500" />
              故事正文
            </h3>
            <div className="space-y-4">
              {contentParagraphs.length === 0 ? (
                <p className="text-ink-400 italic">暂无正文内容</p>
              ) : (
                contentParagraphs.map((para, idx) => (
                  <p key={idx} className="text-ink-800 leading-8 text-[15px] indent-8">
                    {para}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg text-ink-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sage-600" />
                普通话整理摘要
                <span className="text-xs text-ink-400 font-normal">（晚辈填写）</span>
              </h3>
              {editingMode !== 'summary' && (
                <button
                  className="text-sm text-ochre-500 hover:text-ochre-600 flex items-center gap-1"
                  onClick={() => startEdit('summary')}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑
                </button>
              )}
            </div>
            {editingMode === 'summary' ? (
              <div>
                <textarea
                  className="input-field min-h-[100px] resize-y"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="用普通话整理和概括故事要点"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button className="btn-outline !py-1.5" onClick={() => setEditingMode('none')}>
                    取消
                  </button>
                  <button className="btn-primary !py-1.5 flex items-center gap-1" onClick={saveEdit}>
                    <Save className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-ink-700 leading-7 whitespace-pre-wrap">
                {currentStory.mandarin_summary || <span className="text-ink-400 italic">暂无普通话整理摘要</span>}
              </p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg text-ink-900 flex items-center gap-2">
                <BookOpenText className="w-5 h-5 text-ochre-600" />
                原话片段补充
                <span className="text-xs text-ink-400 font-normal">（长辈填写）</span>
              </h3>
              {editingMode !== 'fragments' && (
                <button
                  className="text-sm text-ochre-500 hover:text-ochre-600 flex items-center gap-1"
                  onClick={() => startEdit('fragments')}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑
                </button>
              )}
            </div>
            {editingMode === 'fragments' ? (
              <div>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="补充方言原话片段，保留原汁原味"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button className="btn-outline !py-1.5" onClick={() => setEditingMode('none')}>
                    取消
                  </button>
                  <button className="btn-primary !py-1.5 flex items-center gap-1" onClick={saveEdit}>
                    <Save className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-ink-700 leading-7 whitespace-pre-wrap bg-ochre-50/50 p-4 rounded-lg border border-ochre-100">
                {currentStory.original_fragments || <span className="text-ink-400 italic">暂无原话片段补充</span>}
              </p>
            )}
          </div>

          {currentStory.elder_revision_notes && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg text-ink-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  长辈修订意见
                </h3>
                {editingMode !== 'notes' && (
                  <button
                    className="text-sm text-ochre-500 hover:text-ochre-600 flex items-center gap-1"
                    onClick={() => startEdit('notes')}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                )}
              </div>
              {editingMode === 'notes' ? (
                <div>
                  <textarea
                    className="input-field min-h-[60px] resize-y"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="长辈对故事内容的修订意见或补充说明"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button className="btn-outline !py-1.5" onClick={() => setEditingMode('none')}>
                      取消
                    </button>
                    <button className="btn-primary !py-1.5 flex items-center gap-1" onClick={saveEdit}>
                      <Save className="w-3.5 h-3.5" />
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-ink-700 leading-7 whitespace-pre-wrap">
                  {currentStory.elder_revision_notes}
                </p>
              )}
            </div>
          )}

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-ink-900 flex items-center gap-2">
                <History className="w-5 h-5 text-ink-600" />
                修订记录
              </h3>
              <button
                className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1.5"
                onClick={() => setShowRevisionForm(!showRevisionForm)}
              >
                {showRevisionForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showRevisionForm ? '取消' : '添加修订记录'}
              </button>
            </div>

            {showRevisionForm && (
              <div className="bg-cream-50 rounded-lg border border-cream-200 p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <label className="label-text">修订说明 *</label>
                    <textarea
                      className="input-field min-h-[60px] resize-y"
                      value={newRevision.change_note}
                      onChange={(e) => setNewRevision({ ...newRevision, change_note: e.target.value })}
                      placeholder="描述本次修订内容"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label-text">修订人</label>
                      <input
                        className="input-field"
                        value={newRevision.contributed_by}
                        onChange={(e) => setNewRevision({ ...newRevision, contributed_by: e.target.value })}
                        placeholder="修订人姓名"
                      />
                    </div>
                    <div>
                      <label className="label-text mb-2">身份角色</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="elder"
                            checked={newRevision.role === 'elder'}
                            onChange={() => setNewRevision({ ...newRevision, role: 'elder' })}
                            className="w-4 h-4 accent-ochre-500"
                          />
                          <span className="badge-elder">{ROLE_MAP.elder}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="youth"
                            checked={newRevision.role === 'youth'}
                            onChange={() => setNewRevision({ ...newRevision, role: 'youth' })}
                            className="w-4 h-4 accent-sage-500"
                          />
                          <span className="badge-youth">{ROLE_MAP.youth}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="btn-primary !py-1.5"
                      onClick={handleAddRevision}
                      disabled={!newRevision.change_note || loading}
                    >
                      {loading ? '保存中...' : '提交修订'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!currentStory.revisions?.length ? (
              <p className="text-ink-400 text-center py-6">暂无修订记录</p>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-cream-200" />
                <div className="space-y-4">
                  {currentStory.revisions.map((r) => (
                    <div key={r.id} className="relative">
                      <div className="absolute -left-3.5 top-3 w-5 h-5 rounded-full border-2 border-ochre-300 bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-ochre-500" />
                      </div>
                      <div className="card p-4 ml-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className={r.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
                            {ROLE_MAP[r.role]}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-ink-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {r.contributed_by || '匿名'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(r.created_at).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-ink-800">{r.change_note}</p>
                        {r.old_value && r.new_value && (
                          <div className="mt-2 pt-2 border-t border-cream-200 text-xs space-y-1">
                            <div className="text-ink-500">
                              <span className="text-red-500">变更前：</span>
                              {r.old_value}
                            </div>
                            <div className="text-ink-500">
                              <span className="text-emerald-600">变更后：</span>
                              {r.new_value}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-ink-400 pt-4 border-t border-cream-200 space-y-1.5">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              <span>创建人：{currentStory.created_by || '未知'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>创建于：{new Date(currentStory.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              <span>更新于：{new Date(currentStory.updated_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm overflow-hidden sticky top-8">
            <div className="px-5 py-4 border-b border-cream-200 bg-cream-50/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-ochre-500" />
                  <h3 className="font-display text-base text-ink-900">关联方言词</h3>
                </div>
                <span className="text-xs bg-ochre-100 text-ochre-700 px-2 py-0.5 rounded-full font-medium">
                  {currentStory.related_terms?.length ?? 0}
                </span>
              </div>
              {currentStory.related_terms && currentStory.related_terms.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
                  <input
                    type="text"
                    className="input-field !py-2 !pl-9 text-xs"
                    placeholder="搜索关联词..."
                    value={relatedTermSearch}
                    onChange={(e) => setRelatedTermSearch(e.target.value)}
                  />
                </div>
              )}
            </div>
            {!currentStory.related_terms?.length ? (
              <div className="p-5 text-center text-sm text-ink-400">
                <LinkIcon className="w-8 h-8 text-cream-400 mx-auto mb-2" />
                <p>暂无关联方言词</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-200 max-h-[60vh] overflow-y-auto">
                {filteredRelatedTerms.map((term) => (
                  <Link
                    key={term.id}
                    to={`/collection?term=${term.id}`}
                    className="block p-4 hover:bg-cream-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="font-display text-lg text-ink-900 group-hover:text-ochre-500 transition-colors">
                        {term.word}
                      </span>
                      <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ochre-500 transition-colors shrink-0 mt-1" />
                    </div>
                    {term.pronunciation_placeholder && (
                      <div className="flex items-center gap-1 text-xs text-ink-500 mb-1.5">
                        <Volume2 className="w-3 h-3" />
                        <span className="font-mono">{term.pronunciation_placeholder}</span>
                      </div>
                    )}
                    <p className="text-xs text-ink-600 line-clamp-2 mb-2">{term.meaning}</p>
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <FileText className="w-3 h-3" />
                      <span>{term.annotation_count} 条注解</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base text-ink-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                整理状态
              </h3>
              {editingMode !== 'status' && (
                <button
                  className="text-xs text-ochre-500 hover:text-ochre-600 flex items-center gap-1"
                  onClick={() => startEdit('status')}
                >
                  <Edit3 className="w-3 h-3" />
                  修改
                </button>
              )}
            </div>
            {editingMode === 'status' ? (
              <div>
                <select
                  className="input-field"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                >
                  {Object.entries(STORY_STATUS_MAP).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-2">
                  <button className="btn-outline !py-1.5 text-xs" onClick={() => setEditingMode('none')}>
                    取消
                  </button>
                  <button className="btn-primary !py-1.5 text-xs flex items-center gap-1" onClick={saveEdit}>
                    <Save className="w-3 h-3" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(STORY_STATUS_MAP).map(([key, label]) => {
                  const isActive = currentStory.status === key;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-2.5 rounded-lg ${isActive ? 'bg-cream-100' : ''}`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isActive
                            ? key === 'organized'
                              ? 'bg-emerald-500'
                              : key === 'needs_supplement'
                              ? 'bg-red-500'
                              : key === 'pending_elder_confirm'
                              ? 'bg-amber-500'
                              : 'bg-ink-400'
                            : 'bg-cream-300'
                        }`}
                      />
                      <span className={`text-sm ${isActive ? 'font-medium text-ink-900' : 'text-ink-500'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {currentStory.locations && currentStory.locations.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-base text-ink-900 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-ochre-500" />
                关联地点
              </h3>
              <div className="space-y-2">
                {currentStory.locations.map((loc) => (
                  <Link
                    key={loc.id}
                    to={`/dialect-map?location=${loc.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-cream-50 transition-colors group"
                  >
                    <MapPin className="w-4 h-4 text-ochre-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 group-hover:text-ochre-500 transition-colors">{loc.name}</p>
                      {loc.region && <p className="text-xs text-ink-500">{loc.region}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ochre-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-display text-lg text-ink-900">确认删除故事</h3>
            </div>
            <p className="text-sm text-ink-600 mb-6">
              确定要删除故事 <span className="font-medium text-ink-900">"{currentStory.title}"</span> 吗？此操作不可恢复。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button className="btn-outline" onClick={() => setShowDeleteConfirm(false)}>
                取消
              </button>
              <button
                className="btn-primary !bg-red-500 hover:!bg-red-600"
                onClick={handleDelete}
              >
                删除故事
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
