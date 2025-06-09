
import { supabase } from '@/integrations/supabase/client';

export interface InsuranceContract {
  id: string;
  patientId: string;
  providerId: string;
  insuranceProvider: string;
  contractType: 'claim_processing' | 'payment_automation' | 'authorization' | 'coverage_verification';
  terms: {
    coverageAmount: number;
    deductible: number;
    copayAmount: number;
    autoApprovalLimit: number;
    requiresPreAuth: boolean;
  };
  status: 'draft' | 'active' | 'executed' | 'expired' | 'terminated';
  blockchainHash?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface IoTDevice {
  id: string;
  userId: string;
  deviceType: 'heart_rate_monitor' | 'blood_glucose_meter' | 'blood_pressure_monitor' | 'smart_inhaler' | 'fitness_tracker';
  manufacturer: string;
  model: string;
  serialNumber: string;
  isConnected: boolean;
  lastSyncAt?: string;
  encryptionKey: string;
}

export interface IoTDataPoint {
  id: string;
  deviceId: string;
  timestamp: string;
  dataType: string;
  value: number;
  unit: string;
  confidence: number;
  isValidated: boolean;
}

class SmartContractsService {
  private static instance: SmartContractsService;

  public static getInstance(): SmartContractsService {
    if (!SmartContractsService.instance) {
      SmartContractsService.instance = new SmartContractsService();
    }
    return SmartContractsService.instance;
  }

  // Insurance Smart Contracts
  async createInsuranceContract(contract: Omit<InsuranceContract, 'id' | 'createdAt' | 'status'>): Promise<InsuranceContract> {
    try {
      const newContract: InsuranceContract = {
        ...contract,
        id: crypto.randomUUID(),
        status: 'draft',
        createdAt: new Date().toISOString()
      };

      // Simulate blockchain deployment
      const blockchainHash = await this.deployToBlockchain(newContract);
      newContract.blockchainHash = blockchainHash;
      newContract.status = 'active';

      // Store in Supabase
      const { data, error } = await supabase
        .from('smart_contracts')
        .insert({
          id: newContract.id,
          user_id: newContract.patientId,
          name: `Insurance Contract - ${newContract.contractType}`,
          description: `Automated insurance contract with ${newContract.insuranceProvider}`,
          status: newContract.status,
          expires_at: newContract.expiresAt,
          blockchain_reference: newContract.blockchainHash
        })
        .select()
        .single();

      if (error) throw error;

      return newContract;
    } catch (error) {
      console.error('Error creating insurance contract:', error);
      throw error;
    }
  }

  async processAutomaticClaim(
    contractId: string, 
    claimAmount: number, 
    serviceCode: string
  ): Promise<{ approved: boolean; paymentAmount: number; reason?: string }> {
    try {
      // Simulate smart contract execution logic
      console.log(`Processing automatic claim for contract ${contractId}`);
      
      // Get contract details (would normally query blockchain)
      const contract = await this.getContractById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Auto-approval logic based on contract terms
      const isAutoApproved = claimAmount <= contract.terms.autoApprovalLimit;
      const paymentAmount = isAutoApproved ? 
        Math.max(0, claimAmount - contract.terms.copayAmount) : 0;

      // Log transaction to audit trail
      await this.logContractExecution(contractId, 'claim_processing', {
        claimAmount,
        serviceCode,
        approved: isAutoApproved,
        paymentAmount
      });

      return {
        approved: isAutoApproved,
        paymentAmount,
        reason: isAutoApproved ? 'Auto-approved within contract limits' : 'Requires manual review'
      };
    } catch (error) {
      console.error('Error processing automatic claim:', error);
      throw error;
    }
  }

  // IoT Device Management
  async registerIoTDevice(device: Omit<IoTDevice, 'id' | 'encryptionKey'>): Promise<IoTDevice> {
    try {
      const newDevice: IoTDevice = {
        ...device,
        id: crypto.randomUUID(),
        encryptionKey: this.generateEncryptionKey()
      };

      // Store device registration (would integrate with actual device management system)
      console.log('Registering IoT device:', newDevice);
      
      return newDevice;
    } catch (error) {
      console.error('Error registering IoT device:', error);
      throw error;
    }
  }

  async processIoTData(deviceId: string, dataPoints: Omit<IoTDataPoint, 'id' | 'deviceId'>[]): Promise<IoTDataPoint[]> {
    try {
      const processedData: IoTDataPoint[] = dataPoints.map(point => ({
        ...point,
        id: crypto.randomUUID(),
        deviceId,
        isValidated: this.validateDataPoint(point)
      }));

      // Store in health data table
      for (const dataPoint of processedData) {
        if (dataPoint.isValidated) {
          await supabase
            .from('health_data')
            .insert({
              patient_id: deviceId, // This would be mapped to actual patient ID
              data_type: dataPoint.dataType,
              value: dataPoint.value,
              unit: dataPoint.unit,
              recorded_at: dataPoint.timestamp,
              notes: `IoT Device: ${deviceId}, Confidence: ${dataPoint.confidence}`
            });
        }
      }

      console.log(`Processed ${processedData.length} IoT data points for device ${deviceId}`);
      return processedData;
    } catch (error) {
      console.error('Error processing IoT data:', error);
      throw error;
    }
  }

  async createHealthMonitoringContract(
    patientId: string, 
    deviceIds: string[], 
    conditions: {
      criticalThresholds: Record<string, { min?: number; max?: number }>;
      alertContacts: string[];
      autoMedicationAdjustment: boolean;
    }
  ): Promise<InsuranceContract> {
    try {
      const contract = await this.createInsuranceContract({
        patientId,
        providerId: 'system',
        insuranceProvider: 'HealthMonitor AI',
        contractType: 'authorization',
        terms: {
          coverageAmount: 0,
          deductible: 0,
          copayAmount: 0,
          autoApprovalLimit: 1000,
          requiresPreAuth: false
        },
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      });

      console.log('Created health monitoring contract:', contract);
      return contract;
    } catch (error) {
      console.error('Error creating health monitoring contract:', error);
      throw error;
    }
  }

  // Private helper methods
  private async deployToBlockchain(contract: any): Promise<string> {
    // Simulate blockchain deployment with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `0x${Math.random().toString(16).slice(2, 42)}`;
  }

  private async getContractById(contractId: string): Promise<InsuranceContract | null> {
    // Simulate contract retrieval from blockchain
    return {
      id: contractId,
      patientId: 'patient-123',
      providerId: 'provider-456',
      insuranceProvider: 'Blue Cross',
      contractType: 'claim_processing',
      terms: {
        coverageAmount: 10000,
        deductible: 500,
        copayAmount: 25,
        autoApprovalLimit: 500,
        requiresPreAuth: false
      },
      status: 'active',
      createdAt: new Date().toISOString()
    };
  }

  private async logContractExecution(contractId: string, action: string, details: any): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: 'system',
          action: `smart_contract_${action}`,
          resource: 'smart_contract',
          resource_id: contractId,
          details: JSON.stringify(details),
          status: 'success'
        });
    } catch (error) {
      console.error('Error logging contract execution:', error);
    }
  }

  private generateEncryptionKey(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private validateDataPoint(dataPoint: Omit<IoTDataPoint, 'id' | 'deviceId'>): boolean {
    // Basic validation rules
    if (dataPoint.confidence < 0.7) return false;
    if (dataPoint.value < 0) return false;
    
    // Data type specific validation
    switch (dataPoint.dataType) {
      case 'heart_rate':
        return dataPoint.value >= 30 && dataPoint.value <= 220;
      case 'blood_pressure_systolic':
        return dataPoint.value >= 70 && dataPoint.value <= 250;
      case 'blood_glucose':
        return dataPoint.value >= 20 && dataPoint.value <= 600;
      case 'oxygen_saturation':
        return dataPoint.value >= 70 && dataPoint.value <= 100;
      default:
        return true;
    }
  }
}

export default SmartContractsService;
