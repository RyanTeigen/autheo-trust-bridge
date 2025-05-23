
import React from 'react';
import { SoapNote } from '../types/note';

interface NoteContentProps {
  note: SoapNote;
}

const NoteContent: React.FC<NoteContentProps> = ({ note }) => {
  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-2">Subjective</h3>
        <p className="whitespace-pre-wrap">{note?.subjective}</p>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-2">Objective</h3>
        <p className="whitespace-pre-wrap">{note?.objective}</p>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-2">Assessment</h3>
        <p className="whitespace-pre-wrap">{note?.assessment}</p>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-2">Plan</h3>
        <p className="whitespace-pre-wrap">{note?.plan}</p>
      </div>
    </div>
  );
};

export default NoteContent;
