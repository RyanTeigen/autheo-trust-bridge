// FHIR R4 Resource Types and Interfaces
export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
  implicitRules?: string;
  language?: string;
}

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: FHIRCoding[];
  tag?: FHIRCoding[];
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: FHIRCodeableConcept;
  system?: string;
  value?: string;
  period?: FHIRPeriod;
  assigner?: FHIRReference;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: FHIRPeriod;
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: FHIRPeriod;
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: FHIRPeriod;
}

// FHIR Patient Resource
export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceased?: boolean | string;
  address?: FHIRAddress[];
  maritalStatus?: FHIRCodeableConcept;
  multipleBirth?: boolean | number;
  photo?: FHIRAttachment[];
  contact?: FHIRPatientContact[];
  communication?: FHIRPatientCommunication[];
  generalPractitioner?: FHIRReference[];
  managingOrganization?: FHIRReference;
  link?: FHIRPatientLink[];
}

export interface FHIRAttachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
}

export interface FHIRPatientContact {
  relationship?: FHIRCodeableConcept[];
  name?: FHIRHumanName;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: FHIRReference;
  period?: FHIRPeriod;
}

export interface FHIRPatientCommunication {
  language: FHIRCodeableConcept;
  preferred?: boolean;
}

export interface FHIRPatientLink {
  other: FHIRReference;
  type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
}

// FHIR Observation Resource
export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  identifier?: FHIRIdentifier[];
  basedOn?: FHIRReference[];
  partOf?: FHIRReference[];
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  focus?: FHIRReference[];
  encounter?: FHIRReference;
  effective?: string | FHIRPeriod;
  issued?: string;
  performer?: FHIRReference[];
  // Generic value field (deprecated in favor of specific value types)
  value?: FHIRQuantity | FHIRCodeableConcept | string | boolean | number | FHIRRange;
  // Specific value types as per FHIR R4 specification
  valueQuantity?: FHIRQuantity;
  valueCodeableConcept?: FHIRCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: FHIRRange;
  valueDateTime?: string;
  valuePeriod?: FHIRPeriod;
  dataAbsentReason?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  note?: FHIRAnnotation[];
  bodySite?: FHIRCodeableConcept;
  method?: FHIRCodeableConcept;
  specimen?: FHIRReference;
  device?: FHIRReference;
  referenceRange?: FHIRObservationReferenceRange[];
  hasMember?: FHIRReference[];
  derivedFrom?: FHIRReference[];
  component?: FHIRObservationComponent[];
}

export interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
}

export interface FHIRAnnotation {
  author?: FHIRReference | string;
  time?: string;
  text: string;
}

export interface FHIRObservationReferenceRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
  type?: FHIRCodeableConcept;
  appliesTo?: FHIRCodeableConcept[];
  age?: FHIRRange;
  text?: string;
}

export interface FHIRObservationComponent {
  code: FHIRCodeableConcept;
  value?: FHIRQuantity | FHIRCodeableConcept | string | boolean | number | FHIRRange;
  dataAbsentReason?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRObservationReferenceRange[];
}

// FHIR Bundle for data exchange
export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  identifier?: FHIRIdentifier;
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  timestamp?: string;
  total?: number;
  link?: FHIRBundleLink[];
  entry?: FHIRBundleEntry[];
  signature?: FHIRSignature;
}

export interface FHIRBundleLink {
  relation: string;
  url: string;
}

export interface FHIRBundleEntry {
  link?: FHIRBundleLink[];
  fullUrl?: string;
  resource?: FHIRResource;
  search?: FHIRBundleEntrySearch;
  request?: FHIRBundleEntryRequest;
  response?: FHIRBundleEntryResponse;
}

export interface FHIRBundleEntrySearch {
  mode?: 'match' | 'include' | 'outcome';
  score?: number;
}

export interface FHIRBundleEntryRequest {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

export interface FHIRBundleEntryResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: FHIRResource;
}

export interface FHIRSignature {
  type: FHIRCoding[];
  when: string;
  who: FHIRReference;
  onBehalfOf?: FHIRReference;
  targetFormat?: string;
  sigFormat?: string;
  data?: string;
}

// External System Integration Types
export interface ExternalSystem {
  id: string;
  name: string;
  type: 'hospital' | 'lab' | 'pharmacy' | 'imaging' | 'ehr';
  endpoint: string;
  status: 'active' | 'inactive' | 'testing';
  authentication: {
    type: 'oauth2' | 'apikey' | 'basic' | 'certificate';
    credentials?: Record<string, string>;
  };
  capabilities: string[];
  lastSync?: string;
  configuration: Record<string, any>;
}

export interface DataMapping {
  id: string;
  sourceSystem: string;
  targetSystem: string;
  resourceType: string;
  fieldMappings: FieldMapping[];
  transformations: DataTransformation[];
}

export interface FieldMapping {
  sourcePath: string;
  targetPath: string;
  required: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  defaultValue?: any;
  validation?: ValidationRule[];
}

export interface DataTransformation {
  type: 'format' | 'lookup' | 'calculate' | 'combine' | 'split';
  config: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'pattern' | 'range' | 'enum' | 'custom';
  value: any;
  message: string;
}

// Telemedicine Types
export interface TelehealthSession {
  id: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  status: 'scheduled' | 'waiting' | 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  roomId: string;
  recordingEnabled: boolean;
  participants: SessionParticipant[];
  notes?: string;
  prescriptions?: FHIRReference[];
  followUpRequired?: boolean;
}

export interface SessionParticipant {
  userId: string;
  role: 'patient' | 'provider' | 'observer';
  joinedAt?: string;
  leftAt?: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'failed';
}

export interface VideoCallConfig {
  enableVideo: boolean;
  enableAudio: boolean;
  enableScreenShare: boolean;
  enableRecording: boolean;
  maxDuration: number;
  allowGuests: boolean;
}