import { PatientProfile, PatientRecord, Demographics, Anthropometry, Vitals, Labs, FabpNir, Echocardiography, HRV, OxidativeStress, Epigenetics, Genomics, ShannonEntropy, ComplianceRecord, CohortStats } from '../types';
import { keralaCohortData } from './keralaCohortData';

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  nextElement<T>(arr: T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx];
  }
}

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const FIRST_NAMES_M = ['Amit', 'Rajesh', 'Rahul', 'Arjun', 'Sanjay', 'Vijay', 'Karan', 'Vikram', 'Rohan', 'Aditya', 'Harish', 'Pranav', 'Nitin', 'Suresh', 'Manish'];
const FIRST_NAMES_F = ['Priya', 'Anjali', 'Deepa', 'Sita', 'Meera', 'Ritu', 'Kavita', 'Neha', 'Sneha', 'Aarti', 'Sunita', 'Divya', 'Pooja', 'Shalini', 'Kiran'];
const LAST_NAMES = ['Nair', 'Pillai', 'Kurup', 'Menon', 'Nambiar', 'George', 'Varghese', 'Joseph', 'Thomas', 'Mathew', 'Shenoy', 'Prabhu', 'Bhat', 'Iyer', 'Sharma'];

const CODON_FAMILIES = [
  'Alanine', 'Arginine', 'Asparagine', 'Aspartate', 'Cysteine', 
  'Glutamate', 'Glutamine', 'Glycine', 'Histidine', 'Isoleucine', 
  'Leucine', 'Lysine', 'Methionine', 'Phenylalanine', 'Proline', 
  'Serine', 'Threonine', 'Tryptophan', 'Tyrosine', 'Valine', 'Stop'
];

const SNP_GENOTYPES = {
  ace: ['DD', 'ID', 'II'],
  pcsk9: ['GG', 'AG', 'AA'],
  hmgcoa: ['TT', 'GT', 'GG'],
  mthfr: ['TT', 'CT', 'CC'],
  tcf7l2: ['TT', 'CT', 'CC'],
  fto: ['AA', 'TA', 'TT'],
  pparg: ['CC', 'CG', 'GG'],
  nrf2: ['TT', 'CT', 'CC']
};

function calculateBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 23) return 'Normal (Asian)';
  if (bmi < 25) return 'Overweight';
  if (bmi < 30) return 'Obese I';
  return 'Obese II';
}

function calculateBPCategory(sbp: number, dbp: number): string {
  if (sbp < 120 && dbp < 80) return 'Normal';
  if (sbp < 130 && dbp < 80) return 'Elevated';
  if (sbp < 140 || dbp < 90) return 'Stage 1 Hypertension';
  return 'Stage 2 Hypertension';
}

function calculateSNPPoints(gene: string, genotype: string): number {
  switch (gene) {
    case 'ace': return genotype === 'DD' ? 2 : genotype === 'ID' ? 1 : 0;
    case 'pcsk9': return genotype === 'GG' ? 2 : genotype === 'AG' ? 1 : 0;
    case 'hmgcoa': return genotype === 'TT' ? 2 : genotype === 'GT' ? 1 : 0;
    case 'mthfr': return genotype === 'TT' ? 2 : genotype === 'CT' ? 1 : 0;
    case 'tcf7l2': return genotype === 'TT' ? 2 : genotype === 'CT' ? 1 : 0;
    case 'fto': return genotype === 'AA' ? 2 : genotype === 'TA' ? 1 : 0;
    case 'pparg': return genotype === 'CC' ? 2 : genotype === 'CG' ? 1 : 0;
    case 'nrf2': return genotype === 'TT' ? 2 : genotype === 'CT' ? 1 : 0;
    default: return 0;
  }
}

export function generateCohort(size: number = 100): PatientProfile[] {
  return keralaCohortData;
}

function createRecord(
  timepoint: 'BL' | 'M3' | 'M6' | 'M12',
  pid: string,
  name: string,
  group: 'TEST' | 'CTRL',
  sex: 'M' | 'F',
  age: number,
  district: string,
  height: number,
  weight: number,
  sbp: number,
  dbp: number,
  lvef: number,
  gls: number,
  fabp: number,
  compositeJ: number,
  genomics: Genomics,
  rand: SeededRandom
): PatientRecord {
  
  const bmi = weight / Math.pow(height / 100, 2);
  const waist = sex === 'M' ? rand.nextRange(85, 110) : rand.nextRange(80, 102);
  const hip = waist + rand.nextRange(2, 10);
  const whr = waist / hip;

  // Compliance calculations for TEST group
  const records: ComplianceRecord[] = [];
  const activeWeeks = timepoint === 'BL' ? 0 : timepoint === 'M3' ? 6 : timepoint === 'M6' ? 12 : 26;
  let totalDelivered = 0;
  let totalConsumed = 0;
  
  for (let w = 1; w <= activeWeeks; w++) {
    const delivered = 350;
    // Test group has generally good compliance (80-95%)
    const complianceFactor = group === 'TEST' ? rand.nextRange(0.78, 0.96) : 0; 
    const consumed = group === 'TEST' ? Math.round(delivered * complianceFactor) : 0;
    records.push({
      week: w * 2, // Fortnightly
      delivered,
      consumed,
      pct: delivered > 0 ? (consumed / delivered * 100) : 0,
      quality: rand.nextElement(['Excellent', 'Good', 'Fair']),
      tolerability: rand.nextElement(['Good', 'Mild GI', 'Good'])
    });
    totalDelivered += delivered;
    totalConsumed += consumed;
  }
  const overallPct = totalDelivered > 0 ? (totalConsumed / totalDelivered * 100) : 0;

  // Vitals
  const pulsePressure = sbp - dbp;
  const map = dbp + pulsePressure / 3;
  const hr = rand.nextRange(64, 88);

  // Labs
  const isBaseline = timepoint === 'BL';
  const improvement = (group === 'TEST' && !isBaseline) ? 0.85 : 1.0; // 15% reduction in risk factors
  
  const tc = rand.nextRange(170, 270) * (timepoint === 'M12' && group === 'TEST' ? 0.82 : 1.0);
  const hdl = rand.nextRange(35, 58) * (timepoint === 'M12' && group === 'TEST' ? 1.12 : 1.0);
  const tg = rand.nextRange(110, 240) * (timepoint === 'M12' && group === 'TEST' ? 0.78 : 1.0);
  const ldl = tc - hdl - (tg / 5);

  const fbg = rand.nextRange(85, 150) * improvement;
  const hba1c = rand.nextRange(5.2, 7.8) * (timepoint === 'M12' && group === 'TEST' ? 0.90 : 1.0);
  const insulin = rand.nextRange(6, 24) * improvement;
  const homaIr = (fbg * insulin) / 405;

  const creat = rand.nextRange(0.6, 1.3);
  const egfr = sex === 'M'
    ? 141 * Math.min(creat / 0.9, 1) ** -0.411 * Math.max(creat / 0.9, 1) ** -1.2 * 0.993 ** age
    : 141 * Math.min(creat / 0.7, 1) ** -0.329 * Math.max(creat / 0.7, 1) ** -1.2 * 0.993 ** age * 1.018;

  const alt = rand.nextRange(15, 62) * improvement;
  const ast = rand.nextRange(14, 50) * improvement;
  const hsCrp = rand.nextRange(0.8, 8.5) * (timepoint === 'M12' && group === 'TEST' ? 0.65 : 1.0); // Reduced inflammation
  const ntProBnp = rand.nextRange(40, 320) * improvement;

  // Echocardiography categories
  const lvefCategory = lvef >= 55 ? 'Normal LVEF (>=55%)' : lvef >= 40 ? 'Mildly Reduced LVEF (40-54%)' : 'Reduced LVEF (<40%)';
  const glsCategory = gls <= -20 ? 'Normal GLS (<= -20%)' : gls >= -18 ? 'Subclinical LV Dysfunction (> -18%)' : 'Borderline GLS (-18% to -20%)';

  // HRV
  const sdnn = rand.nextRange(28, 65) * (timepoint === 'M12' && group === 'TEST' ? 1.25 : 1.0); // Increased HRV
  const rmssd = rand.nextRange(20, 52) * (timepoint === 'M12' && group === 'TEST' ? 1.28 : 1.0);
  const lfhf = rand.nextRange(1.2, 4.8) * (timepoint === 'M12' && group === 'TEST' ? 0.75 : 1.0); // Balanced autonomic tone
  const shannon = rand.nextRange(1.5, 3.2);

  // Oxidative stress
  const mda = rand.nextRange(2.2, 6.8) * (timepoint === 'M12' && group === 'TEST' ? 0.62 : 1.0); // Reduced lipid peroxidation
  const sod = rand.nextRange(8, 18) * (timepoint === 'M12' && group === 'TEST' ? 1.35 : 1.0); // Increased antioxidant defense
  const gsh = rand.nextRange(3.5, 8.2) * (timepoint === 'M12' && group === 'TEST' ? 1.40 : 1.0);
  const gssg = rand.nextRange(0.4, 1.4) * (timepoint === 'M12' && group === 'TEST' ? 0.70 : 1.0);
  const gshGssgRatio = gsh / gssg;
  const oxidativeStressIndex = (mda / sod) * 100;

  // Epigenetics
  const fiveMc = rand.nextRange(2.5, 7.5) * (timepoint === 'M12' && group === 'TEST' ? 1.15 : 1.0); // Increased global methylation
  const nrf2Meth = rand.nextRange(35, 75) * (timepoint === 'M12' && group === 'TEST' ? 0.68 : 1.0); // Lower promoter methylation = higher NRF2 activation
  const nrf2Exp = rand.nextRange(0.6, 2.4) * (timepoint === 'M12' && group === 'TEST' ? 1.55 : 1.0); // Higher NRF2 expression
  const ho1 = rand.nextRange(0.5, 2.2) * (timepoint === 'M12' && group === 'TEST' ? 1.62 : 1.0); // Higher HO-1 expression (downstream NRF2 antioxidant target)
  const nrf2Nuc = rand.nextRange(25, 62) * (timepoint === 'M12' && group === 'TEST' ? 1.45 : 1.0); // Nuclear localization

  // Shannon entropy observed H' values
  const families: { [family: string]: number } = {};
  CODON_FAMILIES.forEach(fam => {
    // Generate observed entropy
    families[fam] = rand.nextRange(compositeJ * 0.8, compositeJ * 1.1);
  });
  
  let lowCount = 0;
  Object.keys(families).forEach(fam => {
    if (families[fam] < 0.78) lowCount++;
  });

  // Calculate Overall Health Score (0-100 index based on cardiovascular, glycemic, genomics, and oxidative stress components)
  let healthScore = 75; // Baseline default
  
  // Apply deductions/additions
  if (sbp > 140) healthScore -= 10;
  if (dbp > 90) healthScore -= 5;
  if (bmi > 25) healthScore -= 8;
  if (hba1c > 6.5) healthScore -= 12;
  if (ldl > 130) healthScore -= 8;
  if (lvef < 50) healthScore -= 10;
  if (fabp > 8.0) healthScore -= 8;
  if (genomics.totalScore > 10) healthScore -= 8;
  if (oxidativeStressIndex > 35) healthScore -= 6;
  
  // Add positive indicators
  if (group === 'TEST' && timepoint !== 'BL') {
    healthScore += timepoint === 'M3' ? 5 : timepoint === 'M6' ? 10 : 16;
  }
  
  healthScore = Math.max(25, Math.min(98, Math.round(healthScore)));

  return {
    timepoint,
    demographics: {
      pid,
      name,
      code: `GRN-${district.substring(0, 3).toUpperCase()}-${String(Math.floor(rand.nextRange(100, 999)))}`,
      group,
      timepoint,
      district,
      enrollDate: isBaseline ? `2025-01-${String(Math.floor(rand.nextRange(1, 28))).padStart(2, '0')}` : '',
      dob: `19${String(95 - age)}-${String(Math.floor(rand.nextRange(1, 12))).padStart(2, '0')}-${String(Math.floor(rand.nextRange(1, 28))).padStart(2, '0')}`,
      sex,
      consentDate: isBaseline ? `2025-01-${String(Math.floor(rand.nextRange(1, 28))).padStart(2, '0')}` : '',
      dietType: rand.nextElement(['Mixed', 'Vegetarian', 'Fish-eating'])
    },
    anthropometry: {
      height,
      weight,
      bmi,
      bmiCategory: calculateBMICategory(bmi),
      waist,
      hip,
      whr,
      bodyFat: rand.nextRange(15, 32),
      muscleMass: rand.nextRange(38, 55)
    },
    vitals: {
      sbpAvg: sbp,
      dbpAvg: dbp,
      pulsePressure,
      map,
      hr,
      bpCategory: calculateBPCategory(sbp, dbp)
    },
    labs: {
      tc, ldl, hdl, tg,
      nonHdl: tc - hdl,
      tcHdlRatio: tc / hdl,
      ldlHdlRatio: ldl / hdl,
      vldl: tg / 5,
      fbg, hba1c, insulin, homaIr,
      creat, egfr, alt, ast, hsCrp, ntProBnp
    },
    fabpNir: {
      value: fabp,
      category: fabp < 2.0 ? 'Normal (<2 ng/mL)' : fabp < 6.0 ? 'Mildly Elevated (2-6 ng/mL)' : fabp < 10.0 ? 'Elevated (6-10 ng/mL)' : 'High Risk (>=10 ng/mL)',
      date: `2025-${timepoint === 'BL' ? '01' : timepoint === 'M3' ? '04' : timepoint === 'M6' ? '07' : '12'}-15`
    },
    echo: {
      lvef, lvefCategory, gls, glsCategory,
      eWave: rand.nextRange(0.6, 1.1),
      aWave: rand.nextRange(0.5, 0.9),
      eaRatio: rand.nextRange(0.8, 1.4),
      eSeptal: rand.nextRange(6, 12),
      eLateral: rand.nextRange(8, 14),
      eePrimeRatio: rand.nextRange(6, 14)
    },
    hrv: {
      sdnn, rmssd, lfhf, shannon,
      autonomicBalance: lfhf < 1.0 ? 'Parasympathetic Dominance' : lfhf <= 2.5 ? 'Balanced Autonomic Tone' : lfhf <= 4.0 ? 'Mild Sympathetic Dominance' : 'Sympathetic Dominance',
      date: `2025-${timepoint === 'BL' ? '01' : timepoint === 'M3' ? '04' : timepoint === 'M6' ? '07' : '12'}-15`
    },
    oxidativeStress: {
      mda, sod, gsh, gssg, gshGssgRatio, oxidativeStressIndex,
      catalase: rand.nextRange(15, 38),
      gpx: rand.nextRange(22, 54),
      ohdg8: rand.nextRange(1.5, 9.8) * improvement
    },
    epigenetics: {
      fiveMc, nrf2Meth, nrf2Exp, ho1, nrf2Nuc
    },
    genomics,
    shannonEntropy: {
      compositeJ,
      lowFamiliesCount: lowCount,
      families
    },
    compliance: {
      records,
      overallPct
    },
    adverseEvents: {
      total: isBaseline ? 0 : (rand.next() > 0.92 ? 1 : 0),
      log: isBaseline ? [] : (rand.next() > 0.92 ? [{
        event: rand.nextElement(['Mild Nausea', 'Mild Bloating', 'Headache']),
        severity: 'Mild',
        relationship: 'Possible'
      }] : [])
    },
    overallHealthScore: healthScore
  };
}

export function getCohortStats(cohort: PatientProfile[], timepoint: 'BL' | 'M3' | 'M6' | 'M12' = 'BL'): CohortStats {
  const activeRecords = cohort
    .map(p => p.timepoints[timepoint])
    .filter((r): r is PatientRecord => !!r);

  if (activeRecords.length === 0) {
    return {
      totalParticipants: cohort.length,
      completedVisits: 0,
      avgAge: 0,
      avgBmi: 0,
      avgLvef: 0,
      avgFabp: 0,
      avgCompliance: 0,
      avgRiskScore: 0
    };
  }

  const count = activeRecords.length;
  let sumAge = 0;
  let sumBmi = 0;
  let sumLvef = 0;
  let sumFabp = 0;
  let sumCompliance = 0;
  let sumRisk = 0;

  activeRecords.forEach(r => {
    sumAge += r.demographics.dob ? calculateAge(r.demographics.dob) : 45;
    sumBmi += r.anthropometry.bmi;
    sumLvef += r.echo.lvef;
    sumFabp += r.fabpNir.value;
    sumCompliance += r.compliance.overallPct;
    sumRisk += r.genomics.totalScore;
  });

  return {
    totalParticipants: cohort.length,
    completedVisits: cohort.reduce((acc, p) => acc + Object.keys(p.timepoints).length, 0),
    avgAge: sumAge / count,
    avgBmi: sumBmi / count,
    avgLvef: sumLvef / count,
    avgFabp: sumFabp / count,
    avgCompliance: sumCompliance / count,
    avgRiskScore: sumRisk / count
  };
}

function calculateAge(dobStr: string): number {
  const dob = new Date(dobStr);
  const now = new Date('2026-07-09'); // Standard study baseline year
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function mapLocalRecordToPatientRecord(tp: 'BL' | 'M3' | 'M6' | 'M12', localData: any): PatientRecord {
  const pid = localData.d_pid || '';
  const name = localData.d_name || '';
  const group = localData.d_group || 'TEST';
  const sex = localData.d_sex || 'M';
  const age = localData.d_age ? parseInt(localData.d_age) : 45;
  const district = localData.d_district || 'Kottayam';
  
  const height = parseFloat(localData.a_ht) || 170;
  const weight = parseFloat(localData.a_wt) || 70;
  const bmi = weight / Math.pow(height / 100, 2);
  const waist = parseFloat(localData.a_waist) || 90;
  const hip = parseFloat(localData.a_hip) || 95;
  
  const sbp = parseFloat(localData.v_sbp_avg) || parseFloat(localData.v_sbp1) || 120;
  const dbp = parseFloat(localData.v_dbp_avg) || parseFloat(localData.v_dbp1) || 80;
  const pulsePressure = sbp - dbp;
  const map = dbp + pulsePressure / 3;
  const hr = parseFloat(localData.v_hr) || 72;
  
  const tc = parseFloat(localData.l_tc) || 200;
  const ldl = parseFloat(localData.l_ldl) || 120;
  const hdl = parseFloat(localData.l_hdl) || 50;
  const tg = parseFloat(localData.l_tg) || 150;
  
  return {
    timepoint: tp,
    demographics: {
      pid, name, code: localData.d_code || '', group, timepoint: tp, district,
      enrollDate: localData.d_enroll_date || '', dob: localData.d_dob || '', sex,
      consentDate: localData.d_consent_date || '', dietType: localData.d_diet || ''
    },
    anthropometry: {
      height, weight, bmi, bmiCategory: 'Normal', waist, hip, whr: waist/hip,
      bodyFat: parseFloat(localData.a_bf) || 20,
      muscleMass: parseFloat(localData.a_mm) || 40
    },
    vitals: {
      sbpAvg: sbp, dbpAvg: dbp, pulsePressure, map, hr, bpCategory: 'Normal'
    },
    labs: {
      tc, ldl, hdl, tg,
      nonHdl: tc - hdl,
      tcHdlRatio: tc / hdl,
      ldlHdlRatio: ldl / hdl,
      vldl: tg / 5,
      fbg: parseFloat(localData.l_fbg) || 100,
      hba1c: parseFloat(localData.l_hba1c) || 5.8,
      creat: parseFloat(localData.l_creat) || 0.9,
      egfr: parseFloat(localData.l_egfr) || 90,
      alt: parseFloat(localData.l_alt) || 30,
      ast: parseFloat(localData.l_ast) || 28,
      hsCrp: parseFloat(localData.l_hscrp) || 1.2
    },
    fabpNir: {
      value: parseFloat(localData.f_nir) || 1.5,
      category: 'Normal',
      date: localData.f_date || ''
    },
    echo: {
      lvef: parseFloat(localData.e_lvef) || 60,
      lvefCategory: 'Normal',
      gls: parseFloat(localData.e_gls) || -19,
      glsCategory: 'Normal',
      eWave: parseFloat(localData.e_e) || 0.8,
      aWave: parseFloat(localData.e_a) || 0.7,
      eaRatio: parseFloat(localData.e_ea) || 1.1,
      eSeptal: parseFloat(localData.e_epr_septal) || 8,
      eLateral: parseFloat(localData.e_epr_lat) || 10,
      eePrimeRatio: parseFloat(localData.e_ee_prime) || 8
    },
    hrv: {
      sdnn: parseFloat(localData.h_sdnn) || 45,
      rmssd: parseFloat(localData.h_rmssd) || 35,
      lfhf: parseFloat(localData.h_lfhf) || 1.5,
      shannon: parseFloat(localData.h_shannon) || 2.1,
      autonomicBalance: 'Balanced',
      date: localData.h_date || ''
    },
    oxidativeStress: {
      mda: parseFloat(localData.ox_mda) || 3.5,
      sod: parseFloat(localData.ox_sod) || 12.0,
      gsh: parseFloat(localData.ox_gsh) || 5.5,
      gssg: parseFloat(localData.ox_gssg) || 0.8,
      gshGssgRatio: 6.8,
      oxidativeStressIndex: 29.0
    },
    epigenetics: {
      fiveMc: parseFloat(localData.ep_5mc) || 4.2,
      nrf2Meth: parseFloat(localData.ep_nrf2_meth) || 55.0,
      nrf2Exp: parseFloat(localData.ep_nrf2_exp) || 1.2,
      ho1: parseFloat(localData.ep_ho1) || 1.0,
      nrf2Nuc: parseFloat(localData.ep_nrf2_nuc) || 40.0
    },
    genomics: {
      ace: localData.snp_ace || 'II',
      pcsk9: localData.snp_pcsk9 || 'AA',
      hmgcoa: localData.snp_hmgcoa || 'GG',
      mthfr: localData.snp_mthfr || 'CC',
      tcf7l2: localData.snp_tcf7l2 || 'CC',
      fto: localData.snp_fto || 'TT',
      pparg: localData.snp_pparg || 'GG',
      nrf2: localData.snp_nrf2 || 'CC',
      totalScore: parseFloat(localData.snp_total_risk) || 0,
      riskTertile: localData.snp_risk_tertile || 'Low Risk'
    },
    shannonEntropy: {
      compositeJ: parseFloat(localData.jp_composite) || 0.88,
      lowFamiliesCount: 0,
      families: {}
    },
    compliance: {
      records: [],
      overallPct: parseFloat(localData.comp_overall) || 0
    },
    adverseEvents: {
      total: parseFloat(localData.ae_total) || 0,
      log: []
    },
    overallHealthScore: 78
  };
}

export function mergeLocalData(cohort: PatientProfile[]): PatientProfile[] {
  try {
    const raw = localStorage.getItem('greenage_data');
    if (!raw) return cohort;

    const savedRecords = JSON.parse(raw);
    const keys = Object.keys(savedRecords);
    if (keys.length === 0) return cohort;

    // Detect old simulated records and clear them
    const hasOldKeys = keys.some(k => k.startsWith('TEST-') || k.startsWith('CTRL-'));
    if (hasOldKeys) {
      console.warn("Detected old simulated patient keys. Clearing localStorage cache.");
      localStorage.removeItem('greenage_data');
      return cohort;
    }

    const updatedCohort = [...cohort];

    keys.forEach(key => {
      const parts = key.split('-');
      if (parts.length < 3) return;

      const group = parts[0] as 'TEST' | 'CTRL';
      const pid = `${group}-${parts[1]}`;
      const timepoint = parts[2] as 'BL' | 'M3' | 'M6' | 'M12';

      const localData = savedRecords[key];
      const mappedRecord = mapLocalRecordToPatientRecord(timepoint, localData);

      let profile = updatedCohort.find(p => p.pid === pid);

      if (profile) {
        profile.timepoints[timepoint] = mappedRecord;
        if (mappedRecord.demographics.name) {
          profile.name = mappedRecord.demographics.name;
        }
        if (mappedRecord.demographics.dob) {
          profile.age = calculateAge(mappedRecord.demographics.dob);
        }
        if (mappedRecord.demographics.sex) {
          profile.gender = mappedRecord.demographics.sex;
        }
      } else {
        const newProfile: PatientProfile = {
          pid,
          name: mappedRecord.demographics.name || 'Anonymous Participant',
          gender: mappedRecord.demographics.sex || 'M',
          age: mappedRecord.demographics.dob ? calculateAge(mappedRecord.demographics.dob) : 45,
          district: mappedRecord.demographics.district || 'Kottayam',
          group,
          timepoints: {
            [timepoint]: mappedRecord
          } as any,
          currentCompletedTimepoint: timepoint
        };
        updatedCohort.push(newProfile);
      }
    });

    return updatedCohort;
  } catch (err) {
    console.error('Error merging LocalStorage clinical database:', err);
    return cohort;
  }
}
