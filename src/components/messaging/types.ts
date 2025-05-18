
export interface Message {
  id: string;
  sender: 'patient' | 'provider';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: {
    name: string;
    type: string;
    url?: string;
  }[];
}

export interface Conversation {
  id: string;
  participantName: string;
  participantRole: 'patient' | 'provider';
  participantTitle?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

export interface SecureMessagingProps {
  isProviderView?: boolean;
}
