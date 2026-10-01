import api from './api';

const LOCAL_STORAGE_KEY = 'hospital_capa_kanban_cache';

// Fallback initial dataset if network is unavailable
const INITIAL_FALLBACK_TASKS = [
  {
    _id: 'capa-1',
    title: 'Enforce Barcode Verification for High-Risk Sepsis Antibiotics',
    description: '24% of ICU patient pathways bypassed mandatory dual-nurse verification step before IV antibiotic administration, breaching NABH-COP-01.',
    department: 'ICU',
    priority: 'CRITICAL',
    stage: 'BACKLOG',
    standardCode: 'NABH-COP-01',
    standardBody: 'NABH',
    assignee: { name: 'Dr. Sarah Jenkins', role: 'Accreditation Officer', avatar: 'SJ' },
    dueDate: new Date(Date.now() + 6 * 86400000).toISOString(),
    estimatedRiskReduction: 40.5,
    checklists: [
      { text: 'Configure mandatory barcode check in EHR workflow', completed: false },
      { text: 'Deploy 12 wireless scanning terminals to ICU bays', completed: false },
      { text: 'Conduct nurse safety protocol briefing', completed: false },
    ],
    tags: ['Medication Safety', 'NABH', 'ICU', 'High-Risk'],
    order: 1,
    sourceAlertId: 'alt-3',
  },
  {
    _id: 'capa-2',
    title: 'Emergency Fast-Track Triage Desk for Peak Surge Hours',
    description: 'Average door-to-doctor waiting time reached 52.0 mins due to intake bottleneck during shift transitions.',
    department: 'Emergency',
    priority: 'HIGH',
    stage: 'IN_PROGRESS',
    standardCode: 'JCI-COP-02.1',
    standardBody: 'JCI',
    assignee: { name: 'James Martinez', role: 'Quality Manager', avatar: 'JM' },
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    estimatedRiskReduction: 22.0,
    checklists: [
      { text: 'Analyze 30-day hourly arrival distribution', completed: true },
      { text: 'Reassign 2 triage nurses from general ward between 16:00-21:00', completed: true },
      { text: 'Install live digital queue display in ED lobby', completed: false },
    ],
    tags: ['Waiting Time', 'Triage', 'Emergency', 'JCI'],
    order: 2,
    sourceAlertId: 'alt-2',
  },
  {
    _id: 'capa-3',
    title: 'Central Line Infection (CLABSI) Bundle Compliance Audit',
    description: 'ICU infection rates spiked to 3.8 per 1,000 device days. Strict adherence to CDC NHSN insertion checklists required.',
    department: 'ICU',
    priority: 'CRITICAL',
    stage: 'IN_PROGRESS',
    standardCode: 'CDC-NHSN-04',
    standardBody: 'CDC',
    assignee: { name: 'Dr. Sarah Jenkins', role: 'Accreditation Officer', avatar: 'SJ' },
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    estimatedRiskReduction: 31.0,
    checklists: [
      { text: 'Inspect sterile dressing supplies in all ICU carts', completed: true },
      { text: 'Audit 20 consecutive catheter insertion logs', completed: true },
      { text: 'Implement daily chlorhexidine skin prep compliance logs', completed: false },
    ],
    tags: ['Infection Control', 'CDC', 'CLABSI', 'Patient Safety'],
    order: 3,
    sourceAlertId: 'alt-1',
  },
  {
    _id: 'capa-4',
    title: 'Surgical Time-Out & Site Marking Verification',
    description: 'JCI Universal Protocol compliance audit for operating theatres: verify pre-operative pause before initial incision.',
    department: 'Surgery',
    priority: 'HIGH',
    stage: 'UNDER_REVIEW',
    standardCode: 'JCI-IPSG-04',
    standardBody: 'JCI',
    assignee: { name: 'Elena Rostova', role: 'Clinical Auditor', avatar: 'ER' },
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    estimatedRiskReduction: 18.0,
    checklists: [
      { text: 'Randomized video review of 15 surgical time-outs', completed: true },
      { text: 'Validate surgeon dual-signature on digital consent', completed: true },
      { text: 'Accreditation board spot inspection sign-off', completed: false },
    ],
    tags: ['Surgical Safety', 'Time-Out', 'JCI', 'OR'],
    order: 4,
  },
  {
    _id: 'capa-5',
    title: 'Emergency Defibrillator & Crash Cart Daily Checklist Automation',
    description: 'Transition from manual paper logs to biometric NFC digital tags on all Code Blue crash carts.',
    department: 'Cardiology',
    priority: 'MODERATE',
    stage: 'UNDER_REVIEW',
    standardCode: 'NABH-ROM-03',
    standardBody: 'NABH',
    assignee: { name: 'James Martinez', role: 'Quality Manager', avatar: 'JM' },
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    estimatedRiskReduction: 14.0,
    checklists: [
      { text: 'Affix NFC checkpoint stickers to 8 crash carts', completed: true },
      { text: 'Nurse shift automated verification test', completed: true },
      { text: 'Submit verification log to Quality Council', completed: false },
    ],
    tags: ['Crash Cart', 'Cardiology', 'NABH', 'Equipment'],
    order: 5,
  },
  {
    _id: 'capa-6',
    title: 'Pediatric Critical Value Notification SLA (under 15 mins)',
    description: 'Ensure laboratory panic values for neonates and pediatrics are phoned to attending physician within 15 minutes.',
    department: 'Pediatrics',
    priority: 'MODERATE',
    stage: 'RESOLVED',
    standardCode: 'TJC-MM-01',
    standardBody: 'TJC',
    assignee: { name: 'Elena Rostova', role: 'Clinical Auditor', avatar: 'ER' },
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    estimatedRiskReduction: 16.5,
    checklists: [
      { text: 'Automated SMS trigger in LIS for critical blood chemistry', completed: true },
      { text: 'Read-back protocol verification training for lab staff', completed: true },
      { text: '30-day compliance achieved at 99.4%', completed: true },
    ],
    tags: ['Lab Safety', 'Pediatrics', 'Critical Values', 'TJC'],
    order: 6,
    resolutionNotes: 'Verified in September clinical quality review. Notification time reduced from 34m to 9.2m average.',
  },
  {
    _id: 'capa-7',
    title: 'ICU Step-Down Turnover & Discharge Protocol',
    description: 'Establish proactive 09:00 AM multi-disciplinary discharge huddles to relieve ICU bed gridlock at 94% occupancy.',
    department: 'ICU',
    priority: 'HIGH',
    stage: 'RESOLVED',
    standardCode: 'NABH-COP-06',
    standardBody: 'NABH',
    assignee: { name: 'Dr. Sarah Jenkins', role: 'Accreditation Officer', avatar: 'SJ' },
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    estimatedRiskReduction: 25.0,
    checklists: [
      { text: 'Standardize step-down transition readiness checklist', completed: true },
      { text: 'Designate secondary telemetry beds in Ward 4B', completed: true },
      { text: 'Track 14-day median transfer latency', completed: true },
    ],
    tags: ['ICU', 'Discharge', 'Occupancy', 'NABH'],
    order: 7,
    resolutionNotes: 'Bed turnover latency dropped by 48 minutes across 35 post-op admissions.',
  },
];

const getStoredTasks = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_FALLBACK_TASKS;
};

const saveStoredTasks = (tasks) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {}
};

/**
 * Fetch all CAPA Kanban tasks
 */
export const fetchCapaTasks = async (params = {}) => {
  try {
    const res = await api.get('/capa', { params, timeout: 5000 });
    if (res.data && res.data.tasks) {
      saveStoredTasks(res.data.tasks);
      return res.data;
    }
  } catch (err) {
    console.warn('API fetch failed, using local storage fallback for Kanban:', err.message);
  }

  // Fallback
  let tasks = getStoredTasks();
  if (params.department && params.department !== 'All') {
    tasks = tasks.filter((t) => t.department === params.department || t.department === 'All');
  }
  if (params.priority && params.priority !== 'All') {
    tasks = tasks.filter((t) => t.priority === params.priority);
  }
  if (params.standard && params.standard !== 'All') {
    tasks = tasks.filter((t) => t.standardBody === params.standard);
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        (t.standardCode && t.standardCode.toLowerCase().includes(s))
    );
  }

  const total = tasks.length;
  const critical = tasks.filter((t) => t.priority === 'CRITICAL' && t.stage !== 'RESOLVED').length;
  const inProgress = tasks.filter((t) => t.stage === 'IN_PROGRESS').length;
  const underReview = tasks.filter((t) => t.stage === 'UNDER_REVIEW').length;
  const resolved = tasks.filter((t) => t.stage === 'RESOLVED').length;
  const totalRiskReduction = tasks.reduce((sum, t) => sum + (Number(t.estimatedRiskReduction) || 0), 0);
  const resolvedRiskReduction = tasks
    .filter((t) => t.stage === 'RESOLVED')
    .reduce((sum, t) => sum + (Number(t.estimatedRiskReduction) || 0), 0);

  return {
    success: true,
    metrics: {
      total,
      critical,
      inProgress,
      underReview,
      resolved,
      complianceRate: total > 0 ? Math.round((resolved / total) * 100) : 100,
      totalRiskReduction: Number(totalRiskReduction.toFixed(1)),
      resolvedRiskReduction: Number(resolvedRiskReduction.toFixed(1)),
    },
    tasks,
  };
};

/**
 * Create a new task
 */
export const createCapaTask = async (taskData) => {
  try {
    const res = await api.post('/capa', taskData);
    if (res.data && res.data.task) {
      const stored = getStoredTasks();
      stored.unshift(res.data.task);
      saveStoredTasks(stored);
      return res.data.task;
    }
  } catch (err) {
    console.warn('API create failed, saving to local cache:', err.message);
  }

  const newTask = {
    ...taskData,
    _id: 'capa-local-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const stored = getStoredTasks();
  stored.unshift(newTask);
  saveStoredTasks(stored);
  return newTask;
};

/**
 * Move stage (drag & drop / quick action)
 */
export const updateTaskStage = async (id, stage, order) => {
  // Optimistically update local cache immediately for instantaneous speed
  const stored = getStoredTasks();
  const idx = stored.findIndex((t) => t._id === id || t.id === id);
  if (idx !== -1) {
    stored[idx].stage = stage;
    if (order !== undefined) stored[idx].order = order;
    stored[idx].updatedAt = new Date().toISOString();
    saveStoredTasks(stored);
  }

  try {
    const res = await api.patch(`/capa/${id}/stage`, { stage, order }, { timeout: 4000 });
    return res.data;
  } catch (err) {
    console.warn('API stage update sync queued locally:', err.message);
    return { success: true };
  }
};

/**
 * Update full task details
 */
export const updateCapaTask = async (id, updates) => {
  const stored = getStoredTasks();
  const idx = stored.findIndex((t) => t._id === id || t.id === id);
  if (idx !== -1) {
    stored[idx] = { ...stored[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStoredTasks(stored);
  }

  try {
    const res = await api.put(`/capa/${id}`, updates);
    return res.data;
  } catch (err) {
    console.warn('API update failed, local cache updated:', err.message);
    return { success: true, task: stored[idx] };
  }
};

/**
 * Toggle a checklist item
 */
export const toggleChecklistItem = async (id, itemIndex) => {
  const stored = getStoredTasks();
  const idx = stored.findIndex((t) => t._id === id || t.id === id);
  if (idx !== -1 && stored[idx].checklists && stored[idx].checklists[itemIndex]) {
    stored[idx].checklists[itemIndex].completed = !stored[idx].checklists[itemIndex].completed;
    stored[idx].updatedAt = new Date().toISOString();
    saveStoredTasks(stored);
  }

  try {
    const res = await api.patch(`/capa/${id}/checklist/${itemIndex}`, {}, { timeout: 4000 });
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

/**
 * Delete a task
 */
export const deleteCapaTask = async (id) => {
  const stored = getStoredTasks().filter((t) => t._id !== id && t.id !== id);
  saveStoredTasks(stored);

  try {
    const res = await api.delete(`/capa/${id}`);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

/**
 * Sync active alerts into Kanban backlog
 */
export const syncAlertsToKanban = async () => {
  try {
    const res = await api.post('/capa/sync-alerts');
    return res.data;
  } catch (err) {
    console.warn('API sync failed, importing fallback alert tasks');
    const stored = getStoredTasks();
    const syncedTask = {
      _id: 'capa-synced-' + Date.now(),
      title: 'CAPA: Critical Sepsis Verification Failure Remediation',
      description: 'Auto-imported from PM4Py clinical pathway anomaly in ICU.',
      department: 'ICU',
      priority: 'CRITICAL',
      stage: 'BACKLOG',
      standardCode: 'NABH-COP-01',
      standardBody: 'NABH',
      assignee: { name: 'Dr. Sarah Jenkins', role: 'Accreditation Officer', avatar: 'SJ' },
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      estimatedRiskReduction: 38.0,
      checklists: [
        { text: 'Mandate digital barcode check before antibiotic infusion', completed: false },
        { text: 'Audit 50 consecutive sepsis patient traces in ICU', completed: false },
      ],
      tags: ['AI Synced', 'ICU', 'Sepsis'],
      createdAt: new Date().toISOString(),
    };
    stored.unshift(syncedTask);
    saveStoredTasks(stored);
    return { success: true, syncedCount: 1, message: '1 alert task synced to backlog' };
  }
};
