import { supabase } from '@/integrations/supabase/client';

export interface AnchoringQueueEntry {
  id: string;
  audit_hash: string;
  log_count: number;
  status: 'pending' | 'processing' | 'anchored' | 'failed';
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface AnchoredHash {
  id: string;
  audit_hash: string;
  tx_hash: string;
  block_number: number;
  anchored_at: string;
  log_count: number;
  created_at: string;
}

export class AnchoringService {
  private static instance: AnchoringService;

  static getInstance(): AnchoringService {
    if (!AnchoringService.instance) {
      AnchoringService.instance = new AnchoringService();
    }
    return AnchoringService.instance;
  }

  async queueForAnchoring(auditHash: string, logCount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('anchoring_queue')
        .insert({
          audit_hash: auditHash,
          log_count: logCount,
          status: 'pending'
        });

      return !error;
    } catch (error) {
      console.error('Failed to queue for anchoring:', error);
      return false;
    }
  }

  async getQueueStatus(): Promise<AnchoringQueueEntry[]> {
    try {
      const { data, error } = await supabase
        .from('anchoring_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
      return [];
    }
  }

  async getAnchoredHashes(): Promise<AnchoredHash[]> {
    try {
      const { data, error } = await supabase
        .from('anchored_hashes')
        .select('*')
        .order('anchored_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch anchored hashes:', error);
      return [];
    }
  }

  async getAnchoringStatus(auditHash: string): Promise<{
    status: 'not_queued' | 'pending' | 'processing' | 'anchored' | 'failed';
    txHash?: string;
    blockNumber?: number;
    anchoredAt?: string;
    errorMessage?: string;
  }> {
    try {
      // Check if already anchored
      const { data: anchored } = await supabase
        .from('anchored_hashes')
        .select('tx_hash, block_number, anchored_at')
        .eq('audit_hash', auditHash)
        .single();

      if (anchored) {
        return {
          status: 'anchored',
          txHash: anchored.tx_hash,
          blockNumber: anchored.block_number,
          anchoredAt: anchored.anchored_at
        };
      }

      // Check queue status
      const { data: queued } = await supabase
        .from('anchoring_queue')
        .select('status, error_message')
        .eq('audit_hash', auditHash)
        .single();

      if (queued) {
        return {
          status: queued.status as any,
          errorMessage: queued.error_message
        };
      }

      return { status: 'not_queued' };
    } catch (error) {
      console.error('Failed to get anchoring status:', error);
      return { status: 'not_queued' };
    }
  }

  async triggerAnchoring(): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('anchor-hashes');
      return !error;
    } catch (error) {
      console.error('Failed to trigger anchoring:', error);
      return false;
    }
  }
}