import { BenefitFormDefinition } from '../types';

export const BENEFIT_FORMS: BenefitFormDefinition[] = [
  {
    id: 'snap_ebt',
    title: 'SNAP / Food Stamps (EBT) Expedited Application',
    category: 'food',
    agencyName: 'Department of Social & Health Services / USDA FNS',
    description: 'Supplemental Nutrition Assistance Program providing monthly funds on an EBT card to buy groceries and nutritious food. Expedited processing delivers emergency benefits within 7 days if monthly income/cash is under $150.',
    timeToComplete: '5 - 10 mins',
    officialUrl: 'https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program',
    documentChecklist: [
      'Proof of Identity (State ID, Driver License, Work/School ID, or Collateral Contact Statement)',
      'Proof of Income (if any, e.g. paystubs, SSI award letter, or statement of $0 income)',
      'Proof of Housing Expenses (if paying for motel, vehicle payment, or shelter)',
      'Social Security Number (or waiver affidavit)'
    ],
    submissionTips: [
      'If you have less than $150 in monthly income and under $100 in cash, check "Expedited SNAP" for benefits in 7 days or less.',
      'You DO NOT need a permanent address to qualify. You can list a shelter, church, general delivery at a post office, or the local DSHS office address.',
      'Homeless individuals are exempt from standard work requirements.'
    ],
    fields: [
      { key: 'fullName', label: 'Full Legal Name', type: 'text', profileFieldMapping: 'fullName', description: 'Your first, middle, and last legal name' },
      { key: 'preferredName', label: 'Preferred Name / Nickname', type: 'text', profileFieldMapping: 'preferredName' },
      { key: 'dob', label: 'Date of Birth (MM/DD/YYYY)', type: 'date', profileFieldMapping: 'dob' },
      { key: 'ssnLast4', label: 'SSN (or Last 4 Digits)', type: 'text', profileFieldMapping: 'ssnLast4' },
      { key: 'phone', label: 'Contact Phone Number (or message phone)', type: 'text', profileFieldMapping: 'phone' },
      { key: 'currentLocationDesc', label: 'Mailing / Physical Contact Address (Shelter, Cross Streets, or General Delivery)', type: 'text', profileFieldMapping: 'currentLocationDesc' },
      { key: 'housingStatus', label: 'Housing Situation', type: 'select', options: ['Unsheltered / Outdoors', 'Emergency Shelter', 'Vehicle / RV', 'Motel / Hotel', 'Temporarily with others'], profileFieldMapping: 'housingStatus' },
      { key: 'monthlyIncome', label: 'Current Monthly Gross Income ($)', type: 'text', profileFieldMapping: 'monthlyIncome' },
      { key: 'incomeSource', label: 'Source of Income (e.g., None, Day Labor, SSI, General Assistance)', type: 'text', profileFieldMapping: 'incomeSource' },
      { key: 'familyMembersCount', label: 'Number of people in household who purchase and prepare food together', type: 'number', profileFieldMapping: 'familyMembersCount' },
      { key: 'hasPets', label: 'Do you have companion pets? (For pet food pantry cross-referral)', type: 'boolean', profileFieldMapping: 'hasPets' }
    ]
  },
  {
    id: 'medicaid',
    title: 'Medicaid & Apple Health / Healthcare Enrollment',
    category: 'healthcare',
    agencyName: 'Health Care Authority (HCA) / State Medicaid Agency',
    description: 'Comprehensive free health coverage for low-income and unhoused individuals and families covering doctor visits, emergency hospital care, prescription medications, mental health, dental, and substance use treatment.',
    timeToComplete: '8 - 12 mins',
    documentChecklist: [
      'Proof of Identity',
      'Proof of Citizenship / Eligible Immigration Status',
      'Proof of Income (or self-attestation of zero income for unhoused)'
    ],
    submissionTips: [
      'Medicaid covers past medical bills up to 3 months prior to application date (Retroactive Coverage).',
      'Covers free transportation / bus passes to and from medical and therapy appointments.',
      'No monthly premiums or copays for individuals with income under 138% Federal Poverty Level.'
    ],
    fields: [
      { key: 'fullName', label: 'Legal Name', type: 'text', profileFieldMapping: 'fullName' },
      { key: 'dob', label: 'Date of Birth', type: 'date', profileFieldMapping: 'dob' },
      { key: 'ssnLast4', label: 'Social Security Number', type: 'text', profileFieldMapping: 'ssnLast4' },
      { key: 'phone', label: 'Phone or Outreach Worker Phone', type: 'text', profileFieldMapping: 'phone' },
      { key: 'currentLocationDesc', label: 'Address or Shelter for Medical Card Delivery', type: 'text', profileFieldMapping: 'currentLocationDesc' },
      { key: 'monthlyIncome', label: 'Estimated Monthly Income', type: 'text', profileFieldMapping: 'monthlyIncome' },
      { key: 'hasDisability', label: 'Do you have a chronic physical or mental health condition?', type: 'boolean', profileFieldMapping: 'hasDisability' },
      { key: 'urgentNeeds', label: 'Immediate Medical or Dental Needs', type: 'textarea' }
    ]
  },
  {
    id: 'emergency_housing_voucher',
    title: 'Emergency Housing Voucher & Coordinated Entry Intake',
    category: 'housing',
    agencyName: 'HUD / Continuum of Care (CoC) Coordinated Entry',
    description: 'Priority assessment and intake for rapid re-housing, permanent supportive housing, emergency shelter vouchers, and motel stay assistance for vulnerable unhoused individuals.',
    timeToComplete: '10 - 15 mins',
    documentChecklist: [
      'Homeless Verification Letter (from shelter, outreach worker, or self-certification)',
      'Government Photo ID (if available, assistance provided if lost)',
      'Disability Verification (if applicable for Supportive Housing priority)',
      'Income documentation (or zero-income affidavit)'
    ],
    submissionTips: [
      'Coordinated Entry uses a vulnerability index (VI-SPDAT) to match housing based on highest health/safety needs.',
      'Keep your contact information updated monthly so caseworkers do not skip your name when a unit opens.',
      'Disclose all pets—many programs have pet-friendly supportive housing units.'
    ],
    fields: [
      { key: 'fullName', label: 'Full Legal Name', type: 'text', profileFieldMapping: 'fullName' },
      { key: 'dob', label: 'Date of Birth', type: 'date', profileFieldMapping: 'dob' },
      { key: 'phone', label: 'Reliable Contact Phone / Case Worker Phone', type: 'text', profileFieldMapping: 'phone' },
      { key: 'currentLocationDesc', label: 'Where do you sleep most nights? (e.g., Tent, Vehicle, Emergency Shelter, Outdoor Bench)', type: 'text', profileFieldMapping: 'currentLocationDesc' },
      { key: 'housingStatus', label: 'Duration of Homelessness', type: 'select', options: ['Less than 6 months', '6 to 12 months', '1 to 3 years', 'More than 3 years (Chronic)'] },
      { key: 'veteranStatus', label: 'Are you a U.S. Military Veteran? (Eligible for HUD-VASH & SSVF)', type: 'boolean', profileFieldMapping: 'veteranStatus' },
      { key: 'hasDisability', label: 'Do you have any disabling physical, mental, or developmental condition?', type: 'boolean', profileFieldMapping: 'hasDisability' },
      { key: 'hasPets', label: 'Do you have companion pets that need to stay with you?', type: 'boolean', profileFieldMapping: 'hasPets' },
      { key: 'emergencyContact', label: 'Alternative Contact (Friend, Outreach worker, Shelter staff)', type: 'text' }
    ]
  },
  {
    id: 'ssi_ssdi',
    title: 'SSI / SSDI Disability Benefits Navigator Intake',
    category: 'income',
    agencyName: 'Social Security Administration (SSA)',
    description: 'Supplemental Security Income (SSI) provides monthly financial support (up to $943+/mo) and Medicaid for individuals with physical or mental impairments that prevent substantial employment.',
    timeToComplete: '15 mins',
    documentChecklist: [
      'Medical Records and list of clinics/doctors seen',
      'Birth Certificate & Social Security Card',
      'List of medications taken',
      'Work history for past 5-10 years'
    ],
    submissionTips: [
      'The SOAR (SSI/SSDI Outreach, Access, and Recovery) model increases homeless approval rates to over 65% on first application.',
      'Our AI Caseworker & Doctor will help you formulate the Functional Impairment Narrative required by SSA.'
    ],
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', profileFieldMapping: 'fullName' },
      { key: 'dob', label: 'Date of Birth', type: 'date', profileFieldMapping: 'dob' },
      { key: 'ssnLast4', label: 'Social Security Number', type: 'text', profileFieldMapping: 'ssnLast4' },
      { key: 'disabilityDetails', label: 'Primary Health Conditions (Physical, Mental, Cognitive, Pain)', type: 'textarea', profileFieldMapping: 'disabilityDetails' },
      { key: 'incomeSource', label: 'Current Sources of Income', type: 'text', profileFieldMapping: 'incomeSource' },
      { key: 'notes', label: 'How does your condition impact daily activities (walking, lifting, focusing, sleeping)?', type: 'textarea', profileFieldMapping: 'notes' }
    ]
  },
  {
    id: 'lifeline_phone',
    title: 'Lifeline & ACP Free Smartphone & Unlimited Data Program',
    category: 'communication',
    agencyName: 'Federal Communications Commission (FCC) / Lifeline',
    description: 'Free Android smartphone with unlimited talk, text, and monthly high-speed data for eligible unhoused and low-income individuals participating in SNAP, Medicaid, or SSI.',
    timeToComplete: '3 mins',
    documentChecklist: [
      'Proof of participation in SNAP, Medicaid, SSI, or Veterans Pension (Award letter or screenshot of portal)',
      'Government Photo ID or shelter proof of identity'
    ],
    submissionTips: [
      'Street outreach kiosks and partner non-profits distribute phones same-day upon verification.',
      'One free line per household.'
    ],
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', profileFieldMapping: 'fullName' },
      { key: 'dob', label: 'Date of Birth', type: 'date', profileFieldMapping: 'dob' },
      { key: 'ssnLast4', label: 'Last 4 Digits of SSN', type: 'text', profileFieldMapping: 'ssnLast4' },
      { key: 'currentLocationDesc', label: 'Address / Shelter for Delivery or Pickup', type: 'text', profileFieldMapping: 'currentLocationDesc' },
      { key: 'hasSNAP', label: 'Do you currently receive SNAP / EBT?', type: 'boolean', profileFieldMapping: 'hasSNAP' },
      { key: 'hasMedicaid', label: 'Do you currently have Medicaid / Apple Health?', type: 'boolean', profileFieldMapping: 'hasMedicaid' }
    ]
  },
  {
    id: 'id_replacement_affidavit',
    title: 'Homeless ID Fee Waiver & Vital Records Request Affidavit',
    category: 'legal',
    agencyName: 'Department of Licensing & State Vital Statistics',
    description: 'Legal sworn affidavit and fee waiver request to obtain a certified state ID card and birth certificate at zero cost under state homeless fee waiver statutes.',
    timeToComplete: '5 mins',
    documentChecklist: [
      'Verification letter of homelessness from recognized shelter or outreach provider',
      'Any secondary documentation (Social Security card, school transcript, medical record)'
    ],
    submissionTips: [
      'Most state DMVs waive the $54+ ID fee with an authorized homeless service provider verification form.',
      'Birth certificates can be ordered expedited through legal aid clinics.'
    ],
    fields: [
      { key: 'fullName', label: 'Full Legal Name on Birth Certificate', type: 'text', profileFieldMapping: 'fullName' },
      { key: 'dob', label: 'Date of Birth', type: 'date', profileFieldMapping: 'dob' },
      { key: 'city', label: 'City & State of Birth', type: 'text' },
      { key: 'ssnLast4', label: 'Social Security Number', type: 'text', profileFieldMapping: 'ssnLast4' },
      { key: 'currentLocationDesc', label: 'Current Shelter or Mailing Address for Delivery', type: 'text', profileFieldMapping: 'currentLocationDesc' }
    ]
  },
  {
    id: 'benefit_denial_appeal',
    title: 'Public Benefit Denial Appeal & Fair Hearing Request',
    category: 'legal',
    agencyName: 'Office of Administrative Hearings / Appeals Bureau',
    description: 'Formal legal request for an administrative fair hearing to appeal improper denial, sanction, reduction, or termination of SNAP, Medicaid, or Cash Assistance benefits.',
    timeToComplete: '7 mins',
    documentChecklist: [
      'Notice of Action / Denial Letter received from state agency',
      'Supporting documents showing continuing eligibility'
    ],
    submissionTips: [
      'If filed within 10-15 days of the notice, you have the right to "Aid Paid Pending" (benefits continue uninterrupted while waiting for the judge).',
      'Our AI Lawyer will draft the exact statutory arguments citing due process and good cause.'
    ],
    fields: [
      { key: 'fullName', label: 'Appellant Full Name', type: 'text', profileFieldMapping: 'fullName' },
      { key: 'phone', label: 'Contact Phone for Hearing', type: 'text', profileFieldMapping: 'phone' },
      { key: 'currentLocationDesc', label: 'Mailing Address for Hearing Notice', type: 'text', profileFieldMapping: 'currentLocationDesc' },
      { key: 'incomeSource', label: 'Benefit Type Being Appealed (SNAP, Medicaid, Cash, Housing Voucher)', type: 'text' },
      { key: 'notes', label: 'Reason for Denial Stated on Notice & Your Explanation of Error', type: 'textarea' }
    ]
  }
];
