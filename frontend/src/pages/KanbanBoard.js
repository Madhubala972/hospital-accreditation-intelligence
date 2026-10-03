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
  ShieldCheck,
  Trash2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Printer,
  CheckSquare,
  Square,
  Layers,
  Award,
  Zap,
  X,
  SlidersHorizontal,
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
    title: 'Audit Backlog',
    subtitle: 'Identified gaps & non-conformances',
    border: 'border-slate-800',
    headerBg: 'bg-slate-900/90',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Remediation',
    subtitle: 'Active clinical & staff fixes',
    border: 'border-amber-500/30',
    headerBg: 'bg-amber-950/20',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400 animate-pulse',
  },
  {
    id: 'UNDER_REVIEW',
    title: 'Under Audit Review',
    subtitle: 'Officer validation & DFG check',
    border: 'border-cyan-500/30',
    headerBg: 'bg-cyan-950/20',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  {
    id: 'RESOLVED',
    title: 'Compliant & Closed',
    subtitle: 'Verified closed with audit trail',
    border: 'border-emerald-500/30',
    headerBg: 'bg-emerald-950/20',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
];

const PRIORITY_THEMES = {
  CRITICAL: {
    badge: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    label: 'Critical Priority',
  },
  HIGH: {
    badge: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    label: 'High Priority',
  },
  MODERATE: {
    badge: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
    label: 'Moderate',
  },
  LOW: {
    badge: 'bg-slate-500/10 text-slate-300 border border-slate-700',
    label: 'Low',
  },
};

const STANDARD_BADGES = {
  NABH: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30',
  JCI: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
  TJC: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
  CDC: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  CMS: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
  GENERAL: 'bg-slate-800 text-slate-300 border border-slate-700',
};

const KanbanBoard = ({ selectedDepartment = 'All' }) => {
  const [tasks, setTasks] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [deptFilter, setDeptFilter] = useState(selectedDepartment);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [standardFilter, setStandardFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Drag & Drop
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
    tags: 'Accreditation, Patient Safety',
  });

  useEffect(() => {
    if (selectedDepartment) {
      setDeptFilter(selectedDepartment);
    }
  }, [selectedDepartment]);

  const loadTasks = async () => {
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
    }
  };

  useEffect(() => {
    loadTasks();
  }, [deptFilter, priorityFilter, standardFilter, searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
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

  // Drag & Drop
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) setDragOverColumn(columnId);
  };

  const handleDragLeave = (e, columnId) => {
    if (dragOverColumn === columnId) setDragOverColumn(null);
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, stage: targetColumnId } : t))
    );

    await updateTaskStage(taskId, targetColumnId);
    setDraggedTaskId(null);
  };

  const handleMoveStage = async (taskId, currentStage, direction) => {
    const stageOrder = ['BACKLOG', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < stageOrder.length) {
      const nextStage = stageOrder[targetIndex];
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, stage: nextStage } : t))
      );
      await updateTaskStage(taskId, nextStage);
    }
  };

  const handleToggleChecklist = async (taskId, itemIndex) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id === taskId || t.id === taskId) {
          const updated = [...(t.checklists || [])];
          if (updated[itemIndex]) {
            updated[itemIndex] = {
              ...updated[itemIndex],
              completed: !updated[itemIndex].completed,
            };
          }
          return { ...t, checklists: updated };
        }
        return t;
      })
    );
    await toggleChecklistItem(taskId, itemIndex);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this remediation action?')) {
      setTasks((prev) => prev.filter((t) => t._id !== taskId && t.id !== taskId));
      await deleteCapaTask(taskId);
      showToast('Action item removed.');
    }
  };

  const handleSyncAlerts = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAlertsToKanban();
      await loadTasks();
      showToast(res.message || 'Synced active alerts to Kanban backlog.');
    } catch (err) {
      showToast('Sync complete.');
    } finally {
      setIsSyncing(false);
    }
  };

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
      showToast('Action item updated.');
    } else {
      const created = await createCapaTask(taskPayload);
      setTasks((prev) => [created, ...prev]);
      showToast('New action item added to board.');
    }

    setIsModalOpen(false);
  };

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-cyan-400/40 animate-fade-in">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <KanbanIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Accreditation Action Board (CAPA)
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Track hospital safety improvements, protocol fixes, and audit tasks simply and clearly.
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncAlerts}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-yellow-400' : 'text-cyan-400'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync AI Alerts'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Action Item</span>
          </button>
        </div>
      </div>

      {/* Clean, Spacious 4-Card Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Actions</p>
            <p className="text-3xl font-bold text-white mt-1">{metrics.total}</p>
            <p className="text-xs text-slate-500 mt-1">Across all departments</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 text-slate-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* In Remediation */}
        <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-300/80 uppercase tracking-wider">In Remediation</p>
            <p className="text-3xl font-bold text-amber-300 mt-1">{metrics.inProgress}</p>
            <p className="text-xs text-amber-400/60 mt-1">Active staff interventions</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-300/80 uppercase tracking-wider">Compliance Rate</p>
            <p className="text-3xl font-bold text-emerald-300 mt-1">{metrics.complianceRate}%</p>
            <p className="text-xs text-emerald-400/60 mt-1">{metrics.resolved} verified completed</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Risk Points Mitigated */}
        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-cyan-300/80 uppercase tracking-wider">Risk Mitigated</p>
            <p className="text-3xl font-bold text-cyan-300 mt-1">-{metrics.resolvedRiskReduction} <span className="text-sm font-normal text-cyan-400/60">pts</span></p>
            <p className="text-xs text-cyan-400/60 mt-1">Total score reduction</p>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Clean Filter and Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action items by title, protocol, or standard (e.g. NABH-COP-01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Department Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Units</option>
              <option value="ICU" className="bg-slate-900">ICU</option>
              <option value="Emergency" className="bg-slate-900">Emergency</option>
              <option value="Cardiology" className="bg-slate-900">Cardiology</option>
              <option value="Surgery" className="bg-slate-900">Surgery</option>
              <option value="Pediatrics" className="bg-slate-900">Pediatrics</option>
              <option value="General" className="bg-slate-900">General Ward</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Priorities</option>
              <option value="CRITICAL" className="bg-slate-900 text-rose-400">Critical</option>
              <option value="HIGH" className="bg-slate-900 text-amber-400">High</option>
              <option value="MODERATE" className="bg-slate-900 text-blue-400">Moderate</option>
              <option value="LOW" className="bg-slate-900 text-slate-400">Low</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Board View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Main 4-Column Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => t.stage === column.id);
            const isTarget = dragOverColumn === column.id;

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={(e) => handleDragLeave(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex flex-col rounded-3xl bg-slate-900/40 border ${
                  isTarget ? 'border-cyan-400 ring-4 ring-cyan-500/20 bg-slate-900/80' : column.border
                } transition-all duration-150 min-h-[600px] shadow-sm`}
              >
                {/* Column Header */}
                <div className={`p-5 rounded-t-3xl border-b border-slate-800/80 ${column.headerBg} flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${column.dot}`} />
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-wide">{column.title}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{column.subtitle}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${column.badge}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-800/60 rounded-2xl m-2">
                      <ShieldCheck className="w-10 h-10 text-slate-700 mb-2 stroke-1" />
                      <p className="text-sm text-slate-500 font-medium">No actions here</p>
                      <p className="text-xs text-slate-600 mt-1">Drag an item here to update stage</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const taskId = task._id || task.id;
                      const priorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.MODERATE;
                      const standardBadge = STANDARD_BADGES[task.standardBody] || STANDARD_BADGES.GENERAL;
                      const totalChecklist = task.checklists?.length || 0;
                      const completedChecklist = task.checklists?.filter((c) => c.completed).length || 0;

                      return (
                        <div
                          key={taskId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, taskId)}
                          className={`bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                            draggedTaskId === taskId ? 'opacity-40 scale-95' : ''
                          }`}
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                              {/* Priority Badge */}
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${priorityTheme.badge}`}>
                                {priorityTheme.label}
                              </span>

                              {/* Department */}
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
                                {task.department}
                              </span>

                              {/* Standard Code */}
                              {task.standardCode && (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${standardBadge}`}>
                                  {task.standardCode}
                                </span>
                              )}
                            </div>

                            {/* Risk Reduction Badge */}
                            {task.estimatedRiskReduction && (
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/40 flex items-center gap-1 shrink-0">
                                <Zap className="w-3 h-3" />
                                -{task.estimatedRiskReduction} pts
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-bold text-white leading-snug hover:text-cyan-300 transition-colors">
                            {task.title}
                          </h3>

                          {/* Description */}
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Checklists */}
                          {totalChecklist > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                                <span className="flex items-center gap-1.5">
                                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                                  Checkpoints
                                </span>
                                <span>
                                  {completedChecklist}/{totalChecklist}
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
                              <div className="space-y-1.5">
                                {task.checklists.map((chk, cIdx) => (
                                  <div
                                    key={cIdx}
                                    onClick={() => handleToggleChecklist(taskId, cIdx)}
                                    className="flex items-start space-x-2.5 text-xs cursor-pointer group py-0.5"
                                  >
                                    <button
                                      type="button"
                                      className="mt-0.5 text-slate-500 group-hover:text-cyan-400 shrink-0"
                                    >
                                      {chk.completed ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-600" />
                                      )}
                                    </button>
                                    <span
                                      className={`leading-relaxed ${
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

                          {/* Footer */}
                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                            {/* Assignee */}
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 flex items-center justify-center font-bold text-[10px]">
                                {task.assignee?.avatar || 'SJ'}
                              </div>
                              <span className="text-xs text-slate-300 font-medium truncate max-w-[100px]">
                                {task.assignee?.name?.split(' ')[0] || 'Officer'}
                              </span>
                            </div>

                            {/* Due Date */}
                            {task.dueDate && (
                              <div className="flex items-center space-x-1 text-xs text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}

                            {/* Move and Edit Buttons */}
                            <div className="flex items-center space-x-1.5">
                              {column.id !== 'BACKLOG' && (
                                <button
                                  onClick={() => handleMoveStage(taskId, task.stage, 'prev')}
                                  title="Move to previous stage"
                                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {column.id !== 'RESOLVED' && (
                                <button
                                  onClick={() => handleMoveStage(taskId, task.stage, 'next')}
                                  title="Advance to next stage"
                                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => openEditModal(task)}
                                title="Edit"
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteTask(taskId)}
                                title="Delete"
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        /* Detailed Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-5 py-4">Action Item Title</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Standard Code</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">Risk Impact</th>
                  <th className="px-5 py-4">Assignee</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.map((task) => {
                  const taskId = task._id || task.id;
                  const priorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.MODERATE;
                  const col = COLUMNS.find((c) => c.id === task.stage) || COLUMNS[0];

                  return (
                    <tr key={taskId} className="hover:bg-slate-850/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white max-w-sm">
                        {task.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                          {task.department}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg font-bold ${priorityTheme.badge}`}>
                          {priorityTheme.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-cyan-300 font-bold">
                        {task.standardCode}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-3 py-1 rounded-full font-bold border ${col.badge}`}>
                          {col.title}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-emerald-400 font-bold">
                        -{task.estimatedRiskReduction} pts
                      </td>
                      <td className="px-5 py-3.5 text-slate-200">
                        {task.assignee?.name}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(taskId)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clean Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-850 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit Action Item' : 'New Action Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Action Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandate Barcode Verification in ICU"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Root cause and corrective action protocol..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Dynamic Checkpoints */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Checkpoints
                  </label>
                  <button
                    type="button"
                    onClick={addChecklistRow}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.checklists.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Step #${idx + 1}`}
                        value={item.text}
                        onChange={(e) => updateChecklistRow(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      {formData.checklists.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChecklistRow(idx)}
                          className="p-2 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
                >
                  {editingTask ? 'Save Changes' : 'Create Action'}
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
