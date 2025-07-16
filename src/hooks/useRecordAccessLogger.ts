import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AccessLogger } from '@/services/audit/AccessLogger';

export const useRecordAccessLogger = () => {
  const { user } = useAuth();

  const logRecordView = useCallback(async (recordId: string, patientId: string) => {
    if (!user?.id) return;
    await AccessLogger.logRecordView(recordId, patientId, user.id);
  }, [user?.id]);

  const logRecordUpdate = useCallback(async (recordId: string, patientId: string) => {
    if (!user?.id) return;
    await AccessLogger.logRecordUpdate(recordId, patientId, user.id);
  }, [user?.id]);

  const logRecordDownload = useCallback(async (recordId: string, patientId: string) => {
    if (!user?.id) return;
    await AccessLogger.logRecordDownload(recordId, patientId, user.id);
  }, [user?.id]);

  const logRecordCreate = useCallback(async (recordId: string, patientId: string) => {
    if (!user?.id) return;
    await AccessLogger.logRecordCreate(recordId, patientId, user.id);
  }, [user?.id]);

  const logRecordShare = useCallback(async (recordId: string, patientId: string) => {
    if (!user?.id) return;
    await AccessLogger.logRecordShare(recordId, patientId, user.id);
  }, [user?.id]);

  return {
    logRecordView,
    logRecordUpdate,
    logRecordDownload,
    logRecordCreate,
    logRecordShare,
  };
};