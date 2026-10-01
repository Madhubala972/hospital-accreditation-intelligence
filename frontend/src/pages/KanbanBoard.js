import React, { useState, useEffect, useMemo } from 'react';
import {
  Kanban as KanbanIcon,
  Plus,
  Search,
  Filter,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Trash2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Printer,
  ChevronRight,
  CheckSquare,
  Square,
  Layers,
  Activity,
  Award,
  Zap,
  Tag,
  X,
} from 'lucide-react';
import {
  fetchCapaTasks,
  createCapaTask,
  updateTaskStage,
  updateCapaTask,
  toggleChecklistItem,
  deleteCapaTask,
  syncAlertsToKanban,
} from '../services/capaApi';

const COLUMNS = [
  {
    id: 'BACKLOG',
    title: 'Audit Findings & Backlog',
    subtitle: 'Identified gaps & non-conformances',
    color: 'border-slate-700/80',
    headerBg: 'bg-slate-800/60',
    badgeColor: 'bg-slate-700/80 text-slate-300',
    dotColor: 'bg-slate-400',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Remediation',
    subtitle: 'Active clinical & operational fixes',
    color: 'border-amber-500/40',
    headerBg: 'bg-amber-950/20',
    badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    dotColor: 'bg-amber-400 animate-pulse',
  },
  {
    id: 'UNDER_REVIEW',
    title: 'Under Audit Review',
    subtitle: 'Accreditation verification & DFG check',
    color: 'border-cyan-500/40',
    headerBg: 'bg-cyan-950/20',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    dotColor: 'bg-cyan-400',
  },
  {
    id: 'RESOLVED',
    title: 'Compliant & Verified',
    subtitle: 'Closed CAPAs with audit proof',
    color: 'border-emerald-500/40',
    headerBg: 'bg-emerald-950/20',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    dotColor: 'bg-emerald-400',
  },
];

const PRIORITY_STYLES = {
  CRITICAL: {
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    indicator: 'bg-rose-500',
    label: 'Critical',
  },
  HIGH: {
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    indicator: 'bg-amber-500',
    label: 'High',
  },
  MODERATE: {
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    indicator: 'bg-blue-500',
    label: 'Moderate',
  },
  LOW: {
    badge: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
    indicator: 'bg-slate-400',
    label: 'Low',
  },
};

const STANDARD_COLORS = {
  NABH: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  JCI: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  TJC: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  CDC: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CMS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  GENERAL: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const KanbanBoard = ({ selectedDepartment = 'All' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [deptFilter, setDeptFilter] = useState(selectedDepartment);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [standardFilter, setStandardFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Drag & Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'ICU',
    priority: 'HIGH',
    stage: 'BACKLOG',
    standardCode: 'NABH-COP-01',
    standardBody: 'NABH',
    assigneeName: 'Dr. Sarah Jenkins',
    assigneeRole: 'Accreditation Officer',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    estimatedRiskReduction: 15.0,
    checklists: [
      { text: 'Review EHR compliance audit logs', completed: false },
      { text: 'Implement staff corrective training protocol', completed: false },
    ],
    tags: 'Accreditation, Clinical Safety',
  });

  // Sync selectedDepartment prop if changed externally from Navbar
  useEffect(() => {
    if (selectedDepartment) {
      setDeptFilter(selectedDepartment);
    }
  }, [selectedDepartment]);

  // Load tasks
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchCapaTasks({
        department: deptFilter,
        priority: priorityFilter,
        standard: standardFilter,
        search: searchQuery,
      });
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [deptFilter, priorityFilter, standardFilter, searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = tasks.length;
    const critical = tasks.filter((t) => t.priority === 'CRITICAL' && t.stage !== 'RESOLVED').length;
    const inProgress = tasks.filter((t) => t.stage === 'IN_PROGRESS').length;
    const underReview = tasks.filter((t) => t.stage === 'UNDER_REVIEW').length;
    const resolved = tasks.filter((t) => t.stage === 'RESOLVED').length;
    const totalRiskReduction = tasks.reduce((sum, t) => sum + (Number(t.estimatedRiskReduction) || 0), 0);
    const resolvedRiskReduction = tasks
      .filter((t) => t.stage === 'RESOLVED')
      .reduce((sum, t) => sum + (Number(t.estimatedRiskReduction) || 0), 0);
    const complianceRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    return {
      total,
      critical,
      inProgress,
      underReview,
      resolved,
      complianceRate,
      totalRiskReduction: totalRiskReduction.toFixed(1),
      resolvedRiskReduction: resolvedRiskReduction.toFixed(1),
    };
  }, [tasks]);

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e, columnId) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    // Fast optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, stage: targetColumnId } : t))
    );

    // Call background service
    await updateTaskStage(taskId, targetColumnId);
    setDraggedTaskId(null);
  };

  // Quick move button handlers
  const handleMoveStage = async (taskId, currentStage, direction) => {
    const stageOrder = ['BACKLOG', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < stageOrder.length) {
      const nextStage = stageOrder[targetIndex];
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, stage: nextStage } : t))
      );
      await updateTaskStage(taskId, nextStage);
    }
  };

  // Toggle checklist
  const handleToggleChecklist = async (taskId, itemIndex) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id === taskId || t.id === taskId) {
          const updatedChecklists = [...(t.checklists || [])];
          if (updatedChecklists[itemIndex]) {
            updatedChecklists[itemIndex] = {
              ...updatedChecklists[itemIndex],
              completed: !updatedChecklists[itemIndex].completed,
            };
          }
          return { ...t, checklists: updatedChecklists };
        }
        return t;
      })
    );
    await toggleChecklistItem(taskId, itemIndex);
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this CAPA remediation action?')) {
      setTasks((prev) => prev.filter((t) => t._id !== taskId && t.id !== taskId));
      await deleteCapaTask(taskId);
      showToast('CAPA task removed.');
    }
  };

  // Sync from AI Alerts
  const handleSyncAlerts = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAlertsToKanban();
      await loadTasks();
      showToast(res.message || 'Successfully synced active telemetry alerts to Kanban backlog!');
    } catch (err) {
      showToast('Alert sync complete.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Modal Open
  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      department: deptFilter !== 'All' ? deptFilter : 'ICU',
      priority: 'HIGH',
      stage: 'BACKLOG',
      standardCode: 'NABH-COP-01',
      standardBody: 'NABH',
      assigneeName: 'Dr. Sarah Jenkins',
      assigneeRole: 'Accreditation Officer',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedRiskReduction: 15.0,
      checklists: [
        { text: 'Review EHR compliance audit logs', completed: false },
        { text: 'Implement staff corrective training protocol', completed: false },
      ],
      tags: 'Accreditation, Patient Safety',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      department: task.department || 'ICU',
      priority: task.priority || 'HIGH',
      stage: task.stage || 'BACKLOG',
      standardCode: task.standardCode || 'NABH-COP-01',
      standardBody: task.standardBody || 'NABH',
      assigneeName: task.assignee?.name || 'Dr. Sarah Jenkins',
      assigneeRole: task.assignee?.role || 'Accreditation Officer',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedRiskReduction: task.estimatedRiskReduction || 10.0,
      checklists: task.checklists && task.checklists.length > 0
        ? task.checklists
        : [{ text: 'Follow standard verification protocol', completed: false }],
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : 'CAPA',
    });
    setIsModalOpen(true);
  };

  // Submit Modal Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const initials = formData.assigneeName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const taskPayload = {
      title: formData.title,
      description: formData.description,
      department: formData.department,
      priority: formData.priority,
      stage: formData.stage,
      standardCode: formData.standardCode,
      standardBody: formData.standardBody,
      assignee: {
        name: formData.assigneeName,
        role: formData.assigneeRole,
        avatar: initials || 'SJ',
      },
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString(),
      estimatedRiskReduction: Number(formData.estimatedRiskReduction) || 10.0,
      checklists: formData.checklists.filter((c) => c.text.trim().length > 0),
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (editingTask) {
      const taskId = editingTask._id || editingTask.id;
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, ...taskPayload } : t))
      );
      await updateCapaTask(taskId, taskPayload);
      showToast('CAPA action item updated.');
    } else {
      const created = await createCapaTask(taskPayload);
      setTasks((prev) => [created, ...prev]);
      showToast('New CAPA action item added to board.');
    }

    setIsModalOpen(false);
  };

  // Add checklist row in modal
  const addChecklistRow = () => {
    setFormData((prev) => ({
      ...prev,
      checklists: [...prev.checklists, { text: '', completed: false }],
    }));
  };

  const updateChecklistRow = (index, text) => {
    setFormData((prev) => {
      const updated = [...prev.checklists];
      updated[index].text = text;
      return { ...prev, checklists: updated };
    });
  };

  const removeChecklistRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      checklists: prev.checklists.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-slate-100 font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-cyan-400/40 animate-fade-in">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <KanbanIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Accreditation CAPA & Remediation Kanban
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live Surveillance
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage Corrective and Preventive Actions (CAPA), audit non-conformances, and protocol remediations across all clinical departments.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleSyncAlerts}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Automatically generate CAPA items from active AI process deviations and alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-yellow-400' : 'text-cyan-400'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync AI Audit Alerts'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
            title="Export/Print CAPA plan"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Plan</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New CAPA Action</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total CAPAs</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">{metrics.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across all hospital units</div>
        </div>

        <div className="bg-slate-900/80 border border-rose-900/30 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-300 text-xs font-medium">
            <span>Critical Deficits</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-300 mt-2">{metrics.critical}</div>
          <div className="text-[10px] text-rose-400/70 mt-0.5">Immediate action required</div>
        </div>

        <div className="bg-slate-900/80 border border-amber-900/30 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
            <span>In Remediation</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 mt-2">{metrics.inProgress}</div>
          <div className="text-[10px] text-amber-400/70 mt-0.5">Active intervention</div>
        </div>

        <div className="bg-slate-900/80 border border-cyan-900/30 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-300 text-xs font-medium">
            <span>Under Review</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 mt-2">{metrics.underReview}</div>
          <div className="text-[10px] text-cyan-400/70 mt-0.5">Accreditation sign-off</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-900/30 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-medium">
            <span>Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 mt-2">{metrics.complianceRate}%</div>
          <div className="text-[10px] text-emerald-400/70 mt-0.5">{metrics.resolved} verified closed</div>
        </div>

        <div className="bg-slate-900/80 border border-indigo-900/30 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-300 text-xs font-medium">
            <span>Risk Mitigated</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-300 mt-2">-{metrics.resolvedRiskReduction} <span className="text-xs text-indigo-400/70">/ -{metrics.totalRiskReduction} pts</span></div>
          <div className="text-[10px] text-indigo-400/70 mt-0.5">Composite risk reduction</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search CAPAs by title, protocol, standard code (e.g. NABH-COP-01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Units</option>
              <option value="ICU" className="bg-slate-900 text-slate-200">ICU</option>
              <option value="Emergency" className="bg-slate-900 text-slate-200">Emergency</option>
              <option value="Cardiology" className="bg-slate-900 text-slate-200">Cardiology</option>
              <option value="Surgery" className="bg-slate-900 text-slate-200">Surgery</option>
              <option value="Pediatrics" className="bg-slate-900 text-slate-200">Pediatrics</option>
              <option value="General" className="bg-slate-900 text-slate-200">General Ward</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 text-[11px]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Priorities</option>
              <option value="CRITICAL" className="bg-slate-900 text-rose-400">Critical</option>
              <option value="HIGH" className="bg-slate-900 text-amber-400">High</option>
              <option value="MODERATE" className="bg-slate-900 text-blue-400">Moderate</option>
              <option value="LOW" className="bg-slate-900 text-slate-400">Low</option>
            </select>
          </div>

          {/* Standard Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Standard:</span>
            <select
              value={standardFilter}
              onChange={(e) => setStandardFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Standards</option>
              <option value="NABH" className="bg-slate-900 text-indigo-300">NABH</option>
              <option value="JCI" className="bg-slate-900 text-cyan-300">JCI</option>
              <option value="TJC" className="bg-slate-900 text-purple-300">TJC</option>
              <option value="CDC" className="bg-slate-900 text-emerald-300">CDC / NHSN</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => t.stage === column.id);
            const isTarget = dragOverColumn === column.id;

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={(e) => handleDragLeave(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex flex-col rounded-2xl bg-slate-900/60 border ${
                  isTarget ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-850/80' : column.color
                } transition-all duration-150 min-h-[550px] shadow-lg`}
              >
                {/* Column Header */}
                <div className={`p-3.5 rounded-t-2xl border-b border-slate-800/80 ${column.headerBg} flex items-center justify-between`}>
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                    <div>
                      <h2 className="text-xs font-bold text-white tracking-wide uppercase">{column.title}</h2>
                      <p className="text-[10px] text-slate-400">{column.subtitle}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${column.badgeColor}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards Drop Area */}
                <div className="p-3 flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {columnTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800/60 rounded-xl m-1">
                      <ShieldCheck className="w-8 h-8 text-slate-700 mb-2 stroke-1" />
                      <p className="text-xs text-slate-500 font-medium">No actions in this stage</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Drag tasks here or create new</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const taskId = task._id || task.id;
                      const priorityInfo = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MODERATE;
                      const standardTagColor = STANDARD_COLORS[task.standardBody] || STANDARD_COLORS.GENERAL;
                      const totalChecklist = task.checklists?.length || 0;
                      const completedChecklist = task.checklists?.filter((c) => c.completed).length || 0;
                      const isOverdue =
                        task.dueDate &&
                        task.stage !== 'RESOLVED' &&
                        new Date(task.dueDate) < new Date();

                      return (
                        <div
                          key={taskId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, taskId)}
                          className={`bg-slate-950/80 hover:bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3.5 shadow-md transition-all cursor-grab active:cursor-grabbing hover:shadow-cyan-900/10 ${
                            draggedTaskId === taskId ? 'opacity-40 scale-98' : ''
                          }`}
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              {/* Priority */}
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityInfo.badge}`}>
                                {priorityInfo.label}
                              </span>

                              {/* Department */}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                {task.department}
                              </span>

                              {/* Standard Code */}
                              {task.standardCode && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${standardTagColor}`}>
                                  {task.standardCode}
                                </span>
                              )}
                            </div>

                            {/* Estimated Risk Reduction */}
                            {task.estimatedRiskReduction && (
                              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 flex items-center gap-0.5 shrink-0" title="Projected composite risk score reduction upon completion">
                                <Zap className="w-2.5 h-2.5" />
                                -{task.estimatedRiskReduction}
                              </span>
                            )}
                          </div>

                          {/* Task Title */}
                          <h3 className="text-xs font-bold text-white leading-snug hover:text-cyan-300 transition-colors">
                            {task.title}
                          </h3>

                          {/* Description */}
                          {task.description && (
                            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Checklists */}
                          {totalChecklist > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-850 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                                <span className="flex items-center gap-1">
                                  <CheckSquare className="w-3 h-3 text-cyan-400" />
                                  Protocol Checkpoints
                                </span>
                                <span>
                                  {completedChecklist}/{totalChecklist} ({Math.round((completedChecklist / totalChecklist) * 100)}%)
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                                  style={{
                                    width: `${totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0}%`,
                                  }}
                                />
                              </div>

                              {/* Checklist item toggles */}
                              <div className="space-y-1">
                                {task.checklists.map((chk, cIdx) => (
                                  <div
                                    key={cIdx}
                                    onClick={() => handleToggleChecklist(taskId, cIdx)}
                                    className="flex items-start space-x-2 text-[11px] cursor-pointer group py-0.5"
                                  >
                                    <button
                                      type="button"
                                      className="mt-0.5 text-slate-500 group-hover:text-cyan-400 shrink-0"
                                    >
                                      {chk.completed ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-slate-600" />
                                      )}
                                    </button>
                                    <span
                                      className={`leading-tight ${
                                        chk.completed
                                          ? 'line-through text-slate-500'
                                          : 'text-slate-300 group-hover:text-white'
                                      }`}
                                    >
                                      {chk.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Footer: Assignee & Date & Fast Actions */}
                          <div className="mt-3.5 pt-2.5 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                            {/* Assignee Avatar */}
                            <div className="flex items-center space-x-1.5">
                              <div className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 flex items-center justify-center font-bold text-[9px]">
                                {task.assignee?.avatar || 'SJ'}
                              </div>
                              <span className="truncate max-w-[90px] text-[10px] text-slate-300 font-medium">
                                {task.assignee?.name?.split(' ')[0] || 'Officer'}
                              </span>
                            </div>

                            {/* Due date */}
                            {task.dueDate && (
                              <div
                                className={`flex items-center space-x-1 text-[10px] ${
                                  isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                                }`}
                                title={isOverdue ? 'Action item overdue!' : 'Target completion date'}
                              >
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}

                            {/* Quick Controls */}
                            <div className="flex items-center space-x-1">
                              {/* Move Left */}
                              {column.id !== 'BACKLOG' && (
                                <button
                                  onClick={() => handleMoveStage(taskId, task.stage, 'prev')}
                                  title="Move to previous stage"
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}

                              {/* Move Right */}
                              {column.id !== 'RESOLVED' && (
                                <button
                                  onClick={() => handleMoveStage(taskId, task.stage, 'next')}
                                  title="Advance to next stage"
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}

                              {/* Edit */}
                              <button
                                onClick={() => openEditModal(task)}
                                title="Edit Task"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteTask(taskId)}
                                title="Delete Task"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed List / Table View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Action Item / CAPA Title</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Standard Ref</th>
                  <th className="px-4 py-3.5">Workflow Stage</th>
                  <th className="px-4 py-3.5">Risk Impact</th>
                  <th className="px-4 py-3.5">Checkpoints</th>
                  <th className="px-4 py-3.5">Assignee</th>
                  <th className="px-4 py-3.5">Target Due</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                      No CAPA action items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const taskId = task._id || task.id;
                    const priorityInfo = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MODERATE;
                    const col = COLUMNS.find((c) => c.id === task.stage) || COLUMNS[0];
                    const totalCheck = task.checklists?.length || 0;
                    const compCheck = task.checklists?.filter((c) => c.completed).length || 0;

                    return (
                      <tr key={taskId} className="hover:bg-slate-850/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white max-w-sm">{task.title}</div>
                          {task.description && (
                            <div className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold">
                            {task.department}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityInfo.badge}`}>
                            {priorityInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-cyan-300 text-[11px] font-bold">
                            {task.standardCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeColor}`}>
                            {col.title}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-emerald-400 font-bold">-{task.estimatedRiskReduction} pts</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[11px] text-slate-300">
                              {compCheck}/{totalCheck}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${totalCheck > 0 ? (compCheck / totalCheck) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[11px] text-slate-200 font-semibold">{task.assignee?.name}</div>
                          <div className="text-[9px] text-slate-500">{task.assignee?.role}</div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-400">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(taskId)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <KanbanIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTask ? 'Edit Accreditation CAPA Action' : 'Create New CAPA Action Item'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specify protocol remediation, compliance standards, and checkpoints.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Action Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandate Barcode Verification for Sepsis Antibiotics"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Department, Priority & Stage Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ICU">ICU</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General">General Ward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Priority Severity
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Workflow Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BACKLOG">Audit Backlog</option>
                    <option value="IN_PROGRESS">In Remediation</option>
                    <option value="UNDER_REVIEW">Under Audit Review</option>
                    <option value="RESOLVED">Compliant & Closed</option>
                  </select>
                </div>
              </div>

              {/* Standard Code, Standard Body, Risk Reduction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Standard Body
                  </label>
                  <select
                    value={formData.standardBody}
                    onChange={(e) => setFormData({ ...formData, standardBody: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NABH">NABH (5th Edition)</option>
                    <option value="JCI">JCI (7th Edition)</option>
                    <option value="TJC">The Joint Commission</option>
                    <option value="CDC">CDC NHSN</option>
                    <option value="CMS">CMS Hospital Compare</option>
                    <option value="GENERAL">General Hospital Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Standard Code Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NABH-COP-01"
                    value={formData.standardCode}
                    onChange={(e) => setFormData({ ...formData, standardCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Est. Risk Reduction (pts)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.estimatedRiskReduction}
                    onChange={(e) => setFormData({ ...formData, estimatedRiskReduction: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Assignee Officer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={formData.assigneeName}
                    onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Detailed Findings & Corrective Action
                </label>
                <textarea
                  rows="3"
                  placeholder="Root cause, clinical deviation observed, and required intervention protocol..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Dynamic Checklist Checkpoints */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Protocol Implementation Checkpoints
                  </label>
                  <button
                    type="button"
                    onClick={addChecklistRow}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Checkpoint</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.checklists.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckSquare className="w-4 h-4 text-cyan-500 shrink-0" />
                      <input
                        type="text"
                        placeholder={`Checkpoint #${idx + 1}`}
                        value={item.text}
                        onChange={(e) => updateChecklistRow(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      {formData.checklists.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChecklistRow(idx)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sepsis, Barcode, Patient Safety, ICU"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  {editingTask ? 'Save Changes' : 'Create CAPA Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
