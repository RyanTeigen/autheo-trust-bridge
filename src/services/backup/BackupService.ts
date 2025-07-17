import { supabase } from '@/integrations/supabase/client';
import { isProduction } from '@/utils/production';

interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'manual' | 'automated';
  tables: string[];
  size: number;
  checksum: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

interface BackupOptions {
  tables?: string[];
  includeFiles?: boolean;
  compress?: boolean;
  encrypt?: boolean;
}

class BackupService {
  private static instance: BackupService;
  private backupHistory: BackupMetadata[] = [];

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private constructor() {
    if (isProduction()) {
      this.scheduleAutomaticBackups();
    }
  }

  async createBackup(options: BackupOptions = {}): Promise<string> {
    const backupId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp: new Date(),
      type: 'manual',
      tables: options.tables || this.getDefaultTables(),
      size: 0,
      checksum: '',
      status: 'pending',
    };

    this.backupHistory.push(metadata);

    try {
      // Export data from each table
      const backupData: Record<string, any[]> = {};
      let totalSize = 0;

      for (const table of metadata.tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          throw new Error(`Failed to backup table ${table}: ${error.message}`);
        }

        backupData[table] = data || [];
        totalSize += JSON.stringify(data).length;
      }

      // Generate checksum
      const checksum = await this.generateChecksum(JSON.stringify(backupData));

      // Store backup (in production, this would go to cloud storage)
      await this.storeBackup(backupId, backupData, options);

      // Update metadata
      metadata.size = totalSize;
      metadata.checksum = checksum;
      metadata.status = 'completed';

      // Log the backup
      await supabase.from('audit_logs').insert({
        action: 'BACKUP_CREATED',
        resource: 'backup_service',
        resource_id: backupId,
        status: 'success',
        details: `Manual backup created with ${metadata.tables.length} tables`,
        metadata: {
          backupId,
          tables: metadata.tables,
          size: totalSize,
        },
      });

      return backupId;
    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('Backup failed:', error);
      throw error;
    }
  }

  async restoreBackup(backupId: string, options: { 
    tables?: string[];
    validateChecksum?: boolean;
    dryRun?: boolean;
  } = {}): Promise<void> {
    const metadata = this.backupHistory.find(b => b.id === backupId);
    if (!metadata || metadata.status !== 'completed') {
      throw new Error('Backup not found or incomplete');
    }

    try {
      // Retrieve backup data
      const backupData = await this.retrieveBackup(backupId);

      // Validate checksum if requested
      if (options.validateChecksum) {
        const currentChecksum = await this.generateChecksum(JSON.stringify(backupData));
        if (currentChecksum !== metadata.checksum) {
          throw new Error('Backup integrity check failed - checksum mismatch');
        }
      }

      const tablesToRestore = options.tables || metadata.tables;

      if (options.dryRun) {
        console.log('Dry run - would restore:', tablesToRestore);
        return;
      }

      // Restore each table
      for (const table of tablesToRestore) {
        if (!backupData[table]) {
          console.warn(`Table ${table} not found in backup`);
          continue;
        }

        // In production, you'd want more sophisticated restore logic
        // This is a simplified version for demonstration
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (error) {
          console.error(`Failed to clear table ${table}:`, error);
          continue;
        }

        // Insert backup data
        const { error: insertError } = await supabase
          .from(table)
          .insert(backupData[table]);

        if (insertError) {
          throw new Error(`Failed to restore table ${table}: ${insertError.message}`);
        }
      }

      // Log the restore
      await supabase.from('audit_logs').insert({
        action: 'BACKUP_RESTORED',
        resource: 'backup_service',
        resource_id: backupId,
        status: 'success',
        details: `Backup restored for ${tablesToRestore.length} tables`,
        metadata: {
          backupId,
          tables: tablesToRestore,
          originalTimestamp: metadata.timestamp,
        },
      });

    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  getBackupHistory(): BackupMetadata[] {
    return [...this.backupHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async deleteBackup(backupId: string): Promise<void> {
    const metadata = this.backupHistory.find(b => b.id === backupId);
    if (!metadata) {
      throw new Error('Backup not found');
    }

    try {
      // Delete from storage
      await this.deleteBackupFromStorage(backupId);

      // Remove from history
      this.backupHistory = this.backupHistory.filter(b => b.id !== backupId);

      // Log deletion
      await supabase.from('audit_logs').insert({
        action: 'BACKUP_DELETED',
        resource: 'backup_service',
        resource_id: backupId,
        status: 'success',
        details: 'Backup deleted by user request',
      });

    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw error;
    }
  }

  private getDefaultTables(): string[] {
    return [
      'profiles',
      'patients',
      'providers',
      'medical_records',
      'sharing_permissions',
      'audit_logs',
    ];
  }

  private async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async storeBackup(
    backupId: string, 
    data: Record<string, any[]>, 
    options: BackupOptions
  ): Promise<void> {
    // In production, this would upload to cloud storage (S3, Google Cloud, etc.)
    // For now, we'll store in localStorage as a demo
    try {
      let serializedData = JSON.stringify(data);
      
      if (options.compress) {
        // In production, use actual compression
        console.log('Compression would be applied here');
      }
      
      if (options.encrypt) {
        // In production, encrypt the data
        console.log('Encryption would be applied here');
      }

      localStorage.setItem(`backup-${backupId}`, serializedData);
    } catch (error) {
      throw new Error(`Failed to store backup: ${error}`);
    }
  }

  private async retrieveBackup(backupId: string): Promise<Record<string, any[]>> {
    try {
      const serializedData = localStorage.getItem(`backup-${backupId}`);
      if (!serializedData) {
        throw new Error('Backup data not found');
      }

      return JSON.parse(serializedData);
    } catch (error) {
      throw new Error(`Failed to retrieve backup: ${error}`);
    }
  }

  private async deleteBackupFromStorage(backupId: string): Promise<void> {
    try {
      localStorage.removeItem(`backup-${backupId}`);
    } catch (error) {
      throw new Error(`Failed to delete backup from storage: ${error}`);
    }
  }

  private scheduleAutomaticBackups(): void {
    // Schedule daily backups at 2 AM
    const scheduleNextBackup = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0);
      
      const msUntilBackup = tomorrow.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          await this.createBackup({ tables: this.getDefaultTables() });
          console.log('Automatic backup completed');
        } catch (error) {
          console.error('Automatic backup failed:', error);
        }
        
        // Schedule next backup
        scheduleNextBackup();
      }, msUntilBackup);
    };

    scheduleNextBackup();
  }

  // Backup verification
  async verifyBackupIntegrity(backupId: string): Promise<{
    valid: boolean;
    issues: string[];
    checkedTables: number;
    totalRecords: number;
  }> {
    const metadata = this.backupHistory.find(b => b.id === backupId);
    if (!metadata) {
      throw new Error('Backup not found');
    }

    const issues: string[] = [];
    let checkedTables = 0;
    let totalRecords = 0;

    try {
      const backupData = await this.retrieveBackup(backupId);

      // Verify checksum
      const currentChecksum = await this.generateChecksum(JSON.stringify(backupData));
      if (currentChecksum !== metadata.checksum) {
        issues.push('Checksum mismatch - backup may be corrupted');
      }

      // Verify table structure
      for (const table of metadata.tables) {
        checkedTables++;
        
        if (!backupData[table]) {
          issues.push(`Table ${table} missing from backup`);
          continue;
        }

        const records = backupData[table];
        totalRecords += records.length;

        // Basic validation
        if (records.length === 0) {
          issues.push(`Table ${table} is empty`);
        }

        // Validate record structure
        if (records.length > 0) {
          const firstRecord = records[0];
          if (!firstRecord.id) {
            issues.push(`Table ${table} records missing ID field`);
          }
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        checkedTables,
        totalRecords,
      };

    } catch (error) {
      return {
        valid: false,
        issues: [`Verification failed: ${error}`],
        checkedTables: 0,
        totalRecords: 0,
      };
    }
  }
}

export default BackupService;