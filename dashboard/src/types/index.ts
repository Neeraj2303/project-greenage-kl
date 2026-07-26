export interface Demographics {
  pid: string;
  name: string;
  code: string;
  group: 'TEST' | 'CTRL';
  timepoint: 'BL' | 'M3' | 'M6' | 'M12';
  district: string;
  enrollDate: string;
  dob: string;
  sex: 'M' | 'F';
  consentDate: string;
  dietType: string;
}

export interface Anthropometry {
  height: number;
  weight: number;
  bmi: number;
  bmiCategory: string;
  waist: number;
  hip: number;
  whr: number;
  bodyFat?: number;
  muscleMass?: number;
}

export interface Vitals {
  sbpAvg: number;
  dbpAvg: number;
  pulsePressure: number;
  map: number;
  hr: number;
  bpCategory: string;
}

export interface Labs {
  tc: number;
  ldl: number;
  hdl: number;
  tg: number;
  nonHdl: number;
  tcHdlRatio: number;
  ldlHdlRatio: number;
  vldl: number;
  fbg: number;
  hba1c: number;
  insulin?: number;
  homaIr?: number;
  creat: number;
  egfr: number;
  alt: number;
  ast: number;
  hsCrp: number;
  ntProBnp?: number;
}

export interface FabpNir {
  value: number;
  category: string;
  date: string;
}

export interface Echocardiography {
  lvef: number;
  lvefCategory: string;
  gls: number;
  glsCategory: string;
  eWave: number;
  aWave: number;
  eaRatio: number;
  eSeptal: number;
  eLateral: number;
  eePrimeRatio: number;
}

export interface HRV {
  sdnn: number;
  rmssd: number;
  lfhf: number;
  shannon: number;
  autonomicBalance: string;
  date: string;
}

export interface OxidativeStress {
  mda: number;
  sod: number;
  gsh: number;
  gssg: number;
  gshGssgRatio: number;
  oxidativeStressIndex: number;
  catalase?: number;
  gpx?: number;
  ohdg8?: number;
}

export interface Epigenetics {
  fiveMc: number;
  nrf2Meth: number;
  nrf2Exp: number;
  ho1: number;
  nrf2Nuc: number;
}

export interface Genomics {
  ace: string;
  pcsk9: string;
  hmgcoa: string;
  mthfr: string;
  tcf7l2: string;
  fto: string;
  pparg: string;
  nrf2: string;
  totalScore: number;
  riskTertile: string;
}

export interface ShannonEntropy {
  compositeJ: number;
  lowFamiliesCount: number;
  families: { [family: string]: number };
}

export interface ComplianceRecord {
  week: number;
  delivered: number;
  consumed: number;
  pct: number;
  quality: string;
  tolerability: string;
}

export interface PatientRecord {
  timepoint: 'BL' | 'M3' | 'M6' | 'M12';
  demographics: Demographics;
  anthropometry: Anthropometry;
  vitals: Vitals;
  labs: Labs;
  fabpNir: FabpNir;
  echo: Echocardiography;
  hrv: HRV;
  oxidativeStress: OxidativeStress;
  epigenetics: Epigenetics;
  genomics: Genomics;
  shannonEntropy: ShannonEntropy;
  compliance: {
    records: ComplianceRecord[];
    overallPct: number;
  };
  adverseEvents: {
    total: number;
    log: Array<{
      event: string;
      severity: string;
      relationship: string;
    }>;
  };
  overallHealthScore: number;
}

export interface PatientProfile {
  pid: string; // e.g. "TEST-001" or "CTRL-002"
  name: string;
  gender: 'M' | 'F';
  age: number;
  district: string;
  group: 'TEST' | 'CTRL';
  timepoints: {
    BL: PatientRecord;
    M3?: PatientRecord;
    M6?: PatientRecord;
    M12?: PatientRecord;
  };
  currentCompletedTimepoint: 'BL' | 'M3' | 'M6' | 'M12';
}

export interface CohortStats {
  totalParticipants: number;
  completedVisits: number;
  avgAge: number;
  avgBmi: number;
  avgLvef: number;
  avgFabp: number;
  avgCompliance: number;
  avgRiskScore: number;
}
