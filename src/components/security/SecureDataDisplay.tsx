import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataMasking, { MaskingContext } from '@/services/security/DataMasking';
import { FieldEncryption } from '@/services/security/FieldEncryption';
import { useAuth } from '@/contexts/AuthContext';

interface SecureDataDisplayProps {
  data: any;
  encryptedFields?: string[];
  sensitiveFields?: string[];
  accessLevel?: 'none' | 'limited' | 'full';
  showMaskingControls?: boolean;
  onDataAccess?: (field: string, action: 'view' | 'mask') => void;
}

const SecureDataDisplay: React.FC<SecureDataDisplayProps> = ({
  data,
  encryptedFields = [],
  sensitiveFields = [],
  accessLevel = 'limited',
  showMaskingControls = true,
  onDataAccess
}) => {
  const { profile } = useAuth();
  const [displayData, setDisplayData] = useState<any>(data);
  const [isMasked, setIsMasked] = useState<boolean>(true);
  const [decryptedFields, setDecryptedFields] = useState<Set<string>>(new Set());
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  const dataMasking = DataMasking.getInstance();
  const fieldEncryption = FieldEncryption.getInstance();

  useEffect(() => {
    applyDataMasking();
  }, [data, isMasked]);

  const applyDataMasking = async () => {
    let processedData = { ...data };

    // Decrypt encrypted fields if needed
    if (encryptedFields.length > 0 && !isMasked) {
      processedData = await fieldEncryption.decryptSensitiveFields(
        processedData,
        encryptedFields
      );
    }

    // Apply masking based on user role and access level
    if (isMasked && profile) {
      const context: MaskingContext = {
        userRole: profile.role || 'patient',
        accessLevel,
        purpose: 'data_display',
        requesterPermissions: profile.role ? [profile.role] : ['patient']
      };

      processedData = dataMasking.maskPersonalData(processedData, context);
    }

    setDisplayData(processedData);
  };

  const toggleMasking = () => {
    setIsMasked(!isMasked);
    onDataAccess?.('all', isMasked ? 'view' : 'mask');
  };

  const toggleFieldDecryption = async (fieldName: string) => {
    if (decryptedFields.has(fieldName)) {
      setDecryptedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    } else {
      setIsDecrypting(true);
      try {
        if (data[fieldName] && typeof data[fieldName] === 'object' && data[fieldName].encryptedData) {
          const decrypted = await fieldEncryption.decryptField(data[fieldName]);
          if (decrypted.isValid) {
            setDecryptedFields(prev => new Set([...prev, fieldName]));
            onDataAccess?.(fieldName, 'view');
          }
        }
      } catch (error) {
        console.error('Decryption failed:', error);
      } finally {
        setIsDecrypting(false);
      }
    }
  };

  const renderValue = (key: string, value: any): React.ReactNode => {
    const isEncrypted = encryptedFields.includes(key);
    const isSensitive = sensitiveFields.includes(key);
    const isDecrypted = decryptedFields.has(key);

    if (isEncrypted && !isDecrypted) {
      return (
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400 italic">[Encrypted]</span>
          {showMaskingControls && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleFieldDecryption(key)}
              disabled={isDecrypting}
              className="h-6 px-2 text-xs"
            >
              {isDecrypting ? 'Decrypting...' : 'Decrypt'}
            </Button>
          )}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <div className="space-y-1">
            {value.map((item, index) => (
              <div key={index} className="pl-4 border-l border-slate-600">
                {typeof item === 'object' ? (
                  <SecureDataDisplay
                    data={item}
                    encryptedFields={encryptedFields}
                    sensitiveFields={sensitiveFields}
                    accessLevel={accessLevel}
                    showMaskingControls={false}
                  />
                ) : (
                  String(item)
                )}
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <SecureDataDisplay
            data={value}
            encryptedFields={encryptedFields}
            sensitiveFields={sensitiveFields}
            accessLevel={accessLevel}
            showMaskingControls={false}
          />
        );
      }
    }

    return (
      <span className={isSensitive ? 'font-mono' : ''}>
        {String(value)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {showMaskingControls && (
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-autheo-primary" />
            <span className="text-sm font-medium text-slate-200">Data Security</span>
            <Badge variant={isMasked ? 'default' : 'secondary'} className="text-xs">
              {isMasked ? 'Protected' : 'Unmasked'}
            </Badge>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={toggleMasking}
            className="flex items-center gap-2"
          >
            {isMasked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isMasked ? 'Show Data' : 'Hide Data'}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {Object.entries(displayData).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              {sensitiveFields.includes(key) && (
                <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                  Sensitive
                </Badge>
              )}
              {encryptedFields.includes(key) && (
                <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                  Encrypted
                </Badge>
              )}
            </div>
            <div className="pl-4 text-sm text-slate-100">
              {renderValue(key, value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecureDataDisplay;
