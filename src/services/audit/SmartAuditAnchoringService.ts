
import { supabase } from '@/integrations/supabase/client';
import { AuditHashService } from './AuditHashService';
import { RealBlockchainAnchorService } from './RealBlockchainAnchorService';

export interface SmartAnchoringResult {
  shouldAnchor: boolean;
  newLogsCount: number;
  lastAnchoredAt?: string;
  lastAnchoredLogCount?: number;
  anchorResult?: any;
}

export class SmartAuditAnchoringService {
  private blockchainService: RealBlockchainAnchorService;

  constructor(useMainnet: boolean = false) {
    this.blockchainService = new RealBlockchainAnchorService(useMainnet);
  }

  /**
   * Check if there are new audit logs since the last anchoring
   */
  async checkForNewLogs(): Promise<SmartAnchoringResult> {
    try {
      console.log('🔍 Checking for new audit logs since last anchoring...');

      // Get the last anchor record
      const { data: lastAnchor, error: anchorError } = await supabase
        .from('audit_hash_anchors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anchorError) {
        console.error('Error fetching last anchor:', anchorError);
        throw anchorError;
      }

      // Get current audit log count
      const { count: currentLogCount, error: countError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting audit logs:', countError);
        throw countError;
      }

      const totalLogs = currentLogCount || 0;
      const lastAnchoredCount = lastAnchor?.log_count || 0;
      const newLogsCount = totalLogs - lastAnchoredCount;

      console.log(`📊 Audit log status:`);
      console.log(`   - Total logs: ${totalLogs}`);
      console.log(`   - Last anchored: ${lastAnchoredCount}`);
      console.log(`   - New logs: ${newLogsCount}`);

      const shouldAnchor = newLogsCount > 0;

      return {
        shouldAnchor,
        newLogsCount,
        lastAnchoredAt: lastAnchor?.created_at,
        lastAnchoredLogCount: lastAnchoredCount
      };
    } catch (error) {
      console.error('❌ Error checking for new logs:', error);
      throw error;
    }
  }

  /**
   * Perform smart anchoring - only anchor if there are new logs
   */
  async performSmartAnchoring(options: {
    useMainnet?: boolean;
    skipDatabaseStorage?: boolean;
    forceAnchor?: boolean;
  } = {}): Promise<SmartAnchoringResult> {
    try {
      const checkResult = await this.checkForNewLogs();

      if (!checkResult.shouldAnchor && !options.forceAnchor) {
        console.log('⏭️ No new logs to anchor, skipping...');
        return checkResult;
      }

      console.log('⛓️ New logs detected, proceeding with anchoring...');

      // Perform the anchoring
      const anchorResult = await this.blockchainService.generateAndAnchorAuditHash(
        checkResult.newLogsCount,
        {
          useMainnet: options.useMainnet,
          skipDatabaseStorage: options.skipDatabaseStorage
        }
      );

      return {
        ...checkResult,
        anchorResult
      };
    } catch (error) {
      console.error('❌ Smart anchoring failed:', error);
      throw error;
    }
  }

  /**
   * Get anchoring status and metrics
   */
  async getAnchoringStatus(): Promise<{
    totalAnchors: number;
    lastAnchoredAt?: string;
    totalLogsAnchored: number;
    pendingLogs: number;
  }> {
    try {
      // Get total anchors count
      const { count: totalAnchors, error: anchorsError } = await supabase
        .from('audit_hash_anchors')
        .select('*', { count: 'exact', head: true });

      if (anchorsError) throw anchorsError;

      // Get last anchor info
      const { data: lastAnchor, error: lastAnchorError } = await supabase
        .from('audit_hash_anchors')
        .select('created_at, log_count')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastAnchorError) throw lastAnchorError;

      // Get current total logs
      const { count: currentLogCount, error: countError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const totalLogsAnchored = lastAnchor?.log_count || 0;
      const pendingLogs = (currentLogCount || 0) - totalLogsAnchored;

      return {
        totalAnchors: totalAnchors || 0,
        lastAnchoredAt: lastAnchor?.created_at,
        totalLogsAnchored,
        pendingLogs: Math.max(0, pendingLogs)
      };
    } catch (error) {
      console.error('❌ Error getting anchoring status:', error);
      throw error;
    }
  }
}

export const smartAuditAnchoringService = new SmartAuditAnchoringService();
