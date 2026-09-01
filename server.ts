import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_RESOURCES, INITIAL_REVIEWS } from './src/data/initialResources';
import { Resource, Review, CheckIn, UserProfile } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// In-memory resource repository with initial seed data
let resourcesDatabase: Resource[] = [...INITIAL_RESOURCES];
let reviewsDatabase: Review[] = [...INITIAL_REVIEWS];
let checkInsDatabase: CheckIn[] = [
  {
    id: 'chk-1',
    resourceId: 'res-1',
    authorName: 'Volunteer Mark',
    statusNote: '14 emergency beds open as of 7:30 PM. Pet crates ready.',
    bedsAvailableNow: 14,
    timestamp: '25 minutes ago',
    lineLength: 'short',
  },
  {
    id: 'chk-2',
    resourceId: 'res-6',
    authorName: 'Dave H.',
    statusNote: 'Showers are hot and fast today. Fresh soap and socks available.',
    timestamp: '1 hour ago',
    lineLength: 'short',
  },
];

// System Prompts for each AI Specialist
const ADVISOR_SYSTEM_PROMPTS = {
  daisy_general: `You are Daisy, the warm, loyal, and fiercely protective mascot of "Daisy's Helping Paws". 
You are a Disney-styled pit bull with one sparkling blue eye, one warm brown eye, and a sleek black-and-white coat. You wear a teal rescue collar.
Your personality is deeply compassionate, encouraging, non-judgmental, trauma-informed, and practical.
You speak in a warm, comforting, yet clear and actionable voice (sometimes using gentle canine metaphors like "I've got your back", "let's sniff out the right resource together", "tail wag of hope").
You help unhoused individuals and families find emergency shelter, hot meals, free medical clinics, pet care, legal aid, mental health support, and benefits navigation.
Always prioritize safety: if someone is in life-threatening danger or experiencing a medical crisis, guide them to 911/988 immediately.
Keep responses concise, clear, readable on mobile screens, formatted with bullet points, and highly encouraging.`,

  caseworker: `You are the Lead AI Caseworker at Daisy's Helping Paws.
Your expertise is public benefits, social safety net programs, and poverty alleviation:
- SNAP / EBT Food Stamps (expedited processing, student/homeless exemptions, proof of zero income)
- Medicaid & Apple Health enrollment & retroactive coverage
- HUD Section 8, Emergency Housing Vouchers (EHV), Coordinated Entry (VI-SPDAT), and Rapid Re-Housing
- SSI / SSDI Disability benefits and the SOAR expedited homeless application model
- Free Lifeline / ACP Government Phones and tablets
- Homeless DMV ID fee waivers and birth certificate vital record acquisition
- Drafting formal appeal letters for benefit sanctions or wrongful termination
Always ask targeted questions to collect missing info if needed, and give step-by-step submission instructions.
Provide empathetic, trauma-informed, structured responses with clear checklists.`,

  doctor: `You are Dr. Morgan, the Volunteer AI Street Medicine Physician at Daisy's Helping Paws.
You provide compassionate, practical triage, preventive care, first-aid advice, and health navigation tailored specifically for individuals living unsheltered or in transitional housing.
Areas of focus:
- Street wound care, blister prevention, foot hygiene (trench foot prevention), burns, skin infections (cellulitis, staph)
- Weather exposure: hypothermia, frostbite, heat stroke, dehydration
- Managing chronic illness without refrigeration (e.g. keeping insulin safe, managing hypertension, asthma)
- Overdose response (Naloxone/Narcan) and harm reduction
- Identifying when symptoms require immediate Emergency Room care vs a free walk-in mobile clinic
DISCLAIMER: Always clarify that you provide triage, educational health guidance, and emergency assessment, but are not a substitute for in-person medical evaluation.`,

  vet: `You are Dr. Bailey, the Dedicated Street Veterinary Care AI at Daisy's Helping Paws, working hand-in-paw with Daisy!
You understand that companion animals (dogs, cats, and other pets) are family, emotional lifelines, and vital protectors for unhoused people.
Your expertise:
- Pet first aid: flea/tick control, wound cleaning, limping, hot spots, ear infections, paw pad care on hot asphalt/ice
- Low-cost and free pet food banks, pet-friendly emergency shelters, and free vaccination/microchip clinics
- Legal rights of Service Animals under the Americans with Disabilities Act (ADA) and Emotional Support Animals (ESA) under the Fair Housing Act (FHA)
- Pet heatstroke and hypothermia prevention in tents/vehicles
- Pet toxicities and safe low-cost nutrition tips
Provide loving, practical, highly supportive guidance without any judgment.`,

  lawyer: `You are Jordan Vance, Esq., the Public Interest Legal Advocate AI at Daisy's Helping Paws.
Your focus is civil rights, public defense, and administrative law for unhoused and low-income community members:
- Fourth Amendment rights protecting personal property against unreasonable search and unlawful seizure/destruction during encampment sweeps
- Right to adequate notice, personal belongings storage, and disability accommodations
- Right to sleep/shelter in public spaces (Martin v. Boise, Grants Pass precedents and state/local nuances)
- Appealing denial, reduction, or termination of SNAP, Medicaid, SSI, and Section 8 housing vouchers (Aid Paid Pending rights)
- Clearing municipal infractions, loitering/camping tickets, and outstanding low-level warrants
- Drafting legal declarations, sworn affidavits of homelessness for ID fee waivers, and formal grievance letters
DISCLAIMER: State that you provide legal education, form assistance, and advocacy templates, not formal representation in court.`,

  therapist: `You are Rowan, the Trauma-Informed Supportive Counselor AI at Daisy's Helping Paws.
You provide empathetic, non-judgmental crisis support, emotional de-escalation, and coping tools for stress, anxiety, PTSD, depression, grief, and the intense daily strain of homelessness.
Tools you use:
- 5-4-3-2-1 sensory grounding exercises
- Box breathing and diaphragmatic relaxation
- Cognitive reframing for shame, guilt, and burnout
- Affirming human dignity, self-worth, and resilience
- Crisis safety planning (connecting with 988 Suicide & Crisis Lifeline, 741741 Crisis Text Line, domestic violence resources)
Always be gentle, validating, and never dismissive. You are a steady, warm presence in difficult moments.`
};

// 1. AI Advisor Endpoint with Autonomous Multi-Channel Filing & Dispatch
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  try {
    const { role = 'daisy_general', message, history = [], userProfile, attachedNotice } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const ai = getGeminiClient();
    const systemPrompt = ADVISOR_SYSTEM_PROMPTS[role as keyof typeof ADVISOR_SYSTEM_PROMPTS] || ADVISOR_SYSTEM_PROMPTS.daisy_general;

    // Contextualize with user profile if available
    let contextualizedPrompt = systemPrompt;
    if (userProfile) {
      contextualizedPrompt += `\n\nUSER BACKGROUND CONTEXT (Keep private and use to tailor help seamlessly):
Name/Preferred: ${userProfile.preferredName || userProfile.fullName || 'Friend'}
Housing Status: ${userProfile.housingStatus || 'Unspecified'}
Location: ${userProfile.city || 'Seattle'}, ${userProfile.state || 'WA'} (${userProfile.currentLocationDesc || 'Not specified'})
Contact Phone: ${userProfile.phone || 'None / Message Phone'}
Contact Email: ${userProfile.email || userProfile.emailOrContact || 'None'}
Has Pets: ${userProfile.hasPets ? 'Yes (Pets: ' + (userProfile.pets?.map((p: any) => `${p.name} (${p.species}, ${p.breed || 'mix'})`).join(', ') || 'companion') + ')' : 'No'}
Veteran: ${userProfile.veteranStatus ? 'Yes' : 'No'}
Has Disability: ${userProfile.hasDisability ? 'Yes (' + (userProfile.disabilityDetails || 'Disclosed') + ')' : 'No'}
Monthly Income: ${userProfile.monthlyIncome !== undefined ? `$${userProfile.monthlyIncome}/mo` : '$0/mo'} (${userProfile.incomeSource || 'Zero / None'})
Current Benefits: SNAP: ${userProfile.hasSNAP ? 'Yes' : 'No'}, Medicaid: ${userProfile.hasMedicaid ? 'Yes' : 'No'}`;
    }

    if (attachedNotice) {
      contextualizedPrompt += `\n\nATTACHED NOTICE / INCOMING CORRESPONDENCE TO ANALYZE AND RESPOND TO:
${typeof attachedNotice === 'string' ? attachedNotice : JSON.stringify(attachedNotice)}`;
    }

    contextualizedPrompt += `\n\nCRITICAL DIRECTIVE - AUTONOMOUS DISPATCH & MULTI-CHANNEL COMMUNICATION:
You possess full autonomous communication capability across Email, SMS text messaging, Phone Calling with IVR navigation guidance, and Legal Document generation.
Whenever the user asks you to:
1. Apply for, claim, or file for any benefit, voucher, emergency shelter bed, SNAP food stamps, Medicaid, government phone, state ID waiver, SSI/SSDI, pet veterinary voucher, or food pantry assistance.
2. Draft or send an email, text message, or call script to an agency, intake line, caseworker, landlord, shelter, clinic, or 211.
3. Appeal, contest, or respond to an eviction notice, encampment sweep notice, benefit termination/denial, sanction, or recertification request.
4. Or whenever their request benefits from an immediate, ready-to-execute multi-channel communication packet.

You MUST return a clean JSON object adhering to this schema:
{
  "reply": "Warm, encouraging, trauma-informed markdown reply explaining what actions you have autonomously taken or prepared for them.",
  "dispatchPackage": {
    "formId": "snap_ebt" | "emergency_housing_voucher" | "medicaid" | "lifeline_phone" | "id_replacement_affidavit" | "benefit_denial_appeal" | "pet_wellness_voucher" | "shelter_intake_request" | "general_agency_inquiry",
    "formTitle": "Official name of the application or benefit package",
    "agencyName": "Target agency / organization name (e.g. Washington DSHS, Seattle Housing Authority, 211 Helpline)",
    "formalEmail": {
      "recipient": "Official agency intake email (e.g. intake@dshs.wa.gov or shelter.dispatch@kingcounty.gov)",
      "subject": "Clear, professional subject line including applicant name and emergency status",
      "body": "Complete, polite, formal email cover letter and declarations citing emergency homelessness, zero income (if applicable), and requested assistance"
    },
    "smsSummary": "Short, clear text message suitable for SMS dispatch to intake lines or caseworkers (under 240 chars)",
    "smsRecipient": "211 or agency SMS number",
    "phoneCallScript": {
      "agencyPhoneNumber": "Agency phone number (e.g. 1-877-501-2233 or 211)",
      "ivrNavigationSteps": [
        "Step 1: Press 1 for English (or 2 for Spanish)",
        "Step 2: Press 3 for Expedited Emergency Food / Cash Assistance",
        "Step 3: Say 'Representative' or press 0 to speak to a live intake caseworker"
      ],
      "openingStatement": "Spoken script applicant can read aloud verbatim when caseworker answers: 'Hello, my name is [Name]. I am currently unhoused with zero income and need to complete an emergency expedited intake interview today.'",
      "keyTalkingPoints": [
        "Mention zero income and lack of food/shelter for expedited 7-day processing",
        "Provide current contact phone / message address",
        "State disability accommodation or pet companion status if applicable"
      ]
    },
    "confirmationNumber": "DHP-WA-${Math.floor(100000 + Math.random() * 900000)}",
    "nextSteps": [
      "Submit or send the email package to the intake desk",
      "Keep phone nearby for interview callback",
      "Documents saved to your Daisy Vault"
    ],
    "fullDocumentContent": "Complete legal declaration or formal application package text"
  },
  "correspondenceAnalysis": {
    "summary": "Plain English explanation of what the letter/notice says in non-intimidating terms",
    "urgencyLevel": "high" | "medium" | "low",
    "criticalDeadline": "e.g. Appeal within 10 calendar days (by Friday)",
    "actionSteps": ["Step 1...", "Step 2..."],
    "draftResponseLetter": "Full formal response / appeal letter citing Aid Paid Pending rights",
    "recommendedRightsToAssert": ["Right to Fair Hearing", "Homelessness good-cause exception"]
  },
  "suggestedActions": [
    { "label": "Button text with emoji", "actionType": "fill_form" | "search_map" | "view_pet_care" | "call_hotline" | "open_document" | "grounding_exercise" | "auto_dispatch", "payload": {} }
  ]
}

Note: If the user is having a casual check-in or simple conversational exchange that does NOT require an application or communication dispatch, you may omit or set dispatchPackage and correspondenceAnalysis to null, returning only "reply" and "suggestedActions". Always ensure the output is valid JSON!`;

    // Build chat contents from history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.slice(-8).forEach((h: any) => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: typeof h.text === 'string' ? h.text : JSON.stringify(h.text) }],
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contents,
      config: {
        systemInstruction: contextualizedPrompt,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    let resultJson: any = {};
    try {
      resultJson = JSON.parse(response.text?.trim() || '{}');
    } catch (parseErr) {
      console.warn('Failed to parse advisor JSON output directly:', parseErr);
      resultJson = {
        reply: response.text || "I'm right here with you! Let's get the help you need.",
        suggestedActions: [
          { label: '🍱 Find Free Meals', actionType: 'search_map', payload: { category: 'food' } },
          { label: '🛏️ View Open Beds', actionType: 'search_map', payload: { category: 'shelter' } },
        ],
      };
    }

    // Ensure fallback actions if none provided
    if (!resultJson.suggestedActions || !Array.isArray(resultJson.suggestedActions) || resultJson.suggestedActions.length === 0) {
      const actions: any[] = [];
      const lower = (message + ' ' + (resultJson.reply || '')).toLowerCase();

      if (lower.includes('food') || lower.includes('snap') || lower.includes('ebt') || lower.includes('meal') || lower.includes('hungry')) {
        actions.push({ label: '🍱 Find Free Meals & Food Banks', actionType: 'search_map', payload: { category: 'food' } });
        actions.push({ label: '📝 Auto-Fill SNAP / EBT Application', actionType: 'fill_form', payload: { formId: 'snap_ebt' } });
      }
      if (lower.includes('bed') || lower.includes('shelter') || lower.includes('sleep') || lower.includes('housing') || lower.includes('voucher')) {
        actions.push({ label: '🛏️ View Open Emergency Beds', actionType: 'search_map', payload: { category: 'shelter', petFriendly: true } });
        actions.push({ label: '📋 Housing Voucher Application', actionType: 'fill_form', payload: { formId: 'emergency_housing_voucher' } });
      }
      if (lower.includes('dog') || lower.includes('cat') || lower.includes('pet') || lower.includes('kibble') || lower.includes('vaccine') || lower.includes('vet')) {
        actions.push({ label: '🐾 Free Pet Clinics & Pantries', actionType: 'search_map', payload: { category: 'vet' } });
        actions.push({ label: '🐕 Open Pet Wellness Hub', actionType: 'view_pet_care' });
      }
      if (lower.includes('doctor') || lower.includes('wound') || lower.includes('medicine') || lower.includes('sick') || lower.includes('clinic')) {
        actions.push({ label: '🩺 Free Mobile Health Clinics', actionType: 'search_map', payload: { category: 'medical' } });
        actions.push({ label: '🏥 Medicaid Enrollment Form', actionType: 'fill_form', payload: { formId: 'medicaid' } });
      }
      if (lower.includes('anxious') || lower.includes('scared') || lower.includes('overwhelmed') || lower.includes('panic') || lower.includes('grounding') || lower.includes('breathe')) {
        actions.push({ label: '🌿 Start 5-4-3-2-1 Calming Exercise', actionType: 'grounding_exercise' });
        actions.push({ label: '📞 Call 988 Free Crisis Lifeline', actionType: 'call_hotline', payload: { number: '988' } });
      }
      resultJson.suggestedActions = actions.slice(0, 3);
    }

    res.json(resultJson);
  } catch (error: any) {
    console.error('Advisor API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error while talking to advisor.' });
  }
});

// 2. Intelligent Form Filler & Gap Detector
app.post('/api/gemini/fill-form', async (req: Request, res: Response) => {
  try {
    const { formId, formDefinition, userProfile, customNotes } = req.body;

    const ai = getGeminiClient();

    const prompt = `You are the Expert Benefits Form Assistant at Daisy's Helping Paws.
Your task is to take the user's saved profile data and populate the specified assistance form application with high legal precision, complete clarity, and advocacy for maximum aid approval.

FORM DETAILS:
ID: ${formId || formDefinition?.id}
Title: ${formDefinition?.title || 'Public Benefit Application'}
Agency: ${formDefinition?.agencyName || 'State Department of Social Services'}
Description: ${formDefinition?.description || ''}
Fields Schema: ${JSON.stringify(formDefinition?.fields || [])}

USER PROFILE DATA:
${JSON.stringify(userProfile || {}, null, 2)}

ADDITIONAL APPLICANT NOTES / SITUATION:
${customNotes || 'None specified'}

INSTRUCTIONS:
1. Map every available profile field to the form field cleanly.
2. If any critical fields are missing from the profile (e.g. SSN, Date of Birth, Emergency Contact, Income Source), list them clearly as "missingFields" with a prompt asking the user for it so we can save it to their profile.
3. Generate a formal, respectful, and compelling "CoverLetterOrStatement" that unhoused applicants can submit alongside their form to highlight emergency expedited processing needs (e.g., zero income, shelter crisis, disability accommodation).
4. Provide a structured checklist of required attachments and physical/online submission instructions.

Return ONLY a valid JSON object matching this schema:
{
  "formTitle": string,
  "agency": string,
  "filledFields": [
    { "fieldKey": string, "label": string, "value": string, "isFilled": boolean }
  ],
  "missingFields": [
    { "fieldKey": string, "label": string, "prompt": string }
  ],
  "coverLetter": string,
  "submissionInstructions": [string],
  "readinessScore": number (0-100)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Fill Form API Error:', error);
    res.status(500).json({ error: error.message || 'Error auto-filling form.' });
  }
});

// 3. Government / Landlord Correspondence Analyzer & Appeal Generator
app.post('/api/gemini/analyze-notice', async (req: Request, res: Response) => {
  try {
    const { noticeText, noticeType, userProfile } = req.body;

    if (!noticeText) {
      return res.status(400).json({ error: 'Notice text is required' });
    }

    const ai = getGeminiClient();

    const prompt = `You are the Legal Advocate and Caseworker AI at Daisy's Helping Paws.
Analyze this official notice, letter, or denial received by an unhoused or low-income individual:

NOTICE TYPE: ${noticeType || 'General Notice / Denial Letter'}
NOTICE CONTENT:
${noticeText}

APPLICANT PROFILE:
${JSON.stringify(userProfile || {}, null, 2)}

Please perform a thorough analysis:
1. Explain what this letter means in simple, stress-free, plain English (no legal jargon).
2. Identify critical deadlines (e.g., "Must appeal within 10 days to keep benefits running").
3. Determine if the agency made common procedural errors (e.g. failure of notice, ignoring homeless address exceptions).
4. Draft a complete, formal, ready-to-sign Appeal Letter or Response Letter citing relevant legal rights and requesting Aid Paid Pending (continuation of benefits).

Return ONLY a valid JSON object:
{
  "summary": string,
  "urgencyLevel": "high" | "medium" | "low",
  "criticalDeadline": string,
  "actionSteps": [string],
  "draftResponseLetter": string,
  "recommendedRightsToAssert": [string]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Analyze Notice API Error:', error);
    res.status(500).json({ error: error.message || 'Error analyzing notice' });
  }
});

// 4. Guided Grounding & Calming Generator
app.post('/api/gemini/grounding-exercise', async (req: Request, res: Response) => {
  try {
    const { emotionalState, userPetName } = req.body;

    const ai = getGeminiClient();
    const prompt = `You are Daisy the supportive rescue pit bull mascot and Rowan the therapist at Daisy's Helping Paws.
Create a gentle, 2-minute somatic grounding exercise for an unhoused friend who is feeling ${emotionalState || 'overwhelmed and stressed'}.
${userPetName ? `Include their beloved pet companion named ${userPetName} in the sensory visualization!` : `Include Daisy the gentle pit bull mascot offering a warm paw and calm steady breathing.`}

Return ONLY a valid JSON object:
{
  "title": string,
  "estimatedMinutes": number,
  "steps": [
    {
      "stepNumber": number,
      "title": string,
      "instruction": string,
      "sensoryFocus": "Sight" | "Touch" | "Sound" | "Smell" | "Breath"
    }
  ],
  "affirmation": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Grounding API Error:', error);
    res.status(500).json({ error: error.message || 'Error generating grounding' });
  }
});

// 5. Multi-Channel Application Dispatch Suite (Email, SMS, Phone Call Triage & Auto-Apply)
app.post('/api/gemini/dispatch-package', async (req: Request, res: Response) => {
  try {
    const { formId, formTitle, agencyName, filledFields, userProfile, recipientEmail, hotlinePhone } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are the Lead Caseworker and Benefits Dispatch Specialist at Daisy's Helping Paws.
An unhoused applicant is ready to submit their application package for:
PROGRAM: ${formTitle || formId}
AGENCY: ${agencyName || 'Local Social Services Department'}

APPLICANT PROFILE & FORM DATA:
${JSON.stringify({ userProfile, filledFields }, null, 2)}

Please generate a comprehensive, multi-channel submission package:
1. "formalEmail":
   - "subject": Clear, professional subject line including applicant's name and program requested.
   - "body": Professional, respectful cover letter addressed to intake caseworkers citing emergency homelessness circumstances, zero-income expedited request (if applicable), and list of key declarations.
   - "recipient": "${recipientEmail || 'intake@socialservices.gov'}"

2. "smsSummary":
   - Short, punchy SMS text message suitable for sending to shelter bed dispatch, case manager text lines, or 211 hotlines (under 160 characters if possible, max 300).

3. "phoneCallScript":
   - "agencyPhoneNumber": "${hotlinePhone || '(206) 555-0100'}"
   - "ivrNavigationSteps": Step-by-step guidance on how to navigate the agency's automated phone menu (e.g., "Step 1: Press 1 for English; Step 2: Press 2 for SNAP/Food Assistance; Step 3: Wait for live caseworker").
   - "openingStatement": Exact words the applicant can read aloud when the live caseworker answers to state their identity, urgent homeless situation, and request for expedited phone interview.
   - "keyTalkingPoints": 3 bullet points of what to have in front of them (e.g., SSN last 4, shelter address, doctor's note).

4. "confirmationNumber": A simulated official tracking code (e.g., "DHP-WA-${Math.floor(100000 + Math.random() * 900000)}")

Return ONLY a valid JSON object:
{
  "formalEmail": { "subject": string, "body": string, "recipient": string },
  "smsSummary": string,
  "phoneCallScript": {
    "agencyPhoneNumber": string,
    "ivrNavigationSteps": [string],
    "openingStatement": string,
    "keyTalkingPoints": [string]
  },
  "confirmationNumber": string,
  "nextSteps": [string]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Dispatch Package API Error:', error);
    res.status(500).json({ error: error.message || 'Error generating application dispatch package.' });
  }
});

// 6. Resources REST Endpoints
app.get('/api/resources', (req: Request, res: Response) => {
  const { category, petFriendly, walkIn, verifiedOnly, search, lat, lng, radiusMiles } = req.query;

  let results = [...resourcesDatabase];

  if (category && category !== 'all') {
    results = results.filter((r) => r.category === category);
  }
  if (petFriendly === 'true') {
    results = results.filter((r) => r.petFriendly);
  }
  if (walkIn === 'true') {
    results = results.filter((r) => r.walkInAllowed);
  }
  if (verifiedOnly === 'true') {
    results = results.filter((r) => r.verificationTier === 'verified' || r.verificationTier === 'community_verified' || r.verified);
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.servicesOffered.some((s) => s.toLowerCase().includes(q)) ||
        r.city.toLowerCase().includes(q)
    );
  }

  // Calculate distance if lat/lng provided
  if (lat && lng) {
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    if (!isNaN(userLat) && !isNaN(userLng)) {
      results = results.map((r) => {
        const d = calculateDistanceMiles(userLat, userLng, r.lat, r.lng);
        return { ...r, distanceMiles: Math.round(d * 10) / 10 };
      }).sort((a: any, b: any) => (a.distanceMiles || 0) - (b.distanceMiles || 0));
    }
  }

  res.json({ resources: results, total: results.length });
});

app.post('/api/resources', (req: Request, res: Response) => {
  const reporterRole = req.body.reporterRole || 'Community Member';
  const reporterName = req.body.reporterName || 'Neighbor';

  const newResource: Resource = {
    id: `res-${Date.now()}`,
    name: req.body.name || 'Community Resource',
    category: req.body.category || 'shelter',
    description: req.body.description || '',
    address: req.body.address || '',
    city: req.body.city || 'Seattle',
    state: req.body.state || 'WA',
    zip: req.body.zip || '98101',
    lat: req.body.lat || 47.6062,
    lng: req.body.lng || -122.3321,
    phone: req.body.phone || '',
    website: req.body.website || '',
    hours: req.body.hours || 'Call for hours',
    petFriendly: Boolean(req.body.petFriendly),
    walkInAllowed: Boolean(req.body.walkInAllowed),
    wheelchairAccessible: Boolean(req.body.wheelchairAccessible),
    bedsAvailable: req.body.bedsAvailable ? Number(req.body.bedsAvailable) : undefined,
    totalBeds: req.body.totalBeds ? Number(req.body.totalBeds) : undefined,
    lastUpdated: 'Just now',
    rating: 5.0,
    reviewCount: 1,
    verified: reporterRole === 'Agency Staff' || reporterRole === 'Outreach Caseworker',
    verificationTier: reporterRole === 'Agency Staff' ? 'verified' : 'unverified',
    upvotesCount: 1,
    downvotesCount: 0,
    verificationLogs: [
      {
        id: `vl-${Date.now()}`,
        authorName: `${reporterName} (${reporterRole})`,
        action: 'confirmed',
        reason: 'Initial community submission & location report.',
        timestamp: 'Just now',
      },
    ],
    tags: req.body.tags || ['Community Added'],
    checkInsCount: 1,
    servicesOffered: req.body.servicesOffered || ['Community Support'],
    intakeRequirements: req.body.intakeRequirements || 'Open to all.',
  };

  resourcesDatabase.unshift(newResource);
  res.status(201).json({ success: true, resource: newResource });
});

// Verification Vote & Accuracy Endpoint
app.post('/api/resources/:id/verify', (req: Request, res: Response) => {
  const { action, authorName, reason } = req.body; // action: 'confirm' | 'flag'
  const resource = resourcesDatabase.find((r) => r.id === req.params.id);

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (!resource.verificationLogs) {
    resource.verificationLogs = [];
  }
  if (resource.upvotesCount === undefined) resource.upvotesCount = resource.verified ? 10 : 0;
  if (resource.downvotesCount === undefined) resource.downvotesCount = 0;

  const logEntry = {
    id: `vl-${Date.now()}`,
    authorName: authorName?.trim() || 'Community Neighbor',
    action: (action === 'flag' ? 'flagged' : 'confirmed') as 'confirmed' | 'flagged',
    reason: reason?.trim() || (action === 'flag' ? 'Reported inaccurate or closed.' : 'Confirmed open and accurate.'),
    timestamp: 'Just now',
  };

  resource.verificationLogs.unshift(logEntry);

  if (action === 'flag') {
    resource.downvotesCount += 1;
    // Check if downvotes exceed threshold
    if (resource.downvotesCount >= 3 && resource.downvotesCount > resource.upvotesCount) {
      resource.verificationTier = 'flagged_inaccurate';
    }
  } else {
    resource.upvotesCount += 1;
    // Upgrade to community verified if 3+ confirmations
    if (resource.verificationTier !== 'verified' && resource.upvotesCount >= 3) {
      resource.verificationTier = 'community_verified';
      resource.verified = true;
    }
  }

  resource.lastUpdated = 'Just now';

  res.json({
    success: true,
    verificationTier: resource.verificationTier,
    upvotesCount: resource.upvotesCount,
    downvotesCount: resource.downvotesCount,
    verificationLogs: resource.verificationLogs,
  });
});

// Reviews endpoints
app.get('/api/resources/:id/reviews', (req: Request, res: Response) => {
  const reviews = reviewsDatabase.filter((r) => r.resourceId === req.params.id);
  res.json({ reviews });
});

app.post('/api/resources/:id/reviews', (req: Request, res: Response) => {
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    resourceId: req.params.id,
    authorName: req.body.authorName || 'Community Neighbor',
    rating: Number(req.body.rating) || 5,
    text: req.body.text || '',
    date: 'Just now',
    waitTime: req.body.waitTime,
    safetyRating: req.body.safetyRating,
    cleanlinessRating: req.body.cleanlinessRating,
    staffHelpfulness: req.body.staffHelpfulness,
    petFriendlyFeedback: req.body.petFriendlyFeedback,
    helpfulVotes: 0,
  };

  reviewsDatabase.unshift(newReview);

  // Update resource average rating
  const resource = resourcesDatabase.find((r) => r.id === req.params.id);
  if (resource) {
    const resReviews = reviewsDatabase.filter((r) => r.resourceId === resource.id);
    const avg = resReviews.reduce((sum, r) => sum + r.rating, 0) / resReviews.length;
    resource.rating = Math.round(avg * 10) / 10;
    resource.reviewCount = resReviews.length;
  }

  res.status(201).json({ success: true, review: newReview });
});

// Check-ins endpoints
app.post('/api/resources/:id/checkins', (req: Request, res: Response) => {
  const newCheckIn: CheckIn = {
    id: `chk-${Date.now()}`,
    resourceId: req.params.id,
    authorName: req.body.authorName || 'Anonymous Friend',
    statusNote: req.body.statusNote || 'Checked in',
    bedsAvailableNow: req.body.bedsAvailableNow ? Number(req.body.bedsAvailableNow) : undefined,
    foodServingNow: req.body.foodServingNow,
    timestamp: 'Just now',
    lineLength: req.body.lineLength,
  };

  checkInsDatabase.unshift(newCheckIn);

  const resource = resourcesDatabase.find((r) => r.id === req.params.id);
  if (resource) {
    resource.checkInsCount = (resource.checkInsCount || 0) + 1;
    resource.recentStatus = newCheckIn.statusNote;
    resource.lastUpdated = 'Just now';
    if (newCheckIn.bedsAvailableNow !== undefined) {
      resource.bedsAvailable = newCheckIn.bedsAvailableNow;
    }
  }

  res.status(201).json({ success: true, checkIn: newCheckIn });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: "Daisy's Helping Paws API", timestamp: new Date().toISOString() });
});

// Haversine distance formula
function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daisy's Helping Paws Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
