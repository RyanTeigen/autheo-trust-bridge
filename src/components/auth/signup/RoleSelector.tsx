
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
    const currentRoles = [...selectedRoles];
    const roleIndex = currentRoles.indexOf(roleId as any);
    
    if (roleIndex > -1) {
      // Remove role if already selected
      currentRoles.splice(roleIndex, 1);
    } else {
      // Add role if not selected
      currentRoles.push(roleId as any);
    }

    // Check if adding this role would result in all three roles being selected
    if (currentRoles.length === 3) {
      toast({
        title: "Role selection error",
        description: "You cannot select all three roles simultaneously",
        variant: "destructive",
      });
      return;
    }
    
    // Update form value
    form.setValue('roles', currentRoles, { shouldValidate: true });
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
                    className={`flex items-center p-3 rounded-md border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-autheo-primary bg-autheo-primary/10 shadow-md shadow-autheo-primary/20' 
                        : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
                    }`}
                  >
                    <Checkbox 
                      id={`role-${role.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <span className={`mr-2 p-1 rounded-full ${isSelected ? 'bg-slate-800' : ''}`}>
                        {getIcon(role.icon)}
                      </span>
                      <span className={`text-slate-200 font-medium ${isSelected ? 'text-autheo-primary' : ''}`}>
                        {role.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.formState.errors.roles && (
              <p className="text-sm font-medium text-red-500 mt-2">
                {form.formState.errors.roles.message as string}
              </p>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};

export default RoleSelector;
