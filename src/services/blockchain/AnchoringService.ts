import { supabase } from '@/integrations/supabase/client';

export interface AnchoringQueueEntry {
  id: string;
  hash: string;
  log_count: number;
  anchor_status: 'pending' | 'processing' | 'anchored' | 'failed';
  queued_at: string;
  error_message?: string;
}

export interface AnchoredHash {
  id: string;
  hash: string;
  blockchain_tx_hash: string | null;
  blockchain_network: string | null;
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
        .from('hash_anchor_queue')
        .insert({
          hash: auditHash,
          anchor_status: 'pending',
          metadata: { log_count: logCount }
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
        .from('hash_anchor_queue')
        .select('id, hash, anchor_status, queued_at, error_message, metadata')
        .order('queued_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        hash: item.hash,
        log_count: (item.metadata as any)?.log_count || 0,
        anchor_status: item.anchor_status as AnchoringQueueEntry['anchor_status'],
        queued_at: item.queued_at || '',
        error_message: item.error_message || undefined
      }));
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
      return [];
    }
  }

  async getAnchoredHashes(): Promise<AnchoredHash[]> {
    try {
      const { data, error } = await supabase
        .from('audit_hash_anchors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        hash: item.hash,
        blockchain_tx_hash: item.blockchain_tx_hash,
        blockchain_network: item.blockchain_network,
        log_count: item.log_count,
        created_at: item.created_at
      }));
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
        .from('audit_hash_anchors')
        .select('blockchain_tx_hash, created_at')
        .eq('hash', auditHash)
        .single();

      if (anchored) {
        return {
          status: 'anchored',
          txHash: anchored.blockchain_tx_hash || undefined,
          anchoredAt: anchored.created_at
        };
      }

      // Check queue status
      const { data: queued } = await supabase
        .from('hash_anchor_queue')
        .select('anchor_status, error_message')
        .eq('hash', auditHash)
        .single();

      if (queued) {
        return {
          status: queued.anchor_status as any,
          errorMessage: queued.error_message || undefined
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
