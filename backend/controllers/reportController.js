const riskService = require('../services/riskService');
const benchmarkService = require('../services/benchmarkService');
const externalDataService = require('../services/externalDataService');

// @route GET /api/reports/executive-summary
const getExecutiveReport = async (req, res) => {
  try {
    const overallRisk = await riskService.getOverallHospitalRisk();
    const benchmarks = await benchmarkService.getBenchmarks('All');
    const icuRisk = await riskService.calculateDepartmentRisk('ICU');
    const emgRisk = await riskService.calculateDepartmentRisk('Emergency');
    const conformance = await externalDataService.checkConformance({ department: 'ICU' });

    const report = {
      reportId: `HAR-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date().toISOString(),
      hospitalName: 'Apollo Metro Memorial Hospital',
      period: 'Q1 - 2026',
      overallStatus: {
        score: overallRisk.overallRiskScore,
        category: overallRisk.riskCategory,
        topRiskDepartment: overallRisk.topRiskDepartment,
        summary: overallRisk.summary,
      },
      departmentalBreakdown: overallRisk.departmentRisks,
      processMiningHighlights: {
        department: 'ICU',
        pathway: 'Sepsis Resuscitation Protocol',
        conformanceRate: conformance.conformanceScore,
        deviationsDetected: conformance.deviations,
      },
      benchmarkGaps: benchmarks.benchmarks.filter((b) => (b.gap || 0) < 0),
      accreditationViolations: [
        { standardId: 'NABH-COP-01', title: 'Uniform Care Delivery & Clinical Pathway Adherence', status: 'Non-Compliant', impact: 'High' },
        { standardId: 'NABH-COP-02', title: 'Emergency Response Time & Triage Standards', status: 'Non-Compliant', impact: 'Critical' },
        { standardId: 'NABH-HIC-01', title: 'Healthcare-Associated Infection Control', status: 'Non-Compliant', impact: 'High' },
      ],
      executiveRecommendations: [
        'Mandate barcode verification checkpoints in ICU electronic health records to eliminate skipped medication verification steps.',
        'Deploy float nursing pool to Emergency triage intake during 18:00 - 23:00 surge hours.',
        'Implement strict central line bundle sterile audits in ICU to reduce infection rate below 2.0/1000.',
        'Perform weekly digital twin simulation reviews to proactively evaluate capacity strain.',
      ],
    };

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getExecutiveReport,
};
