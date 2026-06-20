import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import type { Pronunciation } from '@/types';
import { ROLE_MAP } from '@/types';
import Pagination from '@/components/Pagination';
import {
  Mic,
  Plus,
  Volume2,
  Music,
  FileText,
  User,
  Edit3,
  Trash2,
  X,
  ChevronDown,
} from 'lucide-react';

const EMPTY_FORM = {
  term: 0,
  ipa_notation: '',
  tone_description: '',
  phonetic_spelling: '',
  notes: '',
  contributed_by: '',
  role: 'elder' as Pronunciation['role'],
};

export default function PronunciationPage() {
  const { allTerms, pronunciations, pronunciationsPagination, loading, fetchAllTerms, fetchPronunciations, setPronunciationsPage, createPronunciation, updatePronunciation, deletePronunciation } = useStore();

  const [selectedTermId, setSelectedTermId] = useState<number | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchAllTerms();
  }, [fetchAllTerms]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedTermId) params.term = String(selectedTermId);
    fetchPronunciations(params, true);
  }, [selectedTermId, fetchPronunciations]);

  const termMap = new Map(allTerms.map((t) => [t.id, t]));

  const grouped = pronunciations.reduce<Record<number, Pronunciation[]>>((acc, p) => {
    if (!acc[p.term]) acc[p.term] = [];
    acc[p.term].push(p);
    return acc;
  }, {});

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      term: selectedTermId || (allTerms[0]?.id ?? 0),
    });
    setShowForm(true);
  };

  const openEditForm = (p: Pronunciation) => {
    setEditingId(p.id);
    setForm({
      term: p.term,
      ipa_notation: p.ipa_notation,
      tone_description: p.tone_description,
      phonetic_spelling: p.phonetic_spelling,
      notes: p.notes,
      contributed_by: p.contributed_by,
      role: p.role,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updatePronunciation(editingId, form);
    } else {
      await createPronunciation(form);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deletePronunciation(id);
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-ochre-100 flex items-center justify-center">
            <Mic className="w-5 h-5 text-ochre-500" />
          </div>
          <h1 className="section-title mb-0">发音备注</h1>
        </div>
        <p className="text-ink-500 ml-[52px]">记录方言词汇的语音特征，保存 IPA 标注、声调描述与拼读方式</p>
      </div>

      <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-ink-600">按词条筛选</label>
            <div className="relative">
              <select
                className="input-field w-auto min-w-[180px] pr-8 appearance-none"
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">全部词条</option>
                {allTerms.map((t) => (
                  <option key={t.id} value={t.id}>{t.word}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreateForm}>
            <Plus className="w-4 h-4" />
            添加发音
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-500">
          共 <span className="font-semibold text-ochre-500">{pronunciationsPagination.total}</span> 条发音记录
        </p>
      </div>

      {loading && !pronunciations.length ? (
        <div className="text-center py-20 text-ink-400">
          <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
          加载中...
        </div>
      ) : !pronunciations.length ? (
        <div className="text-center py-20">
          <Volume2 className="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p className="text-ink-400">暂无发音记录</p>
          <p className="text-sm text-ink-300 mt-1">点击"添加发音"开始记录</p>
        </div>
      ) : (
        <>
        <div className="space-y-8">
          {(Object.entries(grouped) as [string, Pronunciation[]][]).map(([termIdStr, items]) => {
            const termId = Number(termIdStr);
            const term = termMap.get(termId);
            return (
              <div key={termId}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display text-lg text-ink-900">{term?.word ?? `词条 #${termId}`}</span>
                  <span className="text-xs text-ink-400">({items.length} 条发音)</span>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-ochre-300 via-ochre-200 to-cream-200" />

                  <div className="space-y-5">
                    {items.map((p, idx) => (
                      <div key={p.id} className="relative">
                        <div className="absolute -left-8 top-4 w-3 h-3 rounded-full bg-ochre-500 ring-4 ring-ochre-100 z-10" />
                        {idx === items.length - 1 && (
                          <div className="absolute -left-[17px] top-7 bottom-0 w-7 bg-[#F9F5EB]" />
                        )}

                        <div className="card p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-ochre-500" />
                              <span className="font-display text-base text-ink-900">{term?.word ?? `词条 #${p.term}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={p.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
                                {ROLE_MAP[p.role]}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            {p.ipa_notation && (
                              <div className="bg-ochre-50 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-0.5">
                                  <Volume2 className="w-3 h-3" />
                                  IPA 标注
                                </div>
                                <p className="text-ink-900 font-medium">/{p.ipa_notation}/</p>
                              </div>
                            )}
                            {p.tone_description && (
                              <div className="bg-sage-50 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-0.5">
                                  <Music className="w-3 h-3" />
                                  声调描述
                                </div>
                                <p className="text-ink-900 font-medium">{p.tone_description}</p>
                              </div>
                            )}
                            {p.phonetic_spelling && (
                              <div className="bg-cream-100 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-0.5">
                                  <Mic className="w-3 h-3" />
                                  拼音拼写
                                </div>
                                <p className="text-ink-900 font-medium">{p.phonetic_spelling}</p>
                              </div>
                            )}
                          </div>

                          {p.notes && (
                            <div className="bg-cream-50 rounded-lg px-3 py-2 mb-3">
                              <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-0.5">
                                <FileText className="w-3 h-3" />
                                备注
                              </div>
                              <p className="text-sm text-ink-700 leading-relaxed">{p.notes}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-cream-200 pt-3">
                            <div className="flex items-center gap-4 text-xs text-ink-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {p.contributed_by || '匿名'}
                              </span>
                              <span>{new Date(p.created_at).toLocaleDateString('zh-CN')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1.5 rounded-lg hover:bg-ochre-50 transition-colors"
                                onClick={() => openEditForm(p)}
                              >
                                <Edit3 className="w-4 h-4 text-ink-400 hover:text-ochre-500" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 className="w-4 h-4 text-ink-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Pagination
          page={pronunciationsPagination.page}
          pageSize={pronunciationsPagination.pageSize}
          total={pronunciationsPagination.total}
          onPageChange={setPronunciationsPage}
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
                {editingId ? '编辑发音' : '添加发音'}
              </h2>
              <button className="p-1 rounded-lg hover:bg-cream-100 transition-colors" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">所属词条</label>
                <div className="relative">
                  <select
                    className="input-field appearance-none pr-8"
                    value={form.term}
                    onChange={(e) => setForm({ ...form, term: Number(e.target.value) })}
                  >
                    <option value={0}>选择词条</option>
                    {allTerms.map((t) => (
                      <option key={t.id} value={t.id}>{t.word}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="label-text">IPA 标注</label>
                <input
                  className="input-field"
                  value={form.ipa_notation}
                  onChange={(e) => setForm({ ...form, ipa_notation: e.target.value })}
                  placeholder="如：ŋ̍˧˩"
                />
              </div>

              <div>
                <label className="label-text">声调描述</label>
                <input
                  className="input-field"
                  value={form.tone_description}
                  onChange={(e) => setForm({ ...form, tone_description: e.target.value })}
                  placeholder="如：上声、去声、轻声"
                />
              </div>

              <div>
                <label className="label-text">拼音拼写</label>
                <input
                  className="input-field"
                  value={form.phonetic_spelling}
                  onChange={(e) => setForm({ ...form, phonetic_spelling: e.target.value })}
                  placeholder="如：ngeng"
                />
              </div>

              <div>
                <label className="label-text">备注</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="补充说明"
                />
              </div>

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
                      name="role"
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
                      name="role"
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
                {loading ? '提交中...' : editingId ? '保存修改' : '添加发音'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
