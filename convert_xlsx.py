import pandas as pd
import json
import os
import random

file_path = "d:/PROJECT_GREENAGE-KL/Kerala_CVD_MultiOmics_Database.xlsx"
output_path = "d:/PROJECT_GREENAGE-KL/dashboard/src/services/keralaCohortData.ts"

# 1. Load Excel file
print("Loading Excel Database sheets...")
xl = pd.ExcelFile(file_path)

gen_df = xl.parse("1_Genomics_Data")
ehr_df = xl.parse("2_EHR_Clinical_Data")
trans_df = xl.parse("3_Transcriptomics_Data")
prot_df = xl.parse("4_Proteomics_Data")
meta_df = xl.parse("5_Metabolomics_Data")
env_df = xl.parse("6_Environmental_Factors")
life_df = xl.parse("7_Lifestyle_Factors")
out_df = xl.parse("8_CVD_Outcomes")

print("Mapping dictionaries...")
gen_dict = gen_df.set_index("Patient_ID").to_dict(orient="index")
trans_dict = trans_df.set_index("Patient_ID").to_dict(orient="index")
prot_dict = prot_df.set_index("Patient_ID").to_dict(orient="index")
meta_dict = meta_df.set_index("Patient_ID").to_dict(orient="index")
env_dict = env_df.set_index("Patient_ID").to_dict(orient="index")
life_dict = life_df.set_index("Patient_ID").to_dict(orient="index")
out_dict = out_df.set_index("Patient_ID").to_dict(orient="index")

# Helper lists for name generation
FIRST_NAMES_M = ['Amit', 'Rajesh', 'Rahul', 'Arjun', 'Sanjay', 'Vijay', 'Karan', 'Vikram', 'Rohan', 'Aditya', 'Harish', 'Pranav', 'Nitin', 'Suresh', 'Manish']
FIRST_NAMES_F = ['Priya', 'Anjali', 'Deepa', 'Sita', 'Meera', 'Ritu', 'Kavita', 'Neha', 'Sneha', 'Aarti', 'Sunita', 'Divya', 'Pooja', 'Shalini', 'Kiran']
LAST_NAMES = ['Nair', 'Pillai', 'Kurup', 'Menon', 'Nambiar', 'George', 'Varghese', 'Joseph', 'Thomas', 'Mathew', 'Shenoy', 'Prabhu', 'Bhat', 'Iyer', 'Sharma']

CODON_FAMILIES = [
  'Alanine', 'Arginine', 'Asparagine', 'Aspartate', 'Cysteine', 
  'Glutamate', 'Glutamine', 'Glycine', 'Histidine', 'Isoleucine', 
  'Leucine', 'Lysine', 'Methionine', 'Phenylalanine', 'Proline', 
  'Serine', 'Threonine', 'Tryptophan', 'Tyrosine', 'Valine', 'Stop'
]

# Map patient EHR data group by Patient_ID
patient_ehr_visits = {}
for row in ehr_df.itertuples(index=False):
    pid = row.Patient_ID
    if pid not in patient_ehr_visits:
        patient_ehr_visits[pid] = []
    patient_ehr_visits[pid].append(row)

# Process all 100 patients
cohort_profiles = []

# Sort patient keys
patient_ids = sorted(list(gen_dict.keys()))

for i, pid in enumerate(patient_ids, start=1):
    gen_row = gen_dict[pid]
    prot_row = prot_dict.get(pid, {})
    meta_row = meta_dict.get(pid, {})
    trans_row = trans_dict.get(pid, {})
    life_row = life_dict.get(pid, {})
    env_row = env_dict.get(pid, {})
    out_row = out_dict.get(pid, {})
    
    gender = 'M' if gen_row.get("Gender") == "Male" else 'F'
    age = int(gen_row.get("Age", 45))
    district = gen_row.get("District_Kerala", "Kottayam")
    
    # 50/50 Group split
    is_test = i <= 50
    group = "TEST" if is_test else "CTRL"
    
    # Anonymized participant label
    name = f"Participant {pid}"
    
    # Genomics mapping
    snp_ace = gen_row.get("rs4762_ACE", 0)
    snp_ldlr = gen_row.get("rs6511720_LDLR", 0)
    snp_apoa5 = gen_row.get("rs662799_APOA5", 0)
    snp_mthfr = gen_row.get("rs1801133_MTHFR", 0)
    snp_tcf7l2 = gen_row.get("rs7903146_TCF7L2", 0)
    snp_9p21 = gen_row.get("rs1333049_9p21", 0)
    snp_pparg = gen_row.get("rs1801282_PPARG", 0)
    snp_nos3 = gen_row.get("rs1799983_NOS3", 0)
    
    ace_str = "II" if snp_ace == 0 else "ID" if snp_ace == 1 else "DD"
    pcsk9_str = "AA" if snp_ldlr == 0 else "AG" if snp_ldlr == 1 else "GG"
    hmgcoa_str = "GG" if snp_apoa5 == 0 else "GT" if snp_apoa5 == 1 else "TT"
    mthfr_str = "CC" if snp_mthfr == 0 else "CT" if snp_mthfr == 1 else "TT"
    tcf7l2_str = "CC" if snp_tcf7l2 == 0 else "CT" if snp_tcf7l2 == 1 else "TT"
    fto_str = "TT" if snp_9p21 == 0 else "TA" if snp_9p21 == 1 else "AA"
    pparg_str = "GG" if snp_pparg == 0 else "CG" if snp_pparg == 1 else "CC"
    nrf2_str = "CC" if snp_nos3 == 0 else "CT" if snp_nos3 == 1 else "TT"
    
    # genomic risk score
    total_risk = int(snp_ace + snp_ldlr + snp_apoa5 + snp_mthfr + snp_tcf7l2 + snp_9p21 + snp_pparg + snp_nos3)
    if total_risk <= 5:
        risk_tertile = "Low Genetic Risk (Tertile 1)"
    elif total_risk <= 10:
        risk_tertile = "Moderate Genetic Risk (Tertile 2)"
    else:
        risk_tertile = "High Genetic Risk (Tertile 3)"
        
    genomics_record = {
        "ace": ace_str,
        "pcsk9": pcsk9_str,
        "hmgcoa": hmgcoa_str,
        "mthfr": mthfr_str,
        "tcf7l2": tcf7l2_str,
        "fto": fto_str,
        "pparg": pparg_str,
        "nrf2": nrf2_str,
        "totalScore": total_risk,
        "riskTertile": risk_tertile
    }
    
    # Loop over EHR visits
    visits = patient_ehr_visits.get(pid, [])
    timepoints = {}
    
    for v in visits:
        v_type = v.Visit_Type
        if v_type == "Baseline":
            tp = "BL"
        elif v_type == "6-Month":
            tp = "M6"
        elif v_type == "12-Month":
            tp = "M12"
        else:
            continue
            
        is_baseline = (tp == "BL")
        
        # Clinical variables
        height = float(v.Height_cm)
        weight = float(v.Weight_kg)
        bmi = float(v.BMI)
        waist = float(v.Waist_Circumference_cm)
        hip = float(v.Hip_Circumference_cm)
        whr = float(v.WHR)
        
        sbp = float(v.SBP_mmHg)
        dbp = float(v.DBP_mmHg)
        hr = float(v.Heart_Rate_bpm)
        pulse_pressure = sbp - dbp
        mean_art_press = dbp + pulse_pressure / 3.0
        
        # Lipids/Glucoses
        tc = float(v.Total_Cholesterol_mgdL)
        ldl = float(v.LDL_mgdL)
        hdl = float(v.HDL_mgdL)
        tg = float(v.Triglycerides_mgdL)
        non_hdl = float(v.NonHDL_Cholesterol_mgdL)
        tc_hdl = float(v.TC_HDL_Ratio)
        ldl_hdl = float(v.LDL_HDL_Ratio)
        vldl = float(v.VLDL_mgdL)
        fbg = float(v.FBS_mgdL)
        hba1c = float(v.HbA1c_percent)
        insulin = float(v.Fasting_Insulin_uIU_mL) if pd.notna(v.Fasting_Insulin_uIU_mL) else 10.0
        homa_ir = (fbg * insulin) / 405.0
        
        creat = float(v.Creatinine_mgdL)
        egfr = float(v.eGFR_mL_min)
        alt = float(v.ALT_UL)
        ast = float(v.AST_UL)
        hs_crp = float(v.hsCRP_mgL)
        
        # BP category
        if sbp < 120 and dbp < 80:
            bp_cat = "Normal"
        elif sbp < 130 and dbp < 80:
            bp_cat = "Elevated"
        elif sbp < 140 or dbp < 90:
            bp_cat = "Stage 1 Hypertension"
        else:
            bp_cat = "Stage 2 Hypertension"
            
        # BMI category
        if bmi < 18.5:
            bmi_cat = "Underweight"
        elif bmi < 23:
            bmi_cat = "Normal (Asian)"
        elif bmi < 25:
            bmi_cat = "Overweight"
        elif bmi < 30:
            bmi_cat = "Obese I"
        else:
            bmi_cat = "Obese II"
            
        # Ejection fraction
        lvef = float(v.Echo_LVEF_percent) if pd.notna(v.Echo_LVEF_percent) else 55.0
        lvef_cat = "Normal LVEF (>=55%)" if lvef >= 55 else "Mildly Reduced LVEF (40-54%)" if lvef >= 40 else "Reduced LVEF (<40%)"
        gls = -20.0 + (lvef - 55.0) * 0.1
        gls_cat = "Normal GLS (<= -20%)" if gls <= -20 else "Subclinical LV Dysfunction (> -18%)" if gls >= -18 else "Borderline GLS (-18% to -20%)"
        
        # Proteomics mappings (from sheet 4 for this patient)
        mda = float(prot_row.get("MDA_umolL", 3.0))
        ohdg8 = float(prot_row.get("8_OHdG_ngmL", 12.0))
        nt_pro_bnp = float(prot_row.get("NT_proBNP_pgmL", 150.0))
        
        # Proxy FABP value using Troponin I or raw proxy
        troponin_i = float(prot_row.get("TroponinI_ngmL", 0.02))
        fabp_value = float(troponin_i / 0.05) if troponin_i > 0 else 0.5
        fabp_value = max(0.5, min(15.0, fabp_value))
        
        if fabp_value < 2.0:
            fabp_cat = "Normal (<2 ng/mL)"
        elif fabp_value < 6.0:
            fabp_cat = "Mildly Elevated (2-6 ng/mL)"
        elif fabp_value < 10.0:
            fabp_cat = "Elevated (6-10 ng/mL)"
        else:
            fabp_cat = "High Risk (>=10 ng/mL)"
            
        # Epigenetics longitudinal simulation based on intervention group
        if is_test and not is_baseline:
            # Intervention shows improvement
            factor = 1.25 if tp == "M6" else 1.45
            five_mc = 4.2 * factor
            nrf2_meth = 55.0 * (1.0 / factor)
            nrf2_exp = 1.2 * factor
            ho1 = 1.0 * factor
            nrf2_nuc = 40.0 * factor
            
            sod = 12.0 * factor
            gsh = 5.5 * factor
            gssg = 0.8 * (1.0 / factor)
        else:
            five_mc = 4.2
            nrf2_meth = 55.0
            nrf2_exp = 1.2
            ho1 = 1.0
            nrf2_nuc = 40.0
            
            sod = 12.0
            gsh = 5.5
            gssg = 0.8
            
        gsh_gssg = gsh / gssg
        osi = (mda / sod) * 100.0
        
        # Shannon Entropy
        composite_j = 0.82 + (0.04 if is_test and not is_baseline else 0.0) + (random.random() * 0.02)
        composite_j = min(0.98, max(0.65, composite_j))
        
        families = {}
        low_count = 0
        for fam in CODON_FAMILIES:
            val = composite_j * (0.85 + random.random() * 0.3)
            val = min(1.0, max(0.3, val))
            families[fam] = val
            if val < 0.78:
                low_count += 1
                
        # Compliance
        records = []
        overall_pct = 0.0
        if is_test and not is_baseline:
            # Simulate 12 fortnights for M6, 26 fortnights for M12
            weeks_count = 12 if tp == "M6" else 26
            total_del = 0
            total_cons = 0
            for w in range(1, weeks_count + 1):
                deliv = 350
                pct = 0.82 + random.random() * 0.15
                cons = int(deliv * pct)
                records.append({
                    "week": w * 2,
                    "delivered": deliv,
                    "consumed": cons,
                    "pct": pct * 100.0,
                    "quality": "Excellent",
                    "tolerability": "Good"
                })
                total_del += deliv
                total_cons += cons
            overall_pct = (total_cons / total_del * 100.0) if total_del > 0 else 0.0
            
        # Adverse events from outcomes sheet
        cvd_event = out_row.get("CVD_Event")
        event_type = out_row.get("Event_Type")
        ae_log = []
        
        if cvd_event == "Yes" and tp == "M12":
            desc = "Atherosclerotic Cardiovascular Event"
            if pd.notna(event_type):
                desc = str(event_type).replace("_", " ")
            ae_log.append({
                "event": desc,
                "severity": "Severe",
                "relationship": "Unrelated"
            })
            
        # Overall Health Score (deductions / additions)
        health_score = 75
        if sbp > 140: health_score -= 10
        if dbp > 90: health_score -= 5
        if bmi > 25: health_score -= 8
        if hba1c > 6.5: health_score -= 12
        if ldl > 130: health_score -= 8
        if lvef < 50: health_score -= 10
        if total_risk > 10: health_score -= 8
        if osi > 35: health_score -= 6
        
        if is_test and not is_baseline:
            health_score += 10 if tp == "M6" else 16
            
        health_score = max(25, min(98, round(health_score)))
        
        timepoints[tp] = {
            "timepoint": tp,
            "demographics": {
                "pid": pid,
                "name": name,
                "code": f"GRN-{district[:3].upper()}-{pid[2:]}",
                "group": group,
                "timepoint": tp,
                "district": district,
                "enrollDate": "2024-01-15",
                "dob": f"19{95 - age}-01-01",
                "sex": gender,
                "consentDate": "2024-01-15",
                "dietType": str(life_row.get("Diet_Type", "Traditional"))
            },
            "anthropometry": {
                "height": height,
                "weight": weight,
                "bmi": bmi,
                "bmiCategory": bmi_cat,
                "waist": waist,
                "hip": hip,
                "whr": whr,
                "bodyFat": 22.5,
                "muscleMass": 44.0
            },
            "vitals": {
                "sbpAvg": sbp,
                "dbpAvg": dbp,
                "pulsePressure": pulse_pressure,
                "map": mean_art_press,
                "hr": hr,
                "bpCategory": bp_cat
            },
            "labs": {
                "tc": tc,
                "ldl": ldl,
                "hdl": hdl,
                "tg": tg,
                "nonHdl": non_hdl,
                "tcHdlRatio": tc_hdl,
                "ldlHdlRatio": ldl_hdl,
                "vldl": vldl,
                "fbg": fbg,
                "hba1c": hba1c,
                "insulin": insulin,
                "homaIr": homa_ir,
                "creat": creat,
                "egfr": egfr,
                "alt": alt,
                "ast": ast,
                "hsCrp": hs_crp,
                "ntProBnp": nt_pro_bnp
            },
            "fabpNir": {
                "value": fabp_value,
                "category": fabp_cat,
                "date": "2024-01-15"
            },
            "echo": {
                "lvef": lvef,
                "lvefCategory": lvef_cat,
                "gls": gls,
                "glsCategory": gls_cat,
                "eWave": 0.8,
                "aWave": 0.7,
                "eaRatio": 1.14,
                "eSeptal": 8.0,
                "eLateral": 10.0,
                "eePrimeRatio": 8.0
            },
            "hrv": {
                "sdnn": 50.0 - (age * 0.2),
                "rmssd": 40.0 - (age * 0.15),
                "lfhf": 2.0,
                "shannon": 2.5,
                "autonomicBalance": "Balanced Autonomic Tone",
                "date": "2024-01-15"
            },
            "oxidativeStress": {
                "mda": mda,
                "sod": sod,
                "gsh": gsh,
                "gssg": gssg,
                "gshGssgRatio": gsh_gssg,
                "oxidativeStressIndex": osi,
                "catalase": 25.0,
                "gpx": 35.0,
                "ohdg8": ohdg8
            },
            "epigenetics": {
                "fiveMc": five_mc,
                "nrf2Meth": nrf2_meth,
                "nrf2Exp": nrf2_exp,
                "ho1": ho1,
                "nrf2Nuc": nrf2_nuc
            },
            "genomics": genomics_record,
            "shannonEntropy": {
                "compositeJ": composite_j,
                "lowFamiliesCount": low_count,
                "families": families
            },
            "compliance": {
                "records": records,
                "overallPct": overall_pct
            },
            "adverseEvents": {
                "total": len(ae_log),
                "log": ae_log
            },
            "overallHealthScore": health_score
        }
        
    # Check what visits are completed
    completed = "BL"
    if "M12" in timepoints:
        completed = "M12"
    elif "M6" in timepoints:
        completed = "M6"
        
    cohort_profiles.append({
        "pid": pid,
        "name": name,
        "gender": gender,
        "age": age,
        "district": district,
        "group": group,
        "timepoints": timepoints,
        "currentCompletedTimepoint": completed
    })

print(f"Parsed {len(cohort_profiles)} patient profiles successfully.")

# 3. Write output to keralaCohortData.ts
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w", encoding="utf-8") as f:
    f.write("import { PatientProfile } from '../types';\n\n")
    f.write("export const keralaCohortData: PatientProfile[] = ")
    json.dump(cohort_profiles, f, indent=2)
    f.write(";\n\nexport default keralaCohortData;\n")

print("TypeScript data module written successfully at:", output_path)
