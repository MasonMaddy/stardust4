# Sector & compliance — AU/NZ early childhood education

Externally sourced sector facts that shape what Xplor Education's software must support. Load this
whenever work touches sign-in/out, sleep/nappy checks, ratios, attendance, funding, or learning
frameworks. **Facts checked July 2026** against the cited sources; regulations change — re-verify
before encoding anything into a shipped feature, and never assert Xplor's own compliance posture
from this file.

## Australia

### The regulatory frame
- The **National Quality Framework (NQF)** regulates early childhood education and care and OSHC:
  National Law + National Regulations, the National Quality Standard, assessment & rating, and
  approved learning frameworks. **ACECQA** guides it nationally; state/territory regulatory
  authorities do approvals, monitoring, and ratings.
  ([education.gov.au](https://www.education.gov.au/early-childhood/about/quality-and-safety/national-quality-framework))
- The **National Quality Standard (NQS)** has 7 quality areas — QA1 Educational program and
  practice · QA2 Children's health and safety · QA3 Physical environment · QA4 Staffing
  arrangements · QA5 Relationships with children · QA6 Collaborative partnerships with families
  and communities · QA7 Governance and leadership. Services are rated per area plus overall.
  ([acecqa.gov.au](https://www.acecqa.gov.au/nqf/national-quality-standard))

### Learning frameworks (what educators document against)
- **EYLF V2.0 (2022)** — *Belonging, Being and Becoming* — birth to 5. **MTOP V2.0 (2022)** —
  *My Time, Our Place* — school-age care (OSHC/vacation care). V2.0 mandated from 1 Feb 2024.
  ([acecqa.gov.au](https://www.acecqa.gov.au/nqf/national-law-regulations/approved-learning-frameworks))

### Ratios (centre-based, National Regulations)
- Birth–24 months **1:4** (all jurisdictions) · over 24–36 months **1:5** (except VIC: 1:4 for all
  under-3s) · over 36 months to preschool age **varies by state** — 1:11 (ACT, NT, QLD, SA, VIC)
  vs 1:10 (NSW); WA and TAS have their own thresholds. **Ratio features need per-state rules, not
  one national table.** Family day care: max 7 per educator, no more than 4 preschool-age or under.
  Mixed-age groups: each age range's ratio must hold concurrently.
  ([acecqa.gov.au/nqf/educator-to-child-ratios](https://www.acecqa.gov.au/nqf/educator-to-child-ratios))

### Attendance & compliance records (what our sign-in and check features exist for)
- **Regulation 158** (159 for family day care): attendance records must capture each child's full
  name, date and time of arrival/departure, **signed at the time** by the person
  delivering/collecting the child or by the nominated supervisor/an educator — the legal basis of
  Hub/Playground sign-in. Retained **3 years** after the child's last day (reg 183).
  ([austlii reg 158](https://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/nsw/consol_reg/eacsnr422/s158.html),
  [NSW DoE](https://education.nsw.gov.au/early-childhood-education/leadership/news/keeping-attendance))
- **Sleep/rest:** reg 84A requires meeting each child's sleep/rest needs; from Oct 2023 **reg 84B**
  requires policies covering supervision and monitoring during sleep, including the **method and
  frequency of safety checks and documentation of sleep/rest periods** — the basis of sleep-check
  logging. Reg 84C adds an annual risk assessment.
  ([acecqa safe sleep](https://www.acecqa.gov.au/resources/supporting-materials/infosheet/safe-sleep-and-rest-practices))
- **Nappy/toileting:** practice is governed by NQS QA2 guidance (hygiene, never leave a child on a
  change table); **no specific regulation mandating per-change logs was found** — nappy logging is
  service-policy/NQS-driven, not a numbered record-keeping regulation. Don't claim otherwise.
  (ACECQA QA2 guidance via [acecqa.gov.au](https://www.acecqa.gov.au/nqf/national-quality-standard))
- Adequate **supervision** is required at all times (NQS 2.2.1); ratios alone don't satisfy it.

### Child Care Subsidy (CCS — why session data matters)
- CCS is the government's main fee assistance: families are assessed via Services Australia,
  subsidy is generally paid **to the provider** and passed on as a fee reduction; families pay the
  gap fee. ([education.gov.au](https://www.education.gov.au/early-childhood/providers/child-care-subsidy))
- Providers must submit a **session report per child per week** via the CCS System (through
  third-party software — this is the BMS integration point). Session reports drive subsidy
  calculation; inaccurate or late reports mean wrong family payments and can breach the law.
  ([session reports](https://www.education.gov.au/early-childhood/providers/howto/session-reports))
- From 5 Jan 2026 the **3 Day Guarantee** replaced the activity test: at least 72 subsidised hours
  per fortnight for eligible families (100 for First Nations children and specified circumstances).
  ([3 Day Guarantee](https://www.education.gov.au/early-childhood/providers/child-care-subsidy/3-day-guarantee))

### Service types
- **Centre Based Day Care** (long day care) · **OSHC** (before/after school; **vacation care** is
  OSHC during holidays) · **Family Day Care** (educator's home) · In Home Care.
  ([service types](https://www.education.gov.au/early-childhood/about/service-types))

## New Zealand

- **Te Whāriki (2017)** is the bicultural national curriculum: 4 principles (Whakamana ·
  Kotahitanga · Whānau tangata · Ngā hononga) woven with 5 strands (Mana atua Wellbeing · Mana
  whenua Belonging · Mana tangata Contribution · Mana reo Communication · Mana aotūroa
  Exploration). NZ learning documentation uses this taxonomy, **not** EYLF outcomes.
  ([education.govt.nz](https://www.education.govt.nz/early-childhood/teaching-and-learning/te-whariki))
- Services are licensed under the **Education (Early Childhood Services) Regulations 2008** (in
  force as at Feb 2026) plus MoE licensing criteria, which require attendance registers, enrolment
  records, staff records, and policies (child protection, medication, sleep).
  ([legislation.govt.nz](https://www.legislation.govt.nz/regulation/public/2008/0204/latest/dlm1412637.html))
- **Ratios are national** (Schedule 2): centre-based **1:5 under 2**, **1:10 for 2+** (varies by
  service type/session — read the schedule before encoding). No per-state logic needed.
  ([MoE ratios](https://www.education.govt.nz/education-professionals/early-learning/running-ece-centre/adult-child-ratios-early-learning-services))
- **Funding:** services claim via the **RS7 Return, 3×/year**, per the ECE Funding Handbook.
  **20 Hours ECE** (up to 20 funded hours/week) is evidenced by a signed per-child attestation plus
  attendance records kept for audit; the **Three Week Rule** and **Frequent Absence Rule** stop
  funding for absences and must be applied in the RS7.
  ([funding handbook](https://www.education.govt.nz/early-childhood/funding-and-data/funding-handbooks/ece-funding-handbook))

## Material AU↔NZ differences (design checklist)

| Concern | AU | NZ |
|---|---|---|
| Learning docs taxonomy | EYLF/MTOP V2.0 outcomes | Te Whāriki principles + strands |
| Funding pipeline | Weekly per-child **session reports** to the CCS System; subsidy reconciled per session | Periodic bulk **RS7 returns** (3×/yr) backed by locally kept attendance + 20-Hours attestations |
| Ratios | National Regulations **with per-state overrides** | National (Schedule 2), no state logic |
| Sign-in/out | Regs 158/159: **signed** arrival/departure times, 3-year retention | Licensing criteria + funding-audit driven; less prescriptive on signatures |

## Known caveats (do not paper over)
- Per-state ratio table cells beyond those listed (esp. WA/TAS) unverified — check ACECQA before
  encoding. NZ Schedule 2 varies by service type and session (e.g. sessional over-2 differs from
  all-day); read it directly.
- NZ's 2008 Regulations **were amended effective 23 Feb 2026** (Education and Training (ECE
  Reform) Amendment Act 2025) — evidence suggests structural/governance changes rather than ratio
  values, but re-read Schedule 2 before encoding ratios.
- No AU regulation mandates per-event nappy logs (sleep documentation *is* mandated via reg 84B).
