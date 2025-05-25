
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Phone, AlertTriangle } from 'lucide-react';

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  isPrimary: z.boolean().default(false),
});

type EmergencyContactFormValues = z.infer<typeof emergencyContactSchema>;

interface EmergencyContact extends EmergencyContactFormValues {
  id: string;
}

const EmergencyContactsSettings = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4567',
      isPrimary: true,
    },
  ]);
  const [isAddingContact, setIsAddingContact] = useState(false);

  const form = useForm<EmergencyContactFormValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: '',
      relationship: '',
      phone: '',
      isPrimary: false,
    },
  });

  const onSubmit = (data: EmergencyContactFormValues) => {
    const newContact: EmergencyContact = {
      ...data,
      id: Date.now().toString(),
    };

    setContacts(prev => [...prev, newContact]);
    form.reset();
    setIsAddingContact(false);
    
    toast({
      title: "Emergency Contact Added",
      description: `${data.name} has been added to your emergency contacts.`,
    });
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
    toast({
      title: "Contact Removed",
      description: "Emergency contact has been removed.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Emergency Contacts
        </CardTitle>
        <CardDescription>
          Manage your emergency contacts for critical situations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-800/30">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{contact.name}</h4>
                {contact.isPrimary && (
                  <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                    Primary
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{contact.relationship}</p>
              <p className="text-sm flex items-center gap-1 text-slate-300">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeContact(contact.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {isAddingContact ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-3 border rounded-lg bg-slate-800/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spouse, Parent, Friend" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="autheo">
                  Add Contact
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingContact(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Button
            onClick={() => setIsAddingContact(true)}
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Emergency Contact
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContactsSettings;
