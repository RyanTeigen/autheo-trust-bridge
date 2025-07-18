import { 
  FHIRResource, 
  FHIRPatient, 
  FHIRObservation, 
  FHIRBundle,
  FHIRBundleEntry 
} from '@/types/fhir';

export class FHIRService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'https://hapi.fhir.org/baseR4', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  // Generic FHIR resource operations
  async create<T extends FHIRResource>(resource: T): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${resource.resourceType}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${resource.resourceType}: ${response.statusText}`);
    }

    return response.json();
  }

  async read<T extends FHIRResource>(resourceType: string, id: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to read ${resourceType}/${id}: ${response.statusText}`);
    }

    return response.json();
  }

  async update<T extends FHIRResource>(resource: T): Promise<T> {
    if (!resource.id) {
      throw new Error('Resource must have an ID for update operation');
    }

    const response = await fetch(`${this.baseUrl}/${resource.resourceType}/${resource.id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${resource.resourceType}/${resource.id}: ${response.statusText}`);
    }

    return response.json();
  }

  async delete(resourceType: string, id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${resourceType}/${id}: ${response.statusText}`);
    }
  }

  async search<T extends FHIRResource>(
    resourceType: string, 
    params: Record<string, string> = {}
  ): Promise<FHIRBundle> {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseUrl}/${resourceType}?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to search ${resourceType}: ${response.statusText}`);
    }

    return response.json();
  }

  // Patient-specific operations
  async createPatient(patient: Omit<FHIRPatient, 'resourceType'>): Promise<FHIRPatient> {
    return this.create<FHIRPatient>({
      resourceType: 'Patient',
      ...patient,
    });
  }

  async getPatient(id: string): Promise<FHIRPatient> {
    return this.read<FHIRPatient>('Patient', id);
  }

  async searchPatients(criteria: {
    name?: string;
    identifier?: string;
    birthdate?: string;
    gender?: string;
  }): Promise<FHIRPatient[]> {
    const params: Record<string, string> = {};
    
    if (criteria.name) params.name = criteria.name;
    if (criteria.identifier) params.identifier = criteria.identifier;
    if (criteria.birthdate) params.birthdate = criteria.birthdate;
    if (criteria.gender) params.gender = criteria.gender;

    const bundle = await this.search('Patient', params);
    return this.extractResourcesFromBundle<FHIRPatient>(bundle);
  }

  // Observation-specific operations
  async createObservation(observation: Omit<FHIRObservation, 'resourceType'>): Promise<FHIRObservation> {
    return this.create<FHIRObservation>({
      resourceType: 'Observation',
      ...observation,
    });
  }

  async getPatientObservations(patientId: string, category?: string): Promise<FHIRObservation[]> {
    const params: Record<string, string> = {
      patient: patientId,
    };

    if (category) {
      params.category = category;
    }

    const bundle = await this.search('Observation', params);
    return this.extractResourcesFromBundle<FHIRObservation>(bundle);
  }

  // Bundle operations for bulk data exchange
  async createBundle(bundle: Omit<FHIRBundle, 'resourceType'>): Promise<FHIRBundle> {
    return this.create<FHIRBundle>({
      resourceType: 'Bundle',
      ...bundle,
    });
  }

  async processTransactionBundle(entries: FHIRBundleEntry[]): Promise<FHIRBundle> {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: entries,
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bundle),
    });

    if (!response.ok) {
      throw new Error(`Failed to process transaction bundle: ${response.statusText}`);
    }

    return response.json();
  }

  // Utility methods
  private extractResourcesFromBundle<T extends FHIRResource>(bundle: FHIRBundle): T[] {
    if (!bundle.entry) return [];
    
    return bundle.entry
      .filter(entry => entry.resource)
      .map(entry => entry.resource as T);
  }

  // Convert internal data to FHIR format
  convertToFHIRPatient(patientData: {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    mrn?: string;
  }): FHIRPatient {
    const patient: FHIRPatient = {
      resourceType: 'Patient',
      active: true,
      name: [{
        use: 'official',
        family: patientData.lastName,
        given: [patientData.firstName],
      }],
    };

    if (patientData.id) {
      patient.id = patientData.id;
    }

    if (patientData.mrn) {
      patient.identifier = [{
        use: 'usual',
        system: 'http://hospital.smarthealth.org/mrn',
        value: patientData.mrn,
      }];
    }

    if (patientData.email || patientData.phone) {
      patient.telecom = [];
      
      if (patientData.email) {
        patient.telecom.push({
          system: 'email',
          value: patientData.email,
          use: 'home',
        });
      }
      
      if (patientData.phone) {
        patient.telecom.push({
          system: 'phone',
          value: patientData.phone,
          use: 'home',
        });
      }
    }

    if (patientData.birthDate) {
      patient.birthDate = patientData.birthDate;
    }

    if (patientData.gender) {
      patient.gender = patientData.gender as 'male' | 'female' | 'other' | 'unknown';
    }

    if (patientData.address) {
      const addr = patientData.address;
      patient.address = [{
        use: 'home',
        type: 'both',
        line: addr.line1 ? [addr.line1] : undefined,
        city: addr.city,
        state: addr.state,
        postalCode: addr.zipCode,
        country: addr.country || 'US',
      }];
    }

    return patient;
  }

  convertToFHIRObservation(observationData: {
    patientId: string;
    code: string;
    display: string;
    value: number | string;
    unit?: string;
    status?: string;
    category?: string;
    effectiveDateTime?: string;
    system?: string;
  }): FHIRObservation {
    return {
      resourceType: 'Observation',
      status: (observationData.status as any) || 'final',
      category: observationData.category ? [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: observationData.category,
          display: observationData.category,
        }],
      }] : undefined,
      code: {
        coding: [{
          system: observationData.system || 'http://loinc.org',
          code: observationData.code,
          display: observationData.display,
        }],
      },
      subject: {
        reference: `Patient/${observationData.patientId}`,
      },
      effective: observationData.effectiveDateTime || new Date().toISOString(),
      valueQuantity: typeof observationData.value === 'number' ? {
        value: observationData.value,
        unit: observationData.unit,
        system: 'http://unitsofmeasure.org',
        code: observationData.unit,
      } : undefined,
      valueString: typeof observationData.value === 'string' ? observationData.value : undefined,
    };
  }

  // Validation methods
  validateFHIRResource(resource: FHIRResource): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!resource.resourceType) {
      errors.push('Resource must have a resourceType');
    }

    // Add specific validation rules based on resource type
    if (resource.resourceType === 'Patient') {
      const patient = resource as FHIRPatient;
      if (!patient.name || patient.name.length === 0) {
        errors.push('Patient must have at least one name');
      }
    }

    if (resource.resourceType === 'Observation') {
      const observation = resource as FHIRObservation;
      if (!observation.code) {
        errors.push('Observation must have a code');
      }
      if (!observation.status) {
        errors.push('Observation must have a status');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default FHIRService;