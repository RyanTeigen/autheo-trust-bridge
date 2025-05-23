
import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Shield, Calendar } from 'lucide-react';
import { SoapNote } from '../types/note';

interface NoteFooterProps {
  note: SoapNote;
}

const NoteFooter: React.FC<NoteFooterProps> = ({ note }) => {
  return (
    <CardFooter className="border-t pt-4 text-xs text-slate-500">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-autheo-primary" />
          {note?.decentralized_refs ? 'Secured with decentralized encryption' : 'Standard encryption'}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          Last updated: {new Date(note?.updated_at).toLocaleString()}
        </div>
      </div>
    </CardFooter>
  );
};

export default NoteFooter;
