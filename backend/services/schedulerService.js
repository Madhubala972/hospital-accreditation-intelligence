const riskService = require('./riskService');
const Alert = require('../models/Alert');
const { getMongoStatus } = require('../config/db');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.interval = null;
  }

  start() {
    logger.info('[Scheduler] Initializing automated hospital accreditation risk monitor...');
    // Initial check after 5 seconds
    setTimeout(() => this.runScheduledEvaluation(), 5000);
    
    // Repeat every 15 minutes
    this.interval = setInterval(() => this.runScheduledEvaluation(), 15 * 60 * 1000);
  }

  async runScheduledEvaluation() {
    try {
      const overall = await riskService.getOverallHospitalRisk();
      logger.info(`[Scheduler] Evaluated hospital risk: Score ${overall.overallRiskScore} (${overall.riskCategory})`);

      if (getMongoStatus()) {
        for (const deptRisk of overall.departmentRisks) {
          if (deptRisk.overallRiskScore >= 75) {
            // Check if existing active alert exists
            const existing = await Alert.findOne({
              department: deptRisk.department,
              category: 'ACCREDITATION_RISK',
              status: 'ACTIVE',
            });

            if (!existing) {
              await Alert.create({
                title: `Critical Accreditation Risk Spike in ${deptRisk.department}`,
                severity: deptRisk.overallRiskScore >= 80 ? 'CRITICAL' : 'HIGH',
                department: deptRisk.department,
                category: 'ACCREDITATION_RISK',
                reason: deptRisk.contributingFactors.map((f) => f.explanation).join(' '),
                recommendedAction: deptRisk.recommendedActions[0] || 'Conduct immediate quality audit.',
                status: 'ACTIVE',
              });
            }
          }
        }
      }
    } catch (e) {
      logger.warn(`[Scheduler] Evaluation error: ${e.message}`);
    }
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = new SchedulerService();
