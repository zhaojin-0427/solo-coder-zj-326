import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import type { HeritageTask, HeritageTaskDetail, HeritageTaskStatus } from '@/types';
import {
  HERITAGE_TASK_TYPE_MAP,
  HERITAGE_TASK_STATUS_MAP,
  HERITAGE_TASK_STATUS_BADGE,
  HERITAGE_TASK_PRIORITY_MAP,
  HERITAGE_TASK_PRIORITY_BADGE,
  ROLE_MAP,
} from '@/types';
import Pagination from '@/components/Pagination';
import {
  ClipboardList,
  Plus,
  X,
  ChevronRight,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Check,
  RotateCcw,
  Archive,
  Eye,
  Filter,
  LayoutGrid,
  List,
  Trash2,
  Edit3,
  Save,
  MessageSquare,
  History,
  AlertTriangle,
} from 'lucide-react';

const STATUS_COLUMNS: HeritageTaskStatus[] = ['unclaimed', 'in_progress', 'pending_elder_confirm', 'needs_rework', 'completed', 'archived'];

const EMPTY_FORM = {
  title: '',
  task_type: 'supplement_pronunciation' as HeritageTask['task_type'],
  status: 'unclaimed' as HeritageTask['status'],
  priority: 'medium' as HeritageTask['priority'],
  assignee: '',
  assistants: [] as string[],
  due_date: '',
  description: '',
  acceptance_criteria: '',
  related_terms: [] as number[],
  related_stories: [] as number[],
  related_locations: [] as number[],
  created_by: '',
};

const EMPTY_STATUS_FORM = {
  to_status: 'in_progress' as string,
  comment: '',
  rework_reason: '',
  is_final_confirmation: false,
  operated_by: '',
  role: 'youth' as 'elder' | 'youth',
};

export default function HeritageTaskPage() {
  const {
    heritageTasks,
    heritageTasksPagination,
    currentHeritageTask,
    heritageTaskFilters,
    allTerms,
    allLocations,
    loading,
    fetchHeritageTasks,
    setHeritageTasksPage,
    fetchHeritageTask,
    createHeritageTask,
    updateHeritageTask,
    deleteHeritageTask,
    fetchHeritageTaskFilters,
    changeHeritageTaskStatus,
    fetchAllTerms,
    fetchAllLocations,
  } = useStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDetail, setShowDetail] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusForm, setStatusForm] = useState(EMPTY_STATUS_FORM);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterTaskType, setFilterTaskType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterContentType, setFilterContentType] = useState('');
  const [filterDueDateFrom, setFilterDueDateFrom] = useState('');
  const [filterDueDateTo, setFilterDueDateTo] = useState('');

  useEffect(() => {
    fetchHeritageTaskFilters();
    fetchAllTerms();
    fetchAllLocations();
  }, [fetchHeritageTaskFilters, fetchAllTerms, fetchAllLocations]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterAssignee) params.assignee = filterAssignee;
    if (filterTaskType) params.task_type = filterTaskType;
    if (filterPriority) params.priority = filterPriority;
    if (filterStatus) params.status = filterStatus;
    if (filterContentType) params.related_content_type = filterContentType;
    if (filterDueDateFrom) params.due_date_from = filterDueDateFrom;
    if (filterDueDateTo) params.due_date_to = filterDueDateTo;
    fetchHeritageTasks(params, true);
  }, [filterAssignee, filterTaskType, filterPriority, filterStatus, filterContentType, filterDueDateFrom, filterDueDateTo, fetchHeritageTasks]);

  const openDetail = async (id: number) => {
    await fetchHeritageTask(id);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (task: HeritageTaskDetail) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      task_type: task.task_type,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      assistants: task.assistants || [],
      due_date: task.due_date || '',
      description: task.description,
      acceptance_criteria: task.acceptance_criteria,
      related_terms: (task as any).related_terms || [],
      related_stories: (task as any).related_stories || [],
      related_locations: (task as any).related_locations || [],
      created_by: task.created_by,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateHeritageTask(editingId, form);
    } else {
      await createHeritageTask(form);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteHeritageTask(id);
    setShowDeleteConfirm(null);
    closeDetail();
  };

  const handleStatusChange = async () => {
    if (!currentHeritageTask) return;
    await changeHeritageTaskStatus(currentHeritageTask.id, statusForm);
    setShowStatusForm(false);
    setStatusForm(EMPTY_STATUS_FORM);
  };

  const handlePageChange = (page: number) => {
    setHeritageTasksPage(page);
    const params: Record<string, string> = {};
    if (filterAssignee) params.assignee = filterAssignee;
    if (filterTaskType) params.task_type = filterTaskType;
    if (filterPriority) params.priority = filterPriority;
    if (filterStatus) params.status = filterStatus;
    if (filterContentType) params.related_content_type = filterContentType;
    if (filterDueDateFrom) params.due_date_from = filterDueDateFrom;
    if (filterDueDateTo) params.due_date_to = filterDueDateTo;
    params.page = String(page);
    fetchHeritageTasks(params, false);
  };

  const kanbanData: Record<string, HeritageTask[]> = {};
  STATUS_COLUMNS.forEach((s) => {
    kanbanData[s] = heritageTasks.filter((t) => t.status === s);
  });

  const clearFilters = () => {
    setFilterAssignee('');
    setFilterTaskType('');
    setFilterPriority('');
    setFilterStatus('');
    setFilterContentType('');
    setFilterDueDateFrom('');
    setFilterDueDateTo('');
  };

  const hasActiveFilters = filterAssignee || filterTaskType || filterPriority || filterStatus || filterContentType || filterDueDateFrom || filterDueDateTo;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-ochre-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-ochre-500" />
            </div>
            <h1 className="section-title mb-0">传承任务</h1>
          </div>
          <p className="text-ink-500 ml-[52px]">
            家庭方言传承任务与长辈确认工作台，可分派、可跟踪、可确认的家庭协作任务
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreateForm}>
          <Plus className="w-4 h-4" />
          新建任务
        </button>
      </div>

      <div className="bg-white rounded-xl border border-cream-300/50 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-cream-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-white text-ochre-600 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="w-4 h-4" />
              看板
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white text-ochre-600 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
              列表
            </button>
          </div>
          <select className="input-field w-auto min-w-[130px]" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
            <option value="">全部负责人</option>
            {(heritageTaskFilters?.assignees || []).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[130px]" value={filterTaskType} onChange={(e) => setFilterTaskType(e.target.value)}>
            <option value="">全部类型</option>
            {Object.entries(HERITAGE_TASK_TYPE_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[110px]" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="">全部优先级</option>
            {Object.entries(HERITAGE_TASK_PRIORITY_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[130px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            {Object.entries(HERITAGE_TASK_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[130px]" value={filterContentType} onChange={(e) => setFilterContentType(e.target.value)}>
            <option value="">全部关联内容</option>
            <option value="term">词条</option>
            <option value="story">故事</option>
            <option value="location">地点</option>
          </select>
          <input type="date" className="input-field w-auto" value={filterDueDateFrom} onChange={(e) => setFilterDueDateFrom(e.target.value)} placeholder="截止起始" />
          <input type="date" className="input-field w-auto" value={filterDueDateTo} onChange={(e) => setFilterDueDateTo(e.target.value)} placeholder="截止结束" />
          {hasActiveFilters && (
            <button className="text-xs text-ochre-500 hover:text-ochre-600 flex items-center gap-1" onClick={clearFilters}>
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>
      </div>

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATUS_COLUMNS.map((col) => (
            <div key={col} className="bg-cream-50 rounded-xl p-3 min-h-[300px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink-700">{HERITAGE_TASK_STATUS_MAP[col]}</h3>
                <span className="text-xs bg-white text-ink-500 px-2 py-0.5 rounded-full">{kanbanData[col]?.length || 0}</span>
              </div>
              <div className="space-y-2">
                {(kanbanData[col] || []).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-3 border border-cream-200 cursor-pointer hover:border-ochre-300 hover:shadow-sm transition-all"
                    onClick={() => openDetail(task.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${HERITAGE_TASK_PRIORITY_BADGE[task.priority]}`}>
                        {HERITAGE_TASK_PRIORITY_MAP[task.priority]}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-ink-300" />
                    </div>
                    <h4 className="text-sm font-medium text-ink-900 mb-1 line-clamp-2">{task.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-ink-400">
                      <span className="inline-flex items-center gap-0.5">
                        <ClipboardList className="w-3 h-3" />
                        {HERITAGE_TASK_TYPE_MAP[task.task_type]}
                      </span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-ink-500">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </div>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-ink-400">
                        <Calendar className="w-3 h-3" />
                        {task.due_date}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <>
          {loading && !heritageTasks.length ? (
            <div className="text-center py-20 text-ink-400">
              <div className="animate-spin w-8 h-8 border-2 border-ochre-500 border-t-transparent rounded-full mx-auto mb-3" />
              加载中...
            </div>
          ) : !heritageTasks.length ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-cream-400 mx-auto mb-3" />
              <p className="text-ink-400">暂无传承任务</p>
              <p className="text-sm text-ink-300 mt-1">点击"新建任务"开始创建</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heritageTasks.map((task) => (
                  <div
                    key={task.id}
                    className="card card-hover cursor-pointer p-5 group"
                    onClick={() => openDetail(task.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-lg text-ink-900 group-hover:text-ochre-500 transition-colors line-clamp-1">
                        {task.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${HERITAGE_TASK_STATUS_BADGE[task.status]}`}>
                        {HERITAGE_TASK_STATUS_MAP[task.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-ochre-50 text-ochre-700 px-2 py-0.5 rounded-full">
                        <ClipboardList className="w-3 h-3" />
                        {HERITAGE_TASK_TYPE_MAP[task.task_type]}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${HERITAGE_TASK_PRIORITY_BADGE[task.priority]}`}>
                        {HERITAGE_TASK_PRIORITY_MAP[task.priority]}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-ink-600 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between border-t border-cream-200 pt-3">
                      <div className="flex items-center gap-3 text-xs text-ink-400">
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {task.assignee}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {task.due_date}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ochre-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  page={heritageTasksPagination.page}
                  pageSize={heritageTasksPagination.pageSize}
                  total={heritageTasksPagination.total}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </>
      )}

      {showDetail && currentHeritageTask && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={closeDetail}>
          <div
            className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-cream-200 p-6 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-2xl text-ink-900">{currentHeritageTask.title}</h2>
                <button className="p-2 rounded-lg hover:bg-cream-100 transition-colors" onClick={closeDetail}>
                  <X className="w-5 h-5 text-ink-400" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${HERITAGE_TASK_STATUS_BADGE[currentHeritageTask.status]}`}>
                  {HERITAGE_TASK_STATUS_MAP[currentHeritageTask.status]}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-ochre-50 text-ochre-700 px-2.5 py-1 rounded-full">
                  <ClipboardList className="w-3 h-3" />
                  {HERITAGE_TASK_TYPE_MAP[currentHeritageTask.task_type]}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${HERITAGE_TASK_PRIORITY_BADGE[currentHeritageTask.priority]}`}>
                  {HERITAGE_TASK_PRIORITY_MAP[currentHeritageTask.priority]}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {currentHeritageTask.assignee && (
                  <div>
                    <h4 className="text-sm font-medium text-ink-500 mb-1">负责人</h4>
                    <p className="text-ink-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-ochre-500" />
                      {currentHeritageTask.assignee}
                    </p>
                  </div>
                )}
                {currentHeritageTask.due_date && (
                  <div>
                    <h4 className="text-sm font-medium text-ink-500 mb-1">期望完成日期</h4>
                    <p className="text-ink-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-ochre-500" />
                      {currentHeritageTask.due_date}
                    </p>
                  </div>
                )}
              </div>

              {(currentHeritageTask.assistants?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-2">协助人</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentHeritageTask.assistants.map((a, i) => (
                      <span key={i} className="text-sm bg-sage-50 text-sage-700 px-2.5 py-1 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {currentHeritageTask.description && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-1">任务说明</h4>
                  <p className="text-ink-900 leading-relaxed whitespace-pre-wrap">{currentHeritageTask.description}</p>
                </div>
              )}

              {currentHeritageTask.acceptance_criteria && (
                <div>
                  <h4 className="text-sm font-medium text-ink-500 mb-1">验收标准</h4>
                  <p className="text-ink-900 leading-relaxed whitespace-pre-wrap bg-ochre-50/50 p-3 rounded-lg border border-ochre-100">
                    {currentHeritageTask.acceptance_criteria}
                  </p>
                </div>
              )}

              <div className="border-t border-cream-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-lg text-ink-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-ink-600" />
                    状态流转记录
                  </h4>
                  <button
                    className="btn-primary flex items-center gap-1.5 text-sm !px-4 !py-2"
                    onClick={() => {
                      setStatusForm({ ...EMPTY_STATUS_FORM, to_status: currentHeritageTask.status === 'unclaimed' ? 'in_progress' : currentHeritageTask.status === 'in_progress' ? 'pending_elder_confirm' : currentHeritageTask.status === 'needs_rework' ? 'in_progress' : currentHeritageTask.status === 'pending_elder_confirm' ? 'completed' : currentHeritageTask.status });
                      setShowStatusForm(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    状态变更
                  </button>
                </div>

                {showStatusForm && (
                  <div className="bg-cream-50 rounded-lg border border-cream-200 p-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <label className="label-text">目标状态 *</label>
                        <select
                          className="input-field"
                          value={statusForm.to_status}
                          onChange={(e) => setStatusForm({ ...statusForm, to_status: e.target.value })}
                        >
                          {Object.entries(HERITAGE_TASK_STATUS_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label-text">意见/说明</label>
                        <textarea
                          className="input-field min-h-[60px] resize-y"
                          value={statusForm.comment}
                          onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
                          placeholder="填写变更说明或确认意见"
                        />
                      </div>
                      {statusForm.to_status === 'needs_rework' && (
                        <div>
                          <label className="label-text">返工原因 *</label>
                          <textarea
                            className="input-field min-h-[60px] resize-y"
                            value={statusForm.rework_reason}
                            onChange={(e) => setStatusForm({ ...statusForm, rework_reason: e.target.value })}
                            placeholder="说明需要返工的具体原因"
                          />
                        </div>
                      )}
                      {(statusForm.to_status === 'completed' || statusForm.to_status === 'archived') && (
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={statusForm.is_final_confirmation}
                              onChange={(e) => setStatusForm({ ...statusForm, is_final_confirmation: e.target.checked })}
                              className="w-4 h-4 accent-ochre-500"
                            />
                            <span className="text-sm text-ink-700">标记为最终确认</span>
                          </label>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label-text">操作人</label>
                          <input
                            className="input-field"
                            value={statusForm.operated_by}
                            onChange={(e) => setStatusForm({ ...statusForm, operated_by: e.target.value })}
                            placeholder="操作人姓名"
                          />
                        </div>
                        <div>
                          <label className="label-text mb-2">身份角色</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="elder"
                                checked={statusForm.role === 'elder'}
                                onChange={() => setStatusForm({ ...statusForm, role: 'elder' })}
                                className="w-4 h-4 accent-ochre-500"
                              />
                              <span className="badge-elder">{ROLE_MAP.elder}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="youth"
                                checked={statusForm.role === 'youth'}
                                onChange={() => setStatusForm({ ...statusForm, role: 'youth' })}
                                className="w-4 h-4 accent-sage-500"
                              />
                              <span className="badge-youth">{ROLE_MAP.youth}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button className="btn-outline !py-1.5" onClick={() => setShowStatusForm(false)}>取消</button>
                        <button className="btn-primary !py-1.5 flex items-center gap-1" onClick={handleStatusChange} disabled={loading}>
                          <Save className="w-3.5 h-3.5" />
                          {loading ? '提交中...' : '提交'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!currentHeritageTask.status_logs?.length ? (
                  <p className="text-ink-400 text-center py-6">暂无状态变更记录</p>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-cream-200" />
                    <div className="space-y-4">
                      {currentHeritageTask.status_logs.map((log) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-3.5 top-3 w-5 h-5 rounded-full border-2 border-ochre-300 bg-white flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${log.to_status === 'completed' ? 'bg-emerald-500' : log.to_status === 'needs_rework' ? 'bg-red-500' : 'bg-ochre-500'}`} />
                          </div>
                          <div className="card p-4 ml-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-ink-500">{log.from_status ? HERITAGE_TASK_STATUS_MAP[log.from_status] || log.from_status : '创建'}</span>
                                <ChevronRight className="w-3 h-3 text-ink-300" />
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${HERITAGE_TASK_STATUS_BADGE[log.to_status] || 'bg-cream-200 text-ink-600'}`}>
                                  {HERITAGE_TASK_STATUS_MAP[log.to_status] || log.to_status}
                                </span>
                                {log.is_final_confirmation && (
                                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" />
                                    最终确认
                                  </span>
                                )}
                              </div>
                              <span className={log.role === 'elder' ? 'badge-elder' : 'badge-youth'}>
                                {ROLE_MAP[log.role]}
                              </span>
                            </div>
                            {log.comment && <p className="text-sm text-ink-800 mb-1">{log.comment}</p>}
                            {log.rework_reason && (
                              <div className="flex items-start gap-1.5 text-sm text-red-700 bg-red-50 p-2 rounded mt-1">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>返工原因：{log.rework_reason}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-ink-400 pt-2 border-t border-cream-200/50 mt-2">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.operated_by || '匿名'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(log.created_at).toLocaleString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-2 text-xs text-ink-400">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>创建人：{currentHeritageTask.created_by || '未知'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>创建于：{new Date(currentHeritageTask.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>更新于：{new Date(currentHeritageTask.updated_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => { closeDetail(); openEditForm(currentHeritageTask); }}
                >
                  编辑任务
                </button>
                <button
                  className="btn-outline flex-1 !border-red-400 !text-red-500 hover:!bg-red-50"
                  onClick={() => setShowDeleteConfirm(currentHeritageTask.id)}
                >
                  删除任务
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl text-ink-900">
                {editingId ? '编辑传承任务' : '新建传承任务'}
              </h2>
              <button className="p-1 rounded-lg hover:bg-cream-100 transition-colors" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">任务标题 *</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="输入任务标题" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">任务类型 *</label>
                  <select className="input-field" value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value as HeritageTask['task_type'] })}>
                    {Object.entries(HERITAGE_TASK_TYPE_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">优先级</label>
                  <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as HeritageTask['priority'] })}>
                    {Object.entries(HERITAGE_TASK_PRIORITY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">负责人</label>
                  <input className="input-field" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="负责人姓名" />
                </div>
                <div>
                  <label className="label-text">期望完成日期</label>
                  <input type="date" className="input-field" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-text">协助人</label>
                <input className="input-field" value={form.assistants.join(', ')} onChange={(e) => setForm({ ...form, assistants: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="用逗号分隔多个协助人" />
              </div>
              <div>
                <label className="label-text">任务说明</label>
                <textarea className="input-field min-h-[80px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="描述任务详情" />
              </div>
              <div>
                <label className="label-text">验收标准</label>
                <textarea className="input-field min-h-[60px] resize-y" value={form.acceptance_criteria} onChange={(e) => setForm({ ...form, acceptance_criteria: e.target.value })} placeholder="描述验收标准" />
              </div>
              <div>
                <label className="label-text">创建人</label>
                <input className="input-field" value={form.created_by} onChange={(e) => setForm({ ...form, created_by: e.target.value })} placeholder="创建人姓名" />
              </div>
              <div>
                <label className="label-text">关联词条</label>
                <div className="bg-cream-50 rounded-lg border border-cream-200 p-3 max-h-32 overflow-y-auto">
                  {allTerms.length === 0 ? (
                    <p className="text-xs text-ink-400">暂无可关联词条</p>
                  ) : (
                    allTerms.filter((t) => !form.related_terms.includes(t.id)).slice(0, 20).map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-cream-100 transition-colors text-sm"
                        onClick={() => setForm({ ...form, related_terms: [...form.related_terms, t.id] })}
                      >
                        <Plus className="w-3 h-3 text-ink-400" />
                        <span className="text-ink-900">{t.word}</span>
                        <span className="text-xs text-ink-400">{t.meaning?.slice(0, 20)}</span>
                      </div>
                    ))
                  )}
                </div>
                {form.related_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allTerms.filter((t) => form.related_terms.includes(t.id)).map((t) => (
                      <span key={t.id} className="inline-flex items-center gap-1 text-xs bg-ochre-100 text-ochre-700 px-2 py-1 rounded-full cursor-pointer hover:bg-ochre-200" onClick={() => setForm({ ...form, related_terms: form.related_terms.filter((id) => id !== t.id) })}>
                        {t.word} <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="label-text">关联地点</label>
                <div className="bg-cream-50 rounded-lg border border-cream-200 p-3 max-h-32 overflow-y-auto">
                  {allLocations.length === 0 ? (
                    <p className="text-xs text-ink-400">暂无可关联地点</p>
                  ) : (
                    allLocations.filter((l) => !form.related_locations.includes(l.id)).slice(0, 20).map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-cream-100 transition-colors text-sm"
                        onClick={() => setForm({ ...form, related_locations: [...form.related_locations, l.id] })}
                      >
                        <Plus className="w-3 h-3 text-ink-400" />
                        <span className="text-ink-900">{l.name}</span>
                        {l.region && <span className="text-xs text-ink-400">{l.region}</span>}
                      </div>
                    ))
                  )}
                </div>
                {form.related_locations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allLocations.filter((l) => form.related_locations.includes(l.id)).map((l) => (
                      <span key={l.id} className="inline-flex items-center gap-1 text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full cursor-pointer hover:bg-sage-200" onClick={() => setForm({ ...form, related_locations: form.related_locations.filter((id) => id !== l.id) })}>
                        {l.name} <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200 sticky bottom-0 bg-white">
              <button className="btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.title}>
                {loading ? '提交中...' : editingId ? '保存修改' : '创建任务'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-display text-lg text-ink-900">确认删除任务</h3>
            </div>
            <p className="text-sm text-ink-600 mb-6">确定要删除该传承任务吗？此操作不可恢复。</p>
            <div className="flex items-center justify-end gap-3">
              <button className="btn-outline" onClick={() => setShowDeleteConfirm(null)}>取消</button>
              <button className="btn-primary !bg-red-500 hover:!bg-red-600" onClick={() => handleDelete(showDeleteConfirm)}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
