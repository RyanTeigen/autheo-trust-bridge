import { useState, useEffect } from 'react';
import { hipaaCompliance, HIPAAControl, ComplianceStatus, HIPAARiskAssessment, BusinessAssociateAgreement } from '@/services/compliance/HIPAAComplianceService';
import { useToast } from '@/hooks/use-toast';

export const useHIPAACompliance = () => {
  const [controls, setControls] = useState<HIPAAControl[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [riskAssessments, setRiskAssessments] = useState<HIPAARiskAssessment[]>([]);
  const [baas, setBAAs] = useState<BusinessAssociateAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize controls first if needed
      await hipaaCompliance.initializeHIPAAControls();

      // Fetch all data in parallel
      const [controlsData, statusData, assessmentsData, baasData] = await Promise.all([
        hipaaCompliance.getHIPAAControls(),
        hipaaCompliance.getComplianceStatus(),
        hipaaCompliance.getRiskAssessments(),
        hipaaCompliance.getBAAs()
      ]);

      setControls(controlsData);
      setComplianceStatus(statusData);
      setRiskAssessments(assessmentsData);
      setBAAs(baasData);

    } catch (err) {
      console.error('Error fetching HIPAA compliance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance data');
      toast({
        title: "Error",
        description: "Failed to load HIPAA compliance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateControlStatus = async (
    controlId: string,
    status: HIPAAControl['implementation_status'],
    evidence?: string[],
    notes?: string
  ) => {
    try {
      await hipaaCompliance.updateControlStatus(controlId, status, evidence, notes);
      
      // Refresh data
      await fetchData();
      
      toast({
        title: "Success",
        description: "Control status updated successfully",
      });
    } catch (err) {
      console.error('Error updating control status:', err);
      toast({
        title: "Error",
        description: "Failed to update control status",
        variant: "destructive"
      });
    }
  };

  const createRiskAssessment = async (assessment: Omit<HIPAARiskAssessment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = await hipaaCompliance.createRiskAssessment(assessment);
      
      // Refresh data
      await fetchData();
      
      toast({
        title: "Success",
        description: "Risk assessment created successfully",
      });
      
      return id;
    } catch (err) {
      console.error('Error creating risk assessment:', err);
      toast({
        title: "Error",
        description: "Failed to create risk assessment",
        variant: "destructive"
      });
      throw err;
    }
  };

  const createBAA = async (baa: Omit<BusinessAssociateAgreement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = await hipaaCompliance.createBAA(baa);
      
      // Refresh data
      await fetchData();
      
      toast({
        title: "Success",
        description: "Business Associate Agreement created successfully",
      });
      
      return id;
    } catch (err) {
      console.error('Error creating BAA:', err);
      toast({
        title: "Error",
        description: "Failed to create Business Associate Agreement",
        variant: "destructive"
      });
      throw err;
    }
  };

  const getUpcomingDeadlines = async () => {
    try {
      return await hipaaCompliance.getUpcomingDeadlines();
    } catch (err) {
      console.error('Error fetching deadlines:', err);
      toast({
        title: "Error",
        description: "Failed to fetch upcoming deadlines",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    controls,
    complianceStatus,
    riskAssessments,
    baas,
    loading,
    error,
    updateControlStatus,
    createRiskAssessment,
    createBAA,
    getUpcomingDeadlines,
    refetch: fetchData
  };
};