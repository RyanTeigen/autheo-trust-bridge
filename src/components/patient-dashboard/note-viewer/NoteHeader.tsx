
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, Clock } from 'lucide-react';
import { SoapNote } from '../types/note';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface NoteHeaderProps {
  note: SoapNote;
}

const NoteHeader: React.FC<NoteHeaderProps> = ({ note }) => {
  return (
    <div className="flex justify-between">
      <div>
        <CardTitle>Medical Note</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Visit Date: {note && new Date(note.visit_date).toLocaleDateString()}
          </div>
        </CardDescription>
      </div>
      <div className="flex gap-2">
        {note?.decentralized_refs && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Shield className="h-3.5 w-3.5 mr-1" /> Decentralized
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">This note is secured using decentralized encryption</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {note?.distribution_status === 'distributed' ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Distributed
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3.5 w-3.5 mr-1" /> Pending Distribution
          </Badge>
        )}
      </div>
    </div>
  );
};

export default NoteHeader;
