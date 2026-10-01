const riskService = require('../services/riskService');
const AccreditationStandard = require('../models/AccreditationStandard');
const { getMongoStatus } = require('../config/db');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const fallbackStandardsPath = path.join(__dirname, '../../database/accreditation_standards.json');

const getFallbackStandards = () => {
  try {
    if (fs.existsSync(fallbackStandardsPath)) {
      return JSON.parse(fs.readFileSync(fallbackStandardsPath, 'utf8'));
    }
  } catch (e) {
    logger.error('Error reading fallback standards:', e.message);
  }
  return [];
};

const saveFallbackStandards = (data) => {
  try {
    fs.writeFileSync(fallbackStandardsPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    logger.error('Error saving fallback standards:', e.message);
  }
};

// @route GET /api/risk/overall
const getOverallRisk = async (req, res) => {
  try {
    const data = await riskService.getOverallHospitalRisk();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/risk/department/:department
const getDepartmentRisk = async (req, res) => {
  try {
    const { department } = req.params;
    const data = await riskService.calculateDepartmentRisk(department);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/risk/standards
const getAccreditationStandards = async (req, res) => {
  try {
    const { framework, department } = req.query;
    let standards = [];

    if (getMongoStatus()) {
      try {
        const q = {};
        if (framework && framework !== 'All') q.framework = framework;
        if (department && department !== 'All') q.department = { $in: [department, 'All'] };
        standards = await AccreditationStandard.find(q).lean();
      } catch (e) {}
    }

    if (!standards || standards.length === 0) {
      const all = getFallbackStandards();
      standards = all;
      if (framework && framework !== 'All') {
        standards = standards.filter((s) => s.framework.toLowerCase() === framework.toLowerCase());
      }
      if (department && department !== 'All') {
        standards = standards.filter((s) => s.department === department || s.department === 'All');
      }
    }

    const nonCompliant = standards.filter((s) => s.complianceStatus === 'Non-Compliant' || s.complianceStatus === 'Sub-Optimal').length;
    const compliant = standards.filter((s) => s.complianceStatus === 'Compliant').length;

    res.json({
      success: true,
      totalStandards: standards.length,
      compliantCount: compliant,
      nonCompliantCount: nonCompliant,
      complianceRate: standards.length > 0 ? Math.round((compliant / standards.length) * 100) : 75,
      standards,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/risk/standards
const saveAccreditationStandard = async (req, res) => {
  try {
    const {
      standardId,
      code,
      framework = 'NABH',
      category = 'Care of Patients',
      title,
      description = '',
      indicator,
      threshold,
      targetThreshold,
      operator = '>=',
      unit = '%',
      currentValue,
      actualValue,
      department = 'All',
      weight = 0.15,
      correctiveAction = '',
    } = req.body;

    const stdCode = standardId || code || `STD-${Date.now().toString().slice(-4)}`;
    const stdTitle = title || description || `${category} Standard`;
    const stdIndicator = indicator || description || stdTitle;
    const thresh = Number(threshold !== undefined ? threshold : (targetThreshold !== undefined ? targetThreshold : 85));
    const curr = Number(currentValue !== undefined ? currentValue : (actualValue !== undefined ? actualValue : thresh));

    // Compute compliance status based on operator
    let isCompliant = true;
    if (operator === '>=' || operator === '>') {
      isCompliant = curr >= thresh;
    } else if (operator === '<=' || operator === '<') {
      isCompliant = curr <= thresh;
    } else {
      isCompliant = curr === thresh;
    }

    const complianceStatus = isCompliant ? 'Compliant' : 'Non-Compliant';
    const status = isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT';
    const riskLevel = isCompliant ? 'Low' : (Math.abs(curr - thresh) > 10 ? 'Critical' : 'High');

    const standardDoc = {
      standardId: stdCode,
      code: stdCode,
      framework,
      category,
      title: stdTitle,
      description: description || stdTitle,
      indicator: stdIndicator,
      threshold: thresh,
      targetThreshold: thresh,
      operator,
      unit,
      currentValue: curr,
      actualValue: curr,
      department,
      weight: Number(weight || 0.15),
      riskLevel,
      complianceStatus,
      status,
      correctiveAction: correctiveAction || (isCompliant ? 'Maintain standard surveillance.' : 'Initiate clinical workflow audit.'),
    };

    if (getMongoStatus()) {
      try {
        await AccreditationStandard.findOneAndUpdate(
          { standardId: stdCode },
          { $set: standardDoc },
          { upsert: true, new: true }
        );
      } catch (e) {
        logger.warn(`Mongo standard update warning: ${e.message}`);
      }
    }

    const all = getFallbackStandards();
    const existingIdx = all.findIndex(
      (s) => (s.standardId || s.code || '').toLowerCase() === stdCode.toLowerCase()
    );
    if (existingIdx >= 0) {
      all[existingIdx] = { ...all[existingIdx], ...standardDoc };
    } else {
      all.push(standardDoc);
    }
    saveFallbackStandards(all);

    logger.info(`[Data Entry] Saved accreditation standard [${standardId}] ${title} (${complianceStatus})`);

    res.json({
      success: true,
      message: `Accreditation standard ${standardId} saved successfully!`,
      standard: standardDoc,
    });
  } catch (err) {
    logger.error('Error saving accreditation standard:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOverallRisk,
  getDepartmentRisk,
  getAccreditationStandards,
  saveAccreditationStandard,
};
