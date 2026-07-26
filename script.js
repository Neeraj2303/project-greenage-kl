// ====================================================
        // STATE
        // ====================================================

        let currentGroup = 'TEST';
        let currentPID = 1;
        let currentTP = 'BL';
        let currentPanel = 'p_demo';
        let savedRecords = {};
        const PANELS = [
            'p_demo', 'p_anthro', 'p_risk', 'p_bp', 'p_labs',
            'p_fabp', 'p_echo', 'p_hrv', 'p_oxid', 'p_epigen',
            'p_snp', 'p_shannon', 'p_scores', 'p_micro',
            'p_adverse', 'p_summary'
        ];

        const NAV_IDS = [
            'nb_demo', 'nb_anthro', 'nb_risk', 'nb_bp',
            'nb_labs', 'nb_fabp', 'nb_echo', 'nb_hrv',
            'nb_oxid', 'nb_epigen', 'nb_snp', 'nb_shannon',
            'nb_scores', 'nb_micro', 'nb_adverse',
            'nb_summary'
        ];

        // ====================================================
        // GROUP / PID / TP MANAGEMENT
        // ====================================================

        function setGroup(g) {
            currentGroup = g;
            currentPID = 1;

            document.getElementById('btn_test').className =
                g === 'TEST' ? 'gt-btn active-test' : 'gt-btn';

            document.getElementById('btn_ctrl').className =
                g === 'CTRL' ? 'gt-btn active-ctrl' : 'gt-btn';

            updatePIDDisplay();
            buildProgressMap();
            loadRecord();
        }

        function updatePIDDisplay() {
            const el = document.getElementById('pid_display');
            const id = `${currentGroup}-${String(currentPID).padStart(3, '0')}`;
            if (el) {
                el.textContent = id;
                el.className = 'pid-display ' + (currentGroup === 'TEST' ? 'test' : 'ctrl');
            }
            const dPid = document.getElementById('d_pid');
            if (dPid) dPid.value = id;
            const dGroup = document.getElementById('d_group');
            if (dGroup) dGroup.value = currentGroup;
        }

        function showPanel(id) {
            PANELS.forEach(p => {
                const el = document.getElementById(p);
                if (el) el.classList.remove('active');
            });
            NAV_IDS.forEach(n => {
                const el = document.getElementById(n);
                if (el) el.classList.remove('active');
            });

            const panel = document.getElementById(id);
            if (panel) panel.classList.add('active');

            const idx = PANELS.indexOf(id);
            if (idx >= 0) {
                const navBtn = document.getElementById(NAV_IDS[idx]);
                if (navBtn) navBtn.classList.add('active');
            }
            currentPanel = id;

            if (id === 'p_summary') {
                updateSummaryPanel();
            }
        }

        function prevPID() {
            if (currentPID > 1) {
                currentPID--;
                updatePIDDisplay();
                loadRecord();
                buildProgressMap();
            }
        }

        function nextPID() {
            if (currentPID < 250) {
                currentPID++;
                updatePIDDisplay();
                loadRecord();
                buildProgressMap();
            }
        }

        function jumpPID(val) {
            const pid = parseInt(val, 10);
            if (pid >= 1 && pid <= 250) {
                currentPID = pid;
                updatePIDDisplay();
                loadRecord();
                buildProgressMap();
                const input = document.getElementById('pid_jump');
                if (input) input.value = '';
            }
        }

        function setTP(tp) {
            currentTP = tp;
            ['BL', 'M3', 'M6', 'M12'].forEach(t => {
                const btn = document.getElementById('tp' + t);
                if (btn) {
                    if (t === tp) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });
            loadRecord();
        }

        function prevSection() {
            const i = PANELS.indexOf(currentPanel);
            if (i > 0) showPanel(PANELS[i - 1]);
        }

        function nextSection() {
            const i = PANELS.indexOf(currentPanel);
            if (i < PANELS.length - 1) showPanel(PANELS[i + 1]);
        }

        // ====================================================
        // SAVE / LOAD
        // ====================================================

        function recKey() {
            return `${currentGroup}-${String(currentPID).padStart(3, '0')}-${currentTP}`;
        }

        function saveRecord() {

            const key = recKey();
            const data = {};

            document.querySelectorAll(
                'input:not([readonly]), select, textarea'
            ).forEach(el => {
                if (el.id)
                    data[el.id] =
                        el.type === 'checkbox'
                            ? el.checked
                            : el.value;
            });
            savedRecords[key] = data;

            localStorage.setItem(
                'greenage_data',
                JSON.stringify(savedRecords)
            );

            buildProgressMap();
            updateStats();

            showStatus('✓ Saved ' + key);

        }

        function loadRecord() {

            const key = recKey();

            // clear all inputs first

            document.querySelectorAll(
                'input, select, textarea'
            ).forEach(el => {

                if (el.id && !['d_group', 'd_pid'].includes(el.id)) {

                    if (el.type === 'checkbox')
                        el.checked = false;
                    else
                        el.value = '';
                }
            });

            const data = savedRecords[key];

            if (data) {
                Object.entries(data).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (!el) return;

                    if (el.type === 'checkbox')
                        el.checked = val;
                    else
                        el.value = val;
                });
            }

            updatePIDDisplay();
            recalculateAll();
        }

        function loadFromStorage() {
            const raw = localStorage.getItem('greenage_data');
            if (raw)
                savedRecords = JSON.parse(raw);

            updateStats();
            buildProgressMap();

        }

        // ====================================================
        // PROGRESS MAP
        // ====================================================

        function buildProgressMap() {

            const map = document.getElementById('prog_map');
            map.innerHTML = '';

            for (let i = 1; i <= 250; i++) {

                const cell = document.createElement('div');

                cell.className =
                    'prog-cell ' +
                    (currentGroup === 'TEST'
                        ? 'test-cell'
                        : 'ctrl-cell');

                const k =
                    `${currentGroup}-${String(i).padStart(3, '0')}-BL`;

                if (savedRecords[k])
                    cell.classList.add('saved');

                if (i === currentPID)
                    cell.classList.add('current');

                cell.title =
                    `${currentGroup}-${String(i).padStart(3, '0')}`;

                cell.onclick = () => {
                    currentPID = i;
                    updatePIDDisplay();
                    loadRecord();
                    buildProgressMap();
                };

                map.appendChild(cell);
            }
        }
        // ====================================================
        // STATS BAR
        // ====================================================

        function updateStats() {

            let test = 0, ctrl = 0;

            Object.keys(savedRecords).forEach(k => {
                if (k.includes('TEST') && k.endsWith('BL'))
                    test++;

                if (k.includes('CTRL') && k.endsWith('BL'))
                    ctrl++;
            });

            document.getElementById('stat_test').textContent = test;
            document.getElementById('stat_ctrl').textContent = ctrl;
            document.getElementById('stat_total').textContent = test + ctrl;
        }

        // ====================================================
        // CALCULATIONS
        // ====================================================

        function calcAge() {

            const dob =
                document.getElementById('d_dob').value;

            if (!dob) return;

            const age =
                Math.floor(
                    (new Date() - new Date(dob))
                    / (365.25 * 24 * 3600 * 1000)
                );

            document.getElementById('d_age').value = age;
            document.getElementById('sc_age').value = age;
        }

        function calcBMI() {

            const ht =
                parseFloat(document.getElementById('a_ht').value) / 100;

            const wt =
                parseFloat(document.getElementById('a_wt').value);

            if (!ht || !wt) return;

            const bmi = (wt / (ht * ht)).toFixed(2);

            document.getElementById('a_bmi').value = bmi;

            const b = parseFloat(bmi);
            const cat =
                b < 18.5 ? 'Underweight' :
                    b < 23 ? 'Normal (Asian)' :
                        b < 25 ? 'Overweight' :
                            b < 30 ? 'Obese I' :
                                'Obese II';

            document.getElementById('a_bmi_cat').value = cat;

        }

        function calcWHR() {

            const w = parseFloat(document.getElementById('a_waist').value);
            const h = parseFloat(document.getElementById('a_hip').value);

            if (w && h)
                document.getElementById('a_whr').value =
                    (w / h).toFixed(2);
        }

        function calcBPAvg() {

            const s1 = parseFloat(document.getElementById('v_sbp1').value) || 0;
            const s2 = parseFloat(document.getElementById('v_sbp2').value) || 0;

            const d1 = parseFloat(document.getElementById('v_dbp1').value) || 0;
            const d2 = parseFloat(document.getElementById('v_dbp2').value) || 0;

            const sbp = ((s1 + s2) / 2).toFixed(0);
            const dbp = ((d1 + d2) / 2).toFixed(0);

            document.getElementById('v_sbp_avg').value = sbp;
            document.getElementById('v_dbp_avg').value = dbp;

            document.getElementById('v_pp').value = (sbp - dbp).toFixed(0);

            document.getElementById('v_map').value =
                (parseFloat(dbp) +
                    parseFloat(sbp - dbp) / 3).toFixed(0);

            document.getElementById('sc_sbp').value = sbp;

            // BP Classification per AHA 2025
            let cls = 'Normal';

            const sp = parseFloat(sbp),
                dp = parseFloat(dbp);

            if (sp < 120 && dp < 80)
                cls = 'Normal';

            else if (sp >= 120 && sp <= 129 && dp < 80)
                cls = 'Elevated';

            else if ((sp >= 130 && sp <= 139) ||
                (dp >= 80 && dp <= 89))
                cls = 'Stage 1 Hypertension';

            else if (sp >= 140 || dp >= 90)
                cls = 'Stage 2 Hypertension';

            document.getElementById('v_bp_class').value = cls;
        }

        function classifyFABP() {

            const v = parseFloat(document.getElementById('f_nir').value);

            if (!v) return;

            const cat =
                v < 2 ? 'Normal (<2 ng/mL)' :
                    v < 6 ? 'Mildly elevated (2–6 ng/mL)' :
                        v < 10 ? 'Elevated (6–10 ng/mL)' :
                            'High Risk (>10 ng/mL)';

            document.getElementById('f_class').value = cat;
        }

        function classifyEcho() {

            const lvef = parseFloat(document.getElementById('e_lvef').value);

            if (!lvef) return;

            document.getElementById('e_lvef_cat').value =
                lvef >= 55 ? 'Normal (HFpEF range)' :
                    lvef >= 40 ? 'Mildly reduced (HFmrEF)' :
                        'Reduced (HFrEF)';
        }
        function classifyGLS() {

            const g = parseFloat(document.getElementById('e_gls').value);

            if (!g) return;

            document.getElementById('e_gls_cat').value =
                g <= -20 ? 'Normal (≤-20%)' :
                    g <= -18 ? 'Mildly abnormal (-18 to -20%)' :
                        'Subclinical LV dysfunction (> -18%)';
        }

        function classifyHRV() {

            const lf = parseFloat(document.getElementById('h_lfhf').value);

            if (!lf) return;

            document.getElementById('h_autonomic').value =
                lf < 1.0 ? 'Parasympathetic dominance' :
                    lf <= 2.5 ? 'Balanced' :
                        lf <= 4 ? 'Mild sympathetic dominance' :
                            'Sympathetic dominance (↑ CV risk)';
        }

        function calcMTHFR() {
            const el = document.getElementById('snp_mthfr');
            if (!el) return;
            const g = el.value;
            const action =
                g === 'TT'
                    ? 'High-dose folate + B12 essential'
                    : g === 'CT'
                        ? 'Folate supplementation advised'
                        : g === 'CC'
                            ? 'Standard methylation'
                            : '';
            const actionEl = document.getElementById('snp_mthfr_action');
            if (actionEl) actionEl.value = action;
            calcGenomics();
        }

        function calcGenomics() {
            let score = 0;
            let count = 0;

            // 1. ACE I/D
            const ace = document.getElementById('snp_ace')?.value || '';
            const aceRiskEl = document.getElementById('snp_ace_risk');
            if (aceRiskEl) {
                if (ace === 'DD') {
                    aceRiskEl.value = 'High risk (DD)';
                    score += 2;
                    count++;
                } else if (ace === 'ID') {
                    aceRiskEl.value = 'Intermediate risk (ID)';
                    score += 1;
                    count++;
                } else if (ace === 'II') {
                    aceRiskEl.value = 'Low risk (II)';
                    score += 0;
                    count++;
                } else {
                    aceRiskEl.value = '';
                }
            }

            // 2. PCSK9
            const pcsk9 = document.getElementById('snp_pcsk9')?.value || '';
            const pcsk9RiskEl = document.getElementById('snp_pcsk9_risk');
            if (pcsk9RiskEl) {
                if (pcsk9 === 'GG') {
                    pcsk9RiskEl.value = 'High risk (GG)';
                    score += 2;
                    count++;
                } else if (pcsk9 === 'AG') {
                    pcsk9RiskEl.value = 'Intermediate risk (AG)';
                    score += 1;
                    count++;
                } else if (pcsk9 === 'AA') {
                    pcsk9RiskEl.value = 'Low risk (AA)';
                    score += 0;
                    count++;
                } else {
                    pcsk9RiskEl.value = '';
                }
            }

            // 3. HMGCoA Reductase
            const hmgcoa = document.getElementById('snp_hmgcoa')?.value || '';
            const hmgcoaRspEl = document.getElementById('snp_hmgcoa_rsp');
            if (hmgcoaRspEl) {
                if (hmgcoa === 'TT') {
                    hmgcoaRspEl.value = 'Reduced statin response';
                    score += 2;
                    count++;
                } else if (hmgcoa === 'GT') {
                    hmgcoaRspEl.value = 'Intermediate response';
                    score += 1;
                    count++;
                } else if (hmgcoa === 'GG') {
                    hmgcoaRspEl.value = 'Normal response';
                    score += 0;
                    count++;
                } else {
                    hmgcoaRspEl.value = '';
                }
            }

            // 4. MTHFR C677T
            const mthfr = document.getElementById('snp_mthfr')?.value || '';
            const mthfrActionEl = document.getElementById('snp_mthfr_action');
            if (mthfrActionEl) {
                if (mthfr === 'TT') {
                    mthfrActionEl.value = 'High-dose folate + B12 essential';
                    score += 2;
                    count++;
                } else if (mthfr === 'CT') {
                    mthfrActionEl.value = 'Folate supplementation advised';
                    score += 1;
                    count++;
                } else if (mthfr === 'CC') {
                    mthfrActionEl.value = 'Standard methylation';
                    score += 0;
                    count++;
                } else {
                    mthfrActionEl.value = '';
                }
            }

            // 5. TCF7L2
            const tcf = document.getElementById('snp_tcf7l2')?.value || '';
            const tcfRiskEl = document.getElementById('snp_tcf7l2_risk');
            if (tcfRiskEl) {
                if (tcf === 'TT') {
                    tcfRiskEl.value = 'High diabetic risk';
                    score += 2;
                    count++;
                } else if (tcf === 'CT') {
                    tcfRiskEl.value = 'Moderate diabetic risk';
                    score += 1;
                    count++;
                } else if (tcf === 'CC') {
                    tcfRiskEl.value = 'Normal diabetic risk';
                    score += 0;
                    count++;
                } else {
                    tcfRiskEl.value = '';
                }
            }

            // 6. FTO
            const fto = document.getElementById('snp_fto')?.value || '';
            const ftoRiskEl = document.getElementById('snp_fto_risk');
            if (ftoRiskEl) {
                if (fto === 'AA') {
                    ftoRiskEl.value = 'High adiposity risk';
                    score += 2;
                    count++;
                } else if (fto === 'TA') {
                    ftoRiskEl.value = 'Moderate adiposity risk';
                    score += 1;
                    count++;
                } else if (fto === 'TT') {
                    ftoRiskEl.value = 'Normal adiposity risk';
                    score += 0;
                    count++;
                } else {
                    ftoRiskEl.value = '';
                }
            }

            // 7. PPARG
            const pparg = document.getElementById('snp_pparg')?.value || '';
            const ppargRiskEl = document.getElementById('snp_pparg_risk');
            if (ppargRiskEl) {
                if (pparg === 'CC') {
                    ppargRiskEl.value = 'High metabolic syndrome risk';
                    score += 2;
                    count++;
                } else if (pparg === 'CG') {
                    ppargRiskEl.value = 'Moderate risk';
                    score += 1;
                    count++;
                } else if (pparg === 'GG') {
                    ppargRiskEl.value = 'Low risk';
                    score += 0;
                    count++;
                } else {
                    ppargRiskEl.value = '';
                }
            }

            // 8. NRF2
            const nrf2 = document.getElementById('snp_nrf2')?.value || '';
            const nrf2RiskEl = document.getElementById('snp_keap1_ros');
            if (nrf2RiskEl) {
                if (nrf2 === 'TT') {
                    nrf2RiskEl.value = 'High ROS burden / low expression';
                    score += 2;
                    count++;
                } else if (nrf2 === 'CT') {
                    nrf2RiskEl.value = 'Moderate ROS burden';
                    score += 1;
                    count++;
                } else if (nrf2 === 'CC') {
                    nrf2RiskEl.value = 'Normal antioxidant response';
                    score += 0;
                    count++;
                } else {
                    nrf2RiskEl.value = '';
                }
            }

            // Update Total Genomic Score and Risk Tertile
            const totalEl = document.getElementById('snp_total_risk');
            const tertileEl = document.getElementById('snp_risk_tertile');

            if (count > 0) {
                if (totalEl) totalEl.value = score;
                if (tertileEl) {
                    if (score <= 5) {
                        tertileEl.value = 'Low Genetic Risk (Tertile 1)';
                    } else if (score <= 10) {
                        tertileEl.value = 'Intermediate Genetic Risk (Tertile 2)';
                    } else {
                        tertileEl.value = 'High Genetic Risk (Tertile 3)';
                    }
                }
            } else {
                if (totalEl) totalEl.value = '';
                if (tertileEl) tertileEl.value = '';
            }
        }

        function recalculateAll() {
            calcAge();
            calcBMI();
            calcWHR();
            calcBPAvg();
            classifyFABP();
            classifyEcho();
            classifyGLS();
            classifyHRV();
            calcGenomics();
            calcCompositeJP();
            updateSummaryPanel();
        }

        function updateSummaryPanel() {
            const summaryDiv = document.getElementById('summary_content');
            if (summaryDiv) {
                const name = document.getElementById('d_name')?.value || 'Anonymous Participant';
                const code = document.getElementById('d_code')?.value || 'N/A';
                const group = currentGroup;
                const tp = currentTP;
                const pid = `${currentGroup}-${String(currentPID).padStart(3, '0')}`;
                
                summaryDiv.innerHTML = `
                    <div style="background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px; padding: 12px 16px; display: flex; gap: 24px; margin-bottom: 16px; flex-wrap: wrap;">
                        <div><strong style="color: var(--teal)">ID:</strong> <span style="font-family: var(--mono)">${pid}</span></div>
                        <div><strong style="color: var(--teal)">Name:</strong> <span>${name}</span></div>
                        <div><strong style="color: var(--teal)">Study Code:</strong> <span style="font-family: var(--mono)">${code}</span></div>
                        <div><strong style="color: var(--teal)">Group:</strong> <span class="badge ${group === 'TEST' ? 'badge-test' : 'badge-ctrl'}">${group}</span></div>
                        <div><strong style="color: var(--teal)">Timepoint:</strong> <span class="badge" style="background: var(--amber-lt); color: var(--amber)">${tp}</span></div>
                    </div>
                `;
            }

            const tbody = document.getElementById('completeness_table');
            if (!tbody) return;

            tbody.innerHTML = '';

            const modules = [
                {
                    name: 'Demographics & Identification',
                    fields: [
                        { id: 'd_district', label: 'District' },
                        { id: 'd_enroll_date', label: 'Enrollment Date' },
                        { id: 'd_dob', label: 'Date of Birth' },
                        { id: 'd_sex', label: 'Sex' },
                        { id: 'd_consent_date', label: 'Consent Date' },
                        { id: 'd_diet', label: 'Diet Type' }
                    ]
                },
                {
                    name: 'Anthropometry',
                    fields: [
                        { id: 'a_ht', label: 'Height' },
                        { id: 'a_wt', label: 'Weight' }
                    ]
                },
                {
                    name: 'Risk Factors',
                    fields: [
                        { id: 'r_htn', label: 'Hypertension Status' },
                        { id: 'r_dm', label: 'Glycaemic Status' },
                        { id: 'r_smoke', label: 'Smoking Status' },
                        { id: 'r_eligible', label: 'Eligibility Status' }
                    ]
                },
                {
                    name: 'Blood Pressure & Vitals',
                    fields: [
                        { id: 'v_sbp1', label: 'SBP Reading 1' },
                        { id: 'v_dbp1', label: 'DBP Reading 1' },
                        { id: 'v_sbp2', label: 'SBP Reading 2' },
                        { id: 'v_dbp2', label: 'DBP Reading 2' },
                        { id: 'v_hr', label: 'Heart Rate' }
                    ]
                },
                {
                    name: 'Laboratory Tests',
                    fields: [
                        { id: 'l_tc', label: 'Total Cholesterol' },
                        { id: 'l_ldl', label: 'LDL-C' },
                        { id: 'l_hdl', label: 'HDL-C' },
                        { id: 'l_tg', label: 'Triglycerides' },
                        { id: 'l_fbg', label: 'Fasting Blood Glucose' },
                        { id: 'l_hba1c', label: 'HbA1c' },
                        { id: 'l_creat', label: 'Serum Creatinine' },
                        { id: 'l_egfr', label: 'eGFR' }
                    ]
                },
                {
                    name: 'FABP-NIR Spectroscopy',
                    fields: [
                        { id: 'f_nir', label: 'FABP-NIR Result' },
                        { id: 'f_date', label: 'Sample Collection Date' }
                    ]
                },
                {
                    name: 'Echocardiography',
                    fields: [
                        { id: 'e_lvef', label: 'LVEF' },
                        { id: 'e_gls', label: 'GLS' }
                    ]
                },
                {
                    name: 'CardioSense HRV',
                    fields: [
                        { id: 'h_date', label: 'Recording Date' },
                        { id: 'h_sdnn', label: 'SDNN' },
                        { id: 'h_rmssd', label: 'RMSSD' },
                        { id: 'h_lfhf', label: 'LF/HF Ratio' },
                        { id: 'h_shannon', label: 'Shannon Entropy' }
                    ]
                },
                {
                    name: 'Oxidative Stress',
                    fields: [
                        { id: 'ox_mda', label: 'MDA' },
                        { id: 'ox_sod', label: 'SOD Activity' }
                    ]
                },
                {
                    name: 'Epigenetic Markers',
                    fields: [
                        { id: 'ep_5mc', label: 'Global 5-mC' },
                        { id: 'ep_nrf2_meth', label: 'NRF2 Promoter Methylation' },
                        { id: 'ep_nrf2_exp', label: 'NRF2 Expression' },
                        { id: 'ep_ho1', label: 'HO-1 Expression' },
                        { id: 'ep_nrf2_nuc', label: 'NRF2 Nuclear Localisation' }
                    ]
                },
                {
                    name: 'SNP Genotyping',
                    fields: [
                        { id: 'snp_ace', label: 'ACE Genotype' },
                        { id: 'snp_pcsk9', label: 'PCSK9 Genotype' },
                        { id: 'snp_hmgcoa', label: 'HMGCoA Genotype' },
                        { id: 'snp_mthfr', label: 'MTHFR Genotype' },
                        { id: 'snp_tcf7l2', label: 'TCF7L2 Genotype' },
                        { id: 'snp_fto', label: 'FTO Genotype' },
                        { id: 'snp_pparg', label: 'PPARG Genotype' },
                        { id: 'snp_nrf2', label: 'NRF2 Genotype' }
                    ]
                },
                {
                    name: 'Shannon J\' Entropy',
                    customCheck: () => {
                        const scoreVal = document.getElementById('jp_composite')?.value;
                        if (scoreVal && parseFloat(scoreVal) > 0) {
                            return { status: 'Complete', missing: [] };
                        }
                        return { status: 'Pending', missing: ['Requires H\' value input entries'] };
                    }
                },
                {
                    name: 'Cardiovascular Risk Scores',
                    fields: [
                        { id: 'sc_prevent', label: 'PREVENT Score' },
                        { id: 'sc_frs', label: 'Framingham Score' }
                    ]
                },
                {
                    name: 'Microgreen Compliance',
                    customCheck: () => {
                        if (currentGroup === 'CTRL') {
                            return { status: 'N/A', missing: ['Control Group'] };
                        }
                        const missed = document.getElementById('comp_missed')?.value;
                        if (missed !== undefined && missed !== '') {
                            return { status: 'Complete', missing: [] };
                        }
                        return { status: 'Pending', missing: ['Compliance summaries'] };
                    }
                },
                {
                    name: 'Adverse Events',
                    fields: [
                        { id: 'ae_total', label: 'Total AEs Reported' }
                    ]
                }
            ];

            modules.forEach(m => {
                let status = 'Pending';
                let missing = [];

                if (m.customCheck) {
                    const res = m.customCheck();
                    status = res.status;
                    missing = res.missing;
                } else {
                    let filledCount = 0;
                    m.fields.forEach(f => {
                        const val = document.getElementById(f.id)?.value;
                        if (val !== undefined && val !== '') {
                            filledCount++;
                        } else {
                            missing.push(f.label);
                        }
                    });

                    if (filledCount === m.fields.length) {
                        status = 'Complete';
                    } else if (filledCount > 0) {
                        status = 'Partial';
                    } else {
                        status = 'Pending';
                    }
                }

                let badgeClass = 'badge-ctrl';
                let badgeStyle = '';
                let statusText = '✓ Complete';

                if (status === 'Complete') {
                    badgeClass = 'badge-ctrl';
                    statusText = '✓ Complete';
                } else if (status === 'Partial') {
                    badgeClass = '';
                    badgeStyle = 'background: #ffeb80; color: #8a6d3b;';
                    statusText = '⚠ Partial';
                } else if (status === 'N/A') {
                    badgeClass = '';
                    badgeStyle = 'background: var(--bg); color: var(--mid); border: 1px solid var(--border);';
                    statusText = '— Not Applicable';
                } else {
                    badgeClass = '';
                    badgeStyle = 'background: var(--red-lt); color: var(--red);';
                    statusText = '✗ Pending';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: 500; padding: 10px 12px;">${m.name}</td>
                    <td style="padding: 10px 12px;">
                        <span class="badge ${badgeClass}" style="${badgeStyle}">${statusText}</span>
                    </td>
                    <td style="color: var(--mid); font-size: 0.72rem; padding: 10px 12px;">
                        ${missing.length > 0 ? missing.join(', ') : '—'}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        // lipid auto calculations

        document.addEventListener('input', e => {

            const tc = parseFloat(document.getElementById('l_tc')?.value) || 0;

            const ldl = parseFloat(document.getElementById('l_ldl')?.value) || 0;

            const hdl = parseFloat(document.getElementById('l_hdl')?.value) || 0;

            const tg = parseFloat(document.getElementById('l_tg')?.value) || 0;

            const fbg = parseFloat(document.getElementById('l_fbg')?.value) || 0;

            const ins = parseFloat(document.getElementById('l_insulin')?.value) || 0;

            const gsh = parseFloat(document.getElementById('ox_gsh')?.value) || 0;

            const gssg = parseFloat(document.getElementById('ox_gssg')?.value) || 0;

            const mda = parseFloat(document.getElementById('ox_mda')?.value) || 0;

            const sod = parseFloat(document.getElementById('ox_sod')?.value) || 0;

            if (tc && hdl) {
                document.getElementById('l_nonhdl').value = (tc - hdl).toFixed(1);
                document.getElementById('l_tc_hdl').value = (tc / hdl).toFixed(2);
                document.getElementById('sc_nonhdl').value = (tc - hdl).toFixed(1);
            }

            if (ldl && hdl)
                document.getElementById('l_ldl_hdl').value = (ldl / hdl).toFixed(2);

            if (tg)
                document.getElementById('l_vldl').value = (tg / 5).toFixed(1);

            if (hdl) {
                document.getElementById('sc_hdl').value = hdl;
                document.getElementById('frs_hdl').value = hdl;
            }

            if (fbg && ins)
                document.getElementById('l_homa').value = ((fbg * ins) / 405).toFixed(2);

            if (document.getElementById('l_hba1c')?.value)
                document.getElementById('sc_hba1c').value = document.getElementById('l_hba1c').value;

            if (document.getElementById('l_egfr')?.value)
                document.getElementById('sc_egfr').value = document.getElementById('l_egfr').value;

            if (tc)
                document.getElementById('frs_tc').value = tc;

            if (gsh && gssg)
                document.getElementById('ox_ratio').value = (gsh / gssg).toFixed(1);

            if (mda && sod && sod > 0) {
                document.getElementById('ox_index').value = (mda / sod * 100).toFixed(2);
                document.getElementById('ox_mda_cat').value =
                    mda < 1 ? 'Normal (<1 μmol/L)' :
                        mda < 3 ? 'Mildly elevated' :
                            'High oxidative stress';

                document.getElementById('ox_sod_cat').value =
                    sod > 50 ? 'Adequate' :
                        sod > 30 ? 'Borderline' :
                            'Reduced antioxidant capacity';
            }

            // Echo E/A, E/e'

            const ewave = parseFloat(document.getElementById('e_ewave')?.value) || 0;

            const awave = parseFloat(document.getElementById('e_awave')?.value) || 0;

            const elat = parseFloat(document.getElementById('e_elat')?.value) || 0;

            const esep = parseFloat(document.getElementById('e_esep')?.value) || 0;

            if (ewave && awave)
                document.getElementById('e_ea').value = (ewave / awave).toFixed(2);

            if (ewave && elat && esep) {
                const avg = (elat + esep) / 2;
                document.getElementById('e_ee').value = (ewave / avg).toFixed(1);
            }

        });
        // ====================================================
        // SHANNON J' TABLE
        // ====================================================

        const AA_FAMILIES = [

            { aa: 'Met + Trp', group: 'Single-codon (no degeneracy)', n: 2, hmax: 1.0 },

            { aa: 'Phe', group: 'Doublet', n: 2, hmax: 1.0 },
            { aa: 'Tyr', group: 'Doublet', n: 2, hmax: 1.0 },
            { aa: 'Cys', group: 'Doublet', n: 2, hmax: 1.0 },
            { aa: 'His', group: 'Doublet (basic)', n: 2, hmax: 1.0 },
            { aa: 'Asn', group: 'Doublet', n: 2, hmax: 1.0 },
            { aa: 'Asp', group: 'Doublet', n: 2, hmax: 1.0 },
            { aa: 'Gln', group: 'Doublet', n: 2, hmax: 1.0 },
            { aa: 'Glu', group: 'Doublet', n: 2, hmax: 1.0 },
            { aa: 'Lys', group: 'Doublet (basic)', n: 2, hmax: 1.0 },

            { aa: 'Ile', group: 'Triplet', n: 3, hmax: 1.585 },

            { aa: 'Val', group: 'Quartet', n: 4, hmax: 2.0 },
            { aa: 'Thr', group: 'Quartet', n: 4, hmax: 2.0 },
            { aa: 'Pro', group: 'Quartet', n: 4, hmax: 2.0 },
            { aa: 'Ala', group: 'Quartet', n: 4, hmax: 2.0 },
            { aa: 'Gly', group: 'Quartet', n: 4, hmax: 2.0 },

            { aa: 'Ser', group: 'Hextet', n: 6, hmax: 2.585 },
            { aa: 'Leu', group: 'Hextet', n: 6, hmax: 2.585 },
            { aa: 'Arg', group: 'Hextet (basic)', n: 6, hmax: 2.585 },

            { aa: 'Stop codons', group: 'Triplet (term.)', n: 3, hmax: 1.585 },
        ];

        function buildShannonTable() {
            const tbody = document.getElementById('shannon_table_body');
            if (!tbody) return;
            tbody.innerHTML = '';
            AA_FAMILIES.forEach((f, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                          <td style="font-weight:600;">${f.aa}</td>
                          <td>${f.group}</td>
                          <td style="font-family:var(--mono);text-align:center;">${f.n}</td>
                          <td>
                              <input type="number" step="0.001" id="jp_h_${i}" style="width:80px" oninput="calcJP(${i}, ${f.hmax})">
                          </td>
                          <td style="font-family:var(--mono);text-align:center;">${f.hmax.toFixed(3)}</td>
                          <td>
                              <input type="number" readonly class="calc-out" id="jp_jp_${i}" style="width:80px" step="0.001">
                          </td>
                          <td>
                              <input type="text" readonly class="calc-out" id="jp_status_${i}" style="width:130px">
                          </td>
                      `;
                tbody.appendChild(tr);
            });
        }

        function calcJP(i, hmax) {

            const h = parseFloat(
                document.getElementById(`jp_h_${i}`)?.value
            ) || 0;

            const jp = hmax > 0 ? (h / hmax) : 0;

            document.getElementById(`jp_jp_${i}`).value = jp.toFixed(3);

            document.getElementById(`jp_status_${i}`).value =
                jp >= 0.8 ? 'High resilience' :
                    jp >= 0.6 ? 'Adequate' :
                        jp >= 0.4 ? '⚠ Low — review' :
                            '✗ Critical';

            calcCompositeJP();
        }

        function calcCompositeJP() {

            let vals = [], lowCount = 0;

            AA_FAMILIES.forEach((_, i) => {

                const v = parseFloat(
                    document.getElementById(`jp_jp_${i}`)?.value
                ) || 0;

                if (v > 0) {
                    vals.push(v);
                    if (v < 0.6) lowCount++;
                }
            });

            if (!vals.length) return;

            const mean = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3);

            const minv = Math.min(...vals).toFixed(3);

            document.getElementById('jp_mean').value = mean;
            document.getElementById('jp_min_obs').value = minv;
            document.getElementById('jp_low_count').value = lowCount;
            document.getElementById('jp_intervention').value =
                lowCount >= 3
                    ? 'YES – Dose escalation triggered'
                    : 'No';

            document.getElementById('jp_composite').value = mean;

            const cat =
                parseFloat(mean) >= 0.8 ? 'High Resilience' :
                    parseFloat(mean) >= 0.6 ? 'Adequate Resilience' :
                        parseFloat(mean) >= 0.4 ? 'Reduced Resilience' :
                            'Critical — Intervene';

            document.getElementById('jp_cat').value = cat;

            const doseEl = document.getElementById('jp_amf_dose') || document.getElementById('jp_sfn_dose');
            if (doseEl) {
                doseEl.value =
                    lowCount >= 3
                        ? 'Escalate to 60 g/day broccoli'
                        : lowCount >= 1
                            ? 'Maintain 50 g/day'
                            : 'Standard 50 g/day';
            }
        }
        // ====================================================
        // COMPLIANCE TABLE
        // ====================================================

        function buildComplianceTable() {

            const tbody = document.getElementById('compliance_table');

            tbody.innerHTML = '';

            const weeks = [
                2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
                22, 24, 26, 28, 30, 32, 34, 36, 38, 40,
                42, 44, 46, 48, 50, 52
            ];

            weeks.forEach(w => {

                const tr = document.createElement('tr');

                tr.innerHTML = `

      <td style="font-family:var(--mono);text-align:center;font-weight:600;">
      W${w}
      </td>

      <td><input type="number" value="350"
      style="width:70px" id="comp_del_${w}"></td>

      <td><input type="number"
      id="comp_con_${w}"
      style="width:70px"
      oninput="calcCompPct(${w})"></td>

      <td><input type="number"
      id="comp_pct_${w}"
      readonly class="calc-out"
      style="width:60px"></td>

      <td>
      <select id="comp_q_${w}" style="width:90px">
      <option>Excellent</option>
      <option>Good</option>
      <option>Fair</option>
      <option>Poor</option>
      </select>
      </td>

      <td>
      <select id="comp_tol_${w}" style="width:90px">
      <option>Good</option>
      <option>Mild GI</option>
      <option>Nausea</option>
      <option>Refused</option>
      </select>
      </td>

      <td>
      <input type="text"
      id="comp_note_${w}"
      placeholder="Notes"
      style="min-width:120px">
      </td>
                      `;

                tbody.appendChild(tr);
            });
        }

        function calcCompPct(w) {

            const del = parseFloat(
                document.getElementById(`comp_del_${w}`).value
            ) || 350;

            const con = parseFloat(
                document.getElementById(`comp_con_${w}`).value
            ) || 0;

            const pct = (con / del * 100).toFixed(1);

            document.getElementById(`comp_pct_${w}`).value = pct;
        }
        // ====================================================
        // EXPORT CSV
        // ====================================================

        function exportCSV() {

            const allKeys = Object.keys(savedRecords);

            if (!allKeys.length) {
                showStatus('No saved records to export');
                return;
            }

            let fields = new Set();

            allKeys.forEach(k =>
                Object.keys(savedRecords[k])
                    .forEach(f => fields.add(f))
            );

            fields = ['record_key', ...Array.from(fields)];

            let csv = fields.join(',') + '\n';

            allKeys.forEach(k => {

                const row = [
                    k,
                    ...fields.slice(1).map(f => {
                        const v = (savedRecords[k][f] || '')
                            .toString()
                            .replace(/,/g, ';')
                            .replace(/\n/g, ' ');
                        return `"${v}"`;
                    })
                ];

                csv += row.join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a');

            a.href = URL.createObjectURL(blob);

            a.download =
                `GREENAGE_KL_Data_${new Date().toISOString().slice(0, 10)}.csv`;

            a.click();

            showStatus(`✓ Exported ${allKeys.length} records`);
        }

        function showStatus(msg) {

            const el = document.getElementById('status_msg');

            el.textContent = msg;

            setTimeout(() => el.textContent = '', 3500);
        }

        // ====================================================
        // INIT
        // ====================================================

        window.addEventListener('DOMContentLoaded', () => {

            loadFromStorage();
            buildProgressMap();
            buildShannonTable();
            buildComplianceTable();
            updatePIDDisplay();
            loadRecord();

            document.addEventListener('change', e => {
                if (e.target.id && e.target.id.startsWith('snp_')) {
                    calcGenomics();
                }
            });

        });
