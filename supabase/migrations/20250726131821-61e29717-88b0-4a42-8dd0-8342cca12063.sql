-- Create conversations table for patient-provider messaging
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_conversations_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_provider FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT unique_patient_provider UNIQUE (patient_id, provider_id)
);

-- Create messages table for individual messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'provider')),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  encrypted_content TEXT,
  iv TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create message attachments table
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  encrypted_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_attachments_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Patients can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Providers can view conversations they're part of" 
ON public.conversations 
FOR SELECT 
USING (provider_id = auth.uid());

CREATE POLICY "Providers can create conversations with patients" 
ON public.conversations 
FOR INSERT 
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Patients can create conversations with providers" 
ON public.conversations 
FOR INSERT 
WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Participants can update conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  provider_id = auth.uid() OR 
  patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Conversation participants can view messages" 
ON public.messages 
FOR SELECT 
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE provider_id = auth.uid() 
    OR patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Conversation participants can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE provider_id = auth.uid() 
    OR patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Senders can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid());

-- RLS Policies for message attachments
CREATE POLICY "Message participants can view attachments" 
ON public.message_attachments 
FOR SELECT 
USING (
  message_id IN (
    SELECT m.id FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.provider_id = auth.uid() 
    OR c.patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Message senders can create attachments" 
ON public.message_attachments 
FOR INSERT 
WITH CHECK (
  message_id IN (
    SELECT id FROM messages WHERE sender_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX idx_conversations_provider_id ON conversations(provider_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id_param UUID, user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE messages 
  SET is_read = true, read_at = now()
  WHERE conversation_id = conversation_id_param
  AND sender_id != user_id_param
  AND is_read = false;
END;
$$;

-- Enable realtime for tables
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE message_attachments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_attachments;