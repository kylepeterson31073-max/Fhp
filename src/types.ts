export type ResourceCategory = 
  | 'shelter'
  | 'food'
  | 'medical'
  | 'vet'
  | 'legal'
  | 'hygiene'
  | 'mental_health'
  | 'warming_cooling'
  | 'job_training'
  | 'id_assistance';

export type VerificationTier = 
  | 'verified'              // Official staff / agency verified
  | 'community_verified'    // Confirmed by 3+ neighbors/volunteers
  | 'unverified'            // Newly reported, pending validation
  | 'flagged_inaccurate';   // Reported as closed or incorrect

export interface VerificationLog {
  id: string;
  authorName: string;
  action: 'confirmed' | 'flagged';
  reason?: string;
  timestamp: string;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  website?: string;
  hours: string;
  petFriendly: boolean;
  walkInAllowed: boolean;
  wheelchairAccessible: boolean;
  bedsAvailable?: number;
  totalBeds?: number;
  lastUpdated: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  verificationTier?: VerificationTier;
  upvotesCount?: number;
  downvotesCount?: number;
  verificationLogs?: VerificationLog[];
  tags: string[];
  checkInsCount: number;
  recentStatus?: string;
  servicesOffered: string[];
  intakeRequirements?: string;
  distanceMiles?: number;
}

export interface SevereWeatherAlert {
  id: string;
  type: 'freeze' | 'heat' | 'air_quality' | 'storm';
  title: string;
  description: string;
  temperature?: string;
  protocolActive: boolean;
  unlockedServices: string[];
  expiresAt?: string;
}

export interface Review {
  id: string;
  resourceId: string;
  authorName: string;
  rating: number;
  text: string;
  date: string;
  waitTime?: string;
  safetyRating?: number;
  cleanlinessRating?: number;
  staffHelpfulness?: number;
  petFriendlyFeedback?: string;
  helpfulVotes: number;
}

export interface CheckIn {
  id: string;
  resourceId: string;
  authorName: string;
  statusNote: string;
  bedsAvailableNow?: number;
  foodServingNow?: boolean;
  timestamp: string;
  lineLength?: 'none' | 'short' | 'moderate' | 'long';
}

export interface PetInfo {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  age?: string;
  isServiceOrESA: boolean;
  vaccinated: boolean;
  specialNeeds?: string;
  dietaryNeeds?: string;
}

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'action_required'
  | 'approved'
  | 'denied';

export interface ApplicationTimelineEvent {
  timestamp: string;
  status: ApplicationStatus;
  note: string;
}

export interface TrackedApplication {
  id: string;
  formId: string;
  formTitle: string;
  agencyName: string;
  status: ApplicationStatus;
  confirmationNumber?: string;
  submittedAt: string;
  nextActionDate?: string;
  notes?: string;
  history: ApplicationTimelineEvent[];
}

export interface SavedDocument {
  id: string;
  title: string;
  formType: string;
  createdAt: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  preferredName: string;
  dob?: string;
  dateOfBirth?: string;
  ssnLast4: string;
  phone: string;
  email?: string;
  emailOrContact?: string;
  currentLocationDesc?: string;
  city?: string;
  state?: string;
  zip?: string;
  housingStatus: 'unsheltered' | 'sheltered' | 'emergency_shelter' | 'vehicle' | 'couch_surfing' | 'at_risk_eviction' | 'transitional' | 'permanent_supportive';
  monthlyIncome?: number | string;
  incomeSource?: string;
  veteranStatus: boolean;
  hasDisability: boolean;
  disabilityDetails?: string;
  hasMedicaid?: boolean;
  hasSNAP?: boolean;
  hasGovId?: boolean;
  familyMembersCount?: number;
  hasPets: boolean;
  pets: PetInfo[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContact?: {
    name: string;
    relationship?: string;
    phone: string;
  };
  urgentNeeds?: string[];
  notes?: string;
  savedDocuments: SavedDocument[];
  trackedApplications?: TrackedApplication[];
  favoriteResourceIds?: string[];
}

export type AiAdvisorRole = 
  | 'daisy_general'
  | 'caseworker'
  | 'doctor'
  | 'vet'
  | 'lawyer'
  | 'therapist';

export interface DispatchPackage {
  formId?: string;
  formTitle?: string;
  agencyName?: string;
  formalEmail?: {
    recipient: string;
    subject: string;
    body: string;
  };
  smsSummary?: string;
  smsRecipient?: string;
  phoneCallScript?: {
    agencyPhoneNumber: string;
    ivrNavigationSteps: string[];
    openingStatement: string;
    keyTalkingPoints: string[];
  };
  confirmationNumber?: string;
  nextSteps?: string[];
  fullDocumentContent?: string;
}

export interface CorrespondenceAnalysis {
  summary: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  criticalDeadline?: string;
  actionSteps: string[];
  draftResponseLetter: string;
  recommendedRightsToAssert?: string[];
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  role: AiAdvisorRole;
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'fill_form' | 'search_map' | 'view_pet_care' | 'call_hotline' | 'open_document' | 'grounding_exercise' | 'auto_dispatch';
    payload?: any;
  }[];
  dispatchPackage?: DispatchPackage;
  correspondenceAnalysis?: CorrespondenceAnalysis;
  formUpdates?: Partial<UserProfile>;
}

export interface BenefitFormField {
  key: keyof UserProfile | string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
  options?: string[];
  description?: string;
  profileFieldMapping?: keyof UserProfile;
}

export interface BenefitFormDefinition {
  id: string;
  title: string;
  category: 'food' | 'housing' | 'healthcare' | 'income' | 'legal' | 'communication';
  agencyName: string;
  description: string;
  timeToComplete: string;
  fields: BenefitFormField[];
  documentChecklist: string[];
  submissionTips: string[];
  officialUrl?: string;
  defaultEmailRecipient?: string;
  defaultSmsHotline?: string;
  defaultPhoneTriage?: string;
}
