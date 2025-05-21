
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { Shield, UserRound, Stethoscope } from 'lucide-react';
import { FormValues, roleOptions } from './schema';
import { useToast } from '@/hooks/use-toast';

interface RoleSelectorProps {
  form: UseFormReturn<FormValues>;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ form }) => {
  const { toast } = useToast();
  const selectedRoles = form.watch('roles') || [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserRound': return <UserRound className="h-4 w-4 text-blue-400" />;
      case 'Stethoscope': return <Stethoscope className="h-4 w-4 text-green-400" />;
      case 'Shield': return <Shield className="h-4 w-4 text-purple-400" />;
      default: return null;
    }
  };

  const handleRoleToggle = (roleId: string) => {
    const roleToToggle = roleId as 'patient' | 'provider' | 'compliance';
    const updatedRoles = selectedRoles.includes(roleToToggle)
      ? selectedRoles.filter(role => role !== roleToToggle)
      : [...selectedRoles, roleToToggle];
    
    // Check if adding this role would result in all three roles being selected
    if (updatedRoles.length === 3) {
      toast({
        title: "Role selection error",
        description: "You cannot select all three roles",
        variant: "destructive",
      });
      return;
    }
    
    // Update form value
    form.setValue('roles', updatedRoles, { shouldValidate: true });
  };

  return (
    <FormField
      control={form.control}
      name="roles"
      render={() => (
        <FormItem>
          <div>
            <FormLabel className="text-slate-200 block mb-2">Select Your Roles</FormLabel>
            <p className="text-xs text-slate-400 mb-3">
              Select the roles you want to use in the app. You can select multiple roles but not all three.
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              {roleOptions.map((role) => {
                const isSelected = selectedRoles.includes(role.id as any);
                return (
                  <label
                    key={role.id}
                    className={`flex items-center p-2 rounded-md border cursor-pointer ${
                      isSelected
                        ? 'border-autheo-primary bg-autheo-primary/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    htmlFor={`role-${role.id}`}
                    onClick={() => handleRoleToggle(role.id)}
                  >
                    <Checkbox 
                      id={`role-${role.id}`}
                      checked={isSelected}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double triggering
                      }}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span className="mr-2">{getIcon(role.icon)}</span>
                      <span className="text-slate-200">{role.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.formState.errors.roles && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {form.formState.errors.roles.message}
              </p>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};

export default RoleSelector;
