
import { supabase } from '@/integrations/supabase/client';

export class FitnessAuditLogger {
  private getClientIP(): string {
    return '127.0.0.1';
  }

  async logFitnessDataAccess(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any,
    status: 'success' | 'failure' | 'warning' = 'success'
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_audit_logs')
        .insert({
          user_id: user.user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          status,
          compliance_category: 'access',
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging fitness data access:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to log fitness data access:', error);
    }
  }

  async logDataDisclosure(
    recipient: string,
    purpose: string,
    dataCategories: string[],
    details?: any
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_audit_logs')
        .insert({
          user_id: user.user.id,
          action: `Data disclosed to ${recipient}`,
          resource_type: 'fitness_data_disclosure',
          details: {
            recipient,
            purpose,
            data_categories: dataCategories,
            ...details
          },
          status: 'success',
          compliance_category: 'disclosure',
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging data disclosure:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to log data disclosure:', error);
      throw error;
    }
  }
}
interface MedicalRecord {
  id: string;
  patientId: string;
  encryptedData: string;
  createdAt: Date;
  updatedAt: Date;
}

const records: MedicalRecord[] = [];

// Create record
app.post('/records', authenticate('patient'), (req: any, res) => {
  const patientId = req.user.userId;
  const { data } = req.body; // plain JSON data to encrypt
  if (!data) return res.status(400).send('Missing data');

  const encryptedData = encrypt(JSON.stringify(data));
  const record: MedicalRecord = {
    id: Date.now().toString(),
    patientId,
    encryptedData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  records.push(record);
  res.status(201).json({ id: record.id });
});

// Read all patient records
app.get('/records', authenticate('patient'), (req: any, res) => {
  const patientId = req.user.userId;
  const patientRecords = records
    .filter(r => r.patientId === patientId)
    .map(r => ({ id: r.id, data: JSON.parse(decrypt(r.encryptedData)), createdAt: r.createdAt, updatedAt: r.updatedAt }));
  res.json(patientRecords);
});

// Update a record
app.put('/records/:id', authenticate('patient'), (req: any, res) => {
  const patientId = req.user.userId;
  const record = records.find(r => r.id === req.params.id && r.patientId === patientId);
  if (!record) return res.status(404).send('Record not found');

  const { data } = req.body;
  if (!data) return res.status(400).send('Missing data');

  record.encryptedData = encrypt(JSON.stringify(data));
  record.updatedAt = new Date();
  res.send('Record updated');
});

// Delete a record
app.delete('/records/:id', authenticate('patient'), (req: any, res) => {
  const patientId = req.user.userId;
  const index = records.findIndex(r => r.id === req.params.id && r.patientId === patientId);
  if (index === -1) return res.status(404).send('Record not found');

  records.splice(index, 1);
  res.send('Record deleted');
});
