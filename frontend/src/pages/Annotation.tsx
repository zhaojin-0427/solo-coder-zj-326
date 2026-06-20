import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import type { Annotation, Term } from '@/types';
import { ANNOTATION_TYPE_MAP, ROLE_MAP } from '@/types';
import Pagination from '@/components/Pagination';
import {
  PenTool,
  Plus,
  MessageSquare,
  Users,
  GitCompare,
  Languages,
  Image,
  StickyNote,
  X,
  Edit3,
  Trash2,
} from 'lucide-react';

type AnnotationType = Annotation['type'];

const TYPE_ICON: Record<AnnotationType, typeof MessageSquare> = {
  example_sentence: MessageSquare,
  kinship_term: Users,
  synonym: GitCompare,
  mandarin_translation: Languages,
  image_association: Image,
  family_note: StickyNote,
};

const TYPE_ACCENT: Record<AnnotationType, { bg: string; border: string; icon: string; badge: string }> = {
  example_sentence: { bg: 'bg-ochre-50', border: 'border-ochre-200', icon: 'text-ochre-500', badge: 'bg-ochre-100 text-ochre-600' },
  kinship_term: { bg: 'bg-sage-50', border: 'border-sage-200', icon: 'text-sage-500', badge: 'bg-sage-100 text-sage-600' },
  synonym: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-600' },
  mandarin_translation: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-600' },
  image_association: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', badge: 'bg-purple-100 text-purple-600' },
  family_note: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500', badge: 'bg-rose-100 text-rose-600' },
};

const EXTRA_FIELDS: Record<AnnotationType, { key: string; label: string; placeholder: string }[]> = {
  example_sentence: [
    { key: 'scene', label: '使用场景', placeholder: '如：过年走亲戚时' },
    { key: 'era', label: '时代背景', placeholder: '如：1980年代' },
  ],
  kinship_term: [
    { key: 'relationship', label: '亲属关系', placeholder: '如：父亲的弟弟' },
    { key: 'mapping', label: '称谓映射', placeholder: '如：叔叔→阿叔' },
  ],
  synonym: [
    { key: 'dialect_word', label: '方言词', placeholder: '如：嬢嬢' },
    { key: 'mandarin_word', label: '普通话对应', placeholder: '如：阿姨' },
    { key: 'difference', label: '差异说明', placeholder: '如：用法更亲昵' },
  ],
  mandarin_translation: [
    { key: 'dialect', label: '方言表达', placeholder: '如：肚饥' },
    { key: 'mandarin', label: '普通话表达', placeholder: '如：饿了' },
  ],
  image_association: [
    { key: 'image_url', label: '图片链接', placeholder: 'https://...' },
    { key: 'description', label: '图片描述', placeholder: '描述联想图片内容' },
  ],
  family_note: [
    { key: 'family_context', label: '家庭背景', placeholder: '如：外婆家常用' },
    { key: 'note', label: '补充备注', placeholder: '补充说明' },
  ],
};

const EMPTY_FORM = {
  term: 0,
  type: 'example_sentence' as AnnotationType,
  content: '',
  extra_data: {} as Record<string, string>,
  contributed_by: '',
  role: 'elder' as Annotation['role'],
};

function AnnotationCard({ annotation, termWord, onEdit, onDelete }: { annotation: Annotation; termWord: string; onEdit: () => void; onDelete: () => void }) {
  const Icon = TYPE_ICON[annotation.type];
  const accent = TYPE_ACCENT[annotation.type];
  const extra = annotation.extra_data ?? {};

  return (
    <div className={`card border ${accent.border} ${accent.bg} overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${accent.badge} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge}`}>
              {ANNOTATION_TYPE_MAP[annotation.type]}
            </span>
            <span className="ml-2 font-display text-sm text-ink-900">{termWord}</span>
          </div>
        </div>
        <span className={annotation.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
          {ROLE_MAP[annotation.role]}
        </span>
      </div>

      {annotation.type === 'example_sentence' && (
        <div className="space-y-2">
          <p className="text-ink-900 leading-relaxed pl-3 border-l-2 border-ochre-300 italic">
            "{annotation.content}"
          </p>
          {(extra.scene || extra.era) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {extra.scene && (
                <span className="inline-flex items-center gap-1 text-xs bg-ochre-100/60 text-ochre-600 px-2 py-0.5 rounded-full">
                  🎭 {extra.scene}
                </span>
              )}
              {extra.era && (
                <span className="inline-flex items-center gap-1 text-xs bg-cream-200/60 text-ink-500 px-2 py-0.5 rounded-full">
                  🕰 {extra.era}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {annotation.type === 'kinship_term' && (
        <div className="space-y-2">
          <p className="text-ink-900 leading-relaxed">{annotation.content}</p>
          {(extra.relationship || extra.mapping) && (
            <div className="bg-white/70 rounded-lg p-3 border border-sage-200/50">
              <div className="flex items-center gap-3 flex-wrap">
                {extra.relationship && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sage-500" />
                    <span className="text-sm text-ink-700">{extra.relationship}</span>
                  </div>
                )}
                {extra.relationship && extra.mapping && (
                  <span className="text-ink-300">→</span>
                )}
                {extra.mapping && (
                  <span className="font-display text-base text-sage-600">{extra.mapping}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {annotation.type === 'synonym' && (
        <div className="space-y-2">
          <p className="text-ink-900 leading-relaxed">{annotation.content}</p>
          <div className="bg-white/70 rounded-lg p-3 border border-amber-200/50">
            <div className="flex items-stretch gap-3">
              {extra.dialect_word && (
                <div className="flex-1 bg-ochre-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-ink-500 mb-1">方言</p>
                  <p className="font-display text-base text-ink-900">{extra.dialect_word}</p>
                </div>
              )}
              {extra.dialect_word && extra.mandarin_word && (
                <div className="flex items-center">
                  <GitCompare className="w-4 h-4 text-amber-400" />
                </div>
              )}
              {extra.mandarin_word && (
                <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-ink-500 mb-1">普通话</p>
                  <p className="font-display text-base text-ink-900">{extra.mandarin_word}</p>
                </div>
              )}
            </div>
            {extra.difference && (
              <p className="text-xs text-amber-600 mt-2 pl-2 border-l-2 border-amber-300">
                {extra.difference}
              </p>
            )}
          </div>
        </div>
      )}

      {annotation.type === 'mandarin_translation' && (
        <div className="space-y-2">
          <p className="text-ink-900 leading-relaxed">{annotation.content}</p>
          <div className="bg-white/70 rounded-lg border border-blue-200/50 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-blue-100">
              <div className="p-3 text-center bg-ochre-50/50">
                <p className="text-xs text-ink-500 mb-1">方言</p>
                <p className="font-display text-lg text-ochre-600">{extra.dialect || '—'}</p>
              </div>
              <div className="p-3 text-center bg-blue-50/50">
                <p className="text-xs text-ink-500 mb-1">普通话</p>
                <p className="font-display text-lg text-blue-600">{extra.mandarin || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {annotation.type === 'image_association' && (
        <div className="space-y-2">
          <p className="text-ink-900 leading-relaxed">{annotation.content}</p>
          {extra.image_url && (
            <div className="bg-white/70 rounded-lg p-3 border border-purple-200/50">
              <div className="flex items-center gap-2 mb-1">
                <Image className="w-4 h-4 text-purple-500" />
                <a
                  href={extra.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-800 underline break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {extra.image_url}
                </a>
              </div>
              {extra.description && (
                <p className="text-xs text-ink-500 mt-1">{extra.description}</p>
              )}
            </div>
          )}
        </div>
      )}

      {annotation.type === 'family_note' && (
        <div className="space-y-2">
          <p className="text-ink-900 leading-relaxed">{annotation.content}</p>
          {(extra.family_context || extra.note) && (
            <div className="bg-white/70 rounded-lg p-3 border border-rose-200/50 space-y-1">
              {extra.family_context && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-rose-500 mt-0.5">🏠</span>
                  <span className="text-sm text-ink-700">{extra.family_context}</span>
                </div>
              )}
              {extra.note && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-rose-400 mt-0.5">📝</span>
                  <span className="text-sm text-ink-500">{extra.note}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-cream-200/50 mt-3 pt-3">
        <div className="flex items-center gap-4 text-xs text-ink-400">
          <span>{annotation.contributed_by || '匿名'}</span>
          <span>{new Date(annotation.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-white/60 transition-colors" onClick={onEdit}>
            <Edit3 className="w-4 h-4 text-ink-400 hover:text-ochre-500" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-ink-400 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnnotationPage() {
  const { allTerms, annotations, annotationsPagination, loading, fetchAllTerms, fetchAnnotations, setAnnotationsPage, createAnnotation, updateAnnotation, deleteAnnotation } = useStore();

  const [selectedTermId, setSelectedTermId] = useState<number | ''>('');
  const [activeType, setActiveType] = useState<AnnotationType | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchAllTerms();
  }, [fetchAllTerms]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedTermId) params.term = String(selectedTermId);
    if (activeType !== 'all') params.type = activeType;
    fetchAnnotations(params, true);
  }, [selectedTermId, activeType, fetchAnnotations]);

  const termMap: Map<number, Term> = new Map(allTerms.map((t) => [t.id, t]));

  const filteredAnnotations = annotations;

  const openCreateForm = () => {
    setEditingId(null);
    const defaultType = activeType !== 'all' ? activeType : 'example_sentence';
    setForm({
      ...EMPTY_FORM,
      type: defaultType,
      term: selectedTermId || (allTerms[0]?.id ?? 0),
      extra_data: {},
    });
    setShowForm(true);
  };

  const openEditForm = (ann: Annotation) => {
    setEditingId(ann.id);
    setForm({
      term: ann.term,
      type: ann.type,
      content: ann.content,
      extra_data: { ...ann.extra_data },
      contributed_by: ann.contributed_by,
      role: ann.role,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const data = { ...form };
    if (editingId) {
      await updateAnnotation(editingId, data);
    } else {
      await createAnnotation(data);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteAnnotation(id);
  };

  const handleTypeChange = (newType: AnnotationType) => {
    const currentExtra = { ...form.extra_data };
    const newFields = EXTRA_FIELDS[newType];
    const cleaned: Record<string, string> = {};
    for (const f of newFields) {
      cleaned[f.key] = currentExtra[f.key] ?? '';
    }
    setForm({ ...form, type: newType, extra_data: cleaned });
  };

  const currentExtraFields = EXTRA_FIELDS[form.type];

  const tabs: { key: AnnotationType | 'all'; label: string; icon: typeof MessageSquare }[] = [
    { key: 'all', label: '全部', icon: PenTool },
    ...Object.entries(ANNOTATION_TYPE_MAP).map(([key, label]) => ({
      key: key as AnnotationType,
      label,
      icon: TYPE_ICON[key as AnnotationType],
    })),
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-ochre-100 flex items-center justify-center">
            <PenTool className="w-5 h-5 text-ochre-500" />
          </div>
          <h1 className="section-title mb-0">语义注解</h1>
        </div>
        <p className="text-ink-500 ml-[52px]">为方言词汇添加丰富的语义标注，涵盖例句、亲属称谓、近义对照、普通话翻译、图片联想与家庭备注</p>
      </div>

      <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-ink-600">词条筛选</label>
              <select
                className="input-field w-auto min-w-[180px]"
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">全部词条</option>
                {allTerms.map((t) => (
                  <option key={t.id} value={t.id}>{t.word}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-ink-600">注解类型</label>
              <select
                className="input-field w-auto min-w-[140px]"
                value={activeType}
                onChange={(e) => setActiveType(e.target.value as AnnotationType | 'all')}
              >
                <option value="all">全部类型</option>
                {Object.entries(ANNOTATION_TYPE_MAP).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreateForm}>
            <Plus className="w-4 h-4" />
            添加注解
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeType === tab.key;
          const accent = tab.key !== 'all' ? TYPE_ACCENT[tab.key as AnnotationType] : null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? accent
                    ? `${accent.badge} shadow-sm`
                    : 'bg-ochre-500 text-white shadow-sm'
                  : 'bg-cream-100 text-ink-500 hover:bg-cream-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-500">
          共 <span className="font-semibold text-ochre-500">{annotationsPagination.total}</span> 条注解
        </p>
      </div>

      {loading && !annotations.length ? (
        <div className="text-center py-20 text-ink-400">
          <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
          加载中...
        </div>
      ) : !filteredAnnotations.length ? (
        <div className="text-center py-20">
          <PenTool className="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p className="text-ink-400">暂无注解数据</p>
          <p className="text-sm text-ink-300 mt-1">点击"添加注解"开始标注</p>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnnotations.map((ann) => (
            <AnnotationCard
              key={ann.id}
              annotation={ann}
              termWord={termMap.get(ann.term)?.word ?? `词条 #${ann.term}`}
              onEdit={() => openEditForm(ann)}
              onDelete={() => handleDelete(ann.id)}
            />
          ))}
        </div>

        <Pagination
          page={annotationsPagination.page}
          pageSize={annotationsPagination.pageSize}
          total={annotationsPagination.total}
          onPageChange={setAnnotationsPage}
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
                {editingId ? '编辑注解' : '添加注解'}
              </h2>
              <button className="p-1 rounded-lg hover:bg-cream-100 transition-colors" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">所属词条</label>
                <select
                  className="input-field"
                  value={form.term}
                  onChange={(e) => setForm({ ...form, term: Number(e.target.value) })}
                >
                  <option value={0}>选择词条</option>
                  {allTerms.map((t) => (
                    <option key={t.id} value={t.id}>{t.word}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">注解类型</label>
                <select
                  className="input-field"
                  value={form.type}
                  onChange={(e) => handleTypeChange(e.target.value as AnnotationType)}
                >
                  {Object.entries(ANNOTATION_TYPE_MAP).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">注解内容</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="输入注解内容"
                />
              </div>

              {currentExtraFields.length > 0 && (
                <div className="space-y-3">
                  <label className="label-text">扩展信息</label>
                  <div className="bg-cream-50 rounded-lg p-4 space-y-3 border border-cream-200">
                    {currentExtraFields.map((field) => (
                      <div key={field.key}>
                        <label className="text-xs font-medium text-ink-500 mb-1 block">{field.label}</label>
                        {field.key === 'image_url' ? (
                          <input
                            className="input-field"
                            value={form.extra_data[field.key] ?? ''}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                extra_data: { ...form.extra_data, [field.key]: e.target.value },
                              })
                            }
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <textarea
                            className="input-field min-h-[48px] resize-y text-sm"
                            value={form.extra_data[field.key] ?? ''}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                extra_data: { ...form.extra_data, [field.key]: e.target.value },
                              })
                            }
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label-text">贡献人</label>
                <input
                  className="input-field"
                  value={form.contributed_by}
                  onChange={(e) => setForm({ ...form, contributed_by: e.target.value })}
                  placeholder="贡献人姓名"
                />
              </div>

              <div>
                <label className="label-text mb-3">身份角色</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ann-role"
                      value="elder"
                      checked={form.role === 'elder'}
                      onChange={() => setForm({ ...form, role: 'elder' })}
                      className="w-4 h-4 text-ochre-500 accent-ochre-500"
                    />
                    <span className="badge-elder">{ROLE_MAP.elder}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ann-role"
                      value="youth"
                      checked={form.role === 'youth'}
                      onChange={() => setForm({ ...form, role: 'youth' })}
                      className="w-4 h-4 text-sage-500 accent-sage-500"
                    />
                    <span className="badge-youth">{ROLE_MAP.youth}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200">
              <button className="btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? '提交中...' : editingId ? '保存修改' : '添加注解'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
