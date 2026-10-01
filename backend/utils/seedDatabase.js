const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const HospitalMetric = require('../models/HospitalMetric');
const PatientPathway = require('../models/PatientPathway');
const AccreditationStandard = require('../models/AccreditationStandard');
const Benchmark = require('../models/Benchmark');
const Simulation = require('../models/Simulation');
const Alert = require('../models/Alert');
const CapaPlan = require('../models/CapaPlan');
const logger = require('./logger');

const readJson = (fileName) => {
  const p = path.join(__dirname, '../../database', fileName);
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  return [];
};

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_accreditation';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connected for Seeding.');

    // 1. Seed Users
    await User.deleteMany({});
    const users = [
      { name: 'Dr. Sarah Jenkins', email: 'officer@hospital.org', password: 'password123', role: 'Accreditation Officer', department: 'Quality & Accreditation' },
      { name: 'Admin Administrator', email: 'admin@hospital.org', password: 'password123', role: 'Admin', department: 'Executive Management' },
      { name: 'James Martinez', email: 'quality@hospital.org', password: 'password123', role: 'Quality Manager', department: 'Clinical Quality' },
      { name: 'Elena Rostova', email: 'analyst@hospital.org', password: 'password123', role: 'Analyst', department: 'Data Intelligence' }
    ];
    for (const u of users) {
      await User.create(u);
    }
    console.log(`Seeded ${users.length} Users.`);

    // 2. Seed Metrics
    await HospitalMetric.deleteMany({});
    const metricsData = readJson('sample_metrics.json');
    if (metricsData.length > 0) {
      await HospitalMetric.insertMany(metricsData);
      console.log(`Seeded ${metricsData.length} Hospital Metrics.`);
    }

    // 3. Seed Pathways
    await PatientPathway.deleteMany({});
    const pathwaysData = readJson('sample_pathways.json');
    if (pathwaysData.length > 0) {
      await PatientPathway.insertMany(pathwaysData);
      console.log(`Seeded ${pathwaysData.length} Patient Pathways.`);
    }

    // 4. Seed Accreditation Standards
    await AccreditationStandard.deleteMany({});
    const standardsData = readJson('accreditation_standards.json');
    if (standardsData.length > 0) {
      await AccreditationStandard.insertMany(standardsData);
      console.log(`Seeded ${standardsData.length} Accreditation Standards.`);
    }

    // 5. Seed Benchmarks
    await Benchmark.deleteMany({});
    const benchmarksData = readJson('sample_benchmarks.json');
    if (benchmarksData.length > 0) {
      await Benchmark.insertMany(benchmarksData);
      console.log(`Seeded ${benchmarksData.length} Peer Benchmarks.`);
    }

    // 6. Seed Simulations
    await Simulation.deleteMany({});
    const simData = readJson('sample_simulations.json');
    if (simData.length > 0) {
      await Simulation.insertMany(simData);
      console.log(`Seeded ${simData.length} Simulation Baselines.`);
    }

    // 7. Seed Alerts
    await Alert.deleteMany({});
    const initialAlerts = [
      {
        title: 'Critical Accreditation Risk Spike in ICU',
        severity: 'CRITICAL',
        department: 'ICU',
        category: 'ACCREDITATION_RISK',
        reason: 'Clinical pathway conformance fell to 71.0% and bed occupancy reached 94.0% with elevated infection rates (3.8/1000).',
        recommendedAction: 'Enforce EHR medication verification checkpoints and activate step-down discharge bed turnover protocols.',
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
      },
      {
        title: 'Emergency Door-to-Doctor Waiting Time Anomaly',
        severity: 'HIGH',
        department: 'Emergency',
        category: 'ANOMALY',
        reason: 'Average triage waiting time (52.0m) exceeded maximum permissible baseline by +22 minutes.',
        recommendedAction: 'Deploy fast-track triage nurse to intake desk during peak surge hours.',
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 120 * 60 * 1000),
      },
      {
        title: 'Medication Verification Omission in Sepsis Protocol',
        severity: 'HIGH',
        department: 'ICU',
        category: 'PROCESS_CONFORMANCE',
        reason: '28 patient pathways bypassed dual-nurse verification step prior to antibiotic infusion.',
        recommendedAction: 'Mandate digital barcode scanning before infusion pump initiation.',
        status: 'ACKNOWLEDGED',
        timestamp: new Date(Date.now() - 240 * 60 * 1000),
      },
      {
        title: 'Regional Peer Benchmark Conformance Gap (-13%)',
        severity: 'MODERATE',
        department: 'ICU',
        category: 'BENCHMARK_GAP',
        reason: 'ICU clinical pathway conformance ranks in the 24th percentile nationally.',
        recommendedAction: 'Review clinical audit logs and conduct staff re-training on sepsis protocol.',
        status: 'ACTIVE',
        timestamp: new Date(Date.now() - 480 * 60 * 1000),
      },
    ];
    await Alert.insertMany(initialAlerts);
    console.log(`Seeded ${initialAlerts.length} Alerts.`);

    // 8. Seed CAPA Kanban Action Items
    await CapaPlan.deleteMany({});
    const capaData = readJson('sample_capa.json');
    if (capaData.length > 0) {
      await CapaPlan.insertMany(capaData);
      console.log(`Seeded ${capaData.length} CAPA Kanban Action Items.`);
    }

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
