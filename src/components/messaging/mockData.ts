
import { Conversation } from './types';

export function getMockPatientConversations(): Conversation[] {
  return [
    {
      id: '1',
      participantName: 'Dr. Emily Chen',
      participantRole: 'provider',
      participantTitle: 'Primary Care',
      lastMessage: 'Your lab results look normal. No concerns at this time.',
      lastMessageTime: '2h ago',
      unread: 0,
      messages: [
        {
          id: '1-1',
          sender: 'patient',
          senderName: 'You',
          content: 'Hello Dr. Chen, I received a notification that my lab results are ready. Could you please let me know if there\'s anything concerning?',
          timestamp: 'May 15, 2025 10:32 AM',
          read: true
        },
        {
          id: '1-2',
          sender: 'provider',
          senderName: 'Dr. Emily Chen',
          content: 'Hello! I\'ve reviewed your results, and everything looks normal. Your cholesterol levels have improved since your last test. Keep up the good work with your diet and exercise regimen!',
          timestamp: 'May 15, 2025 11:45 AM',
          read: true
        },
        {
          id: '1-3',
          sender: 'patient',
          senderName: 'You',
          content: 'That\'s great news! Thanks for the quick response. Should I continue with the same medication dosage?',
          timestamp: 'May 15, 2025 11:52 AM',
          read: true
        },
        {
          id: '1-4',
          sender: 'provider',
          senderName: 'Dr. Emily Chen',
          content: 'Your lab results look normal. No concerns at this time. Yes, please continue with the same dosage and we\'ll reassess at your next appointment in 3 months.',
          timestamp: '2h ago',
          read: false
        }
      ]
    },
    {
      id: '2',
      participantName: 'Dr. James Wilson',
      participantRole: 'provider',
      participantTitle: 'Cardiologist',
      lastMessage: 'Please schedule a follow-up appointment to discuss your echo results.',
      lastMessageTime: 'Yesterday',
      unread: 1,
      messages: [
        {
          id: '2-1',
          sender: 'provider',
          senderName: 'Dr. James Wilson',
          content: 'Hello, I\'ve reviewed your recent echocardiogram results. There are a few things I\'d like to discuss in person. Please schedule a follow-up appointment at your earliest convenience.',
          timestamp: 'Yesterday',
          read: false
        }
      ]
    },
    {
      id: '3',
      participantName: 'Dr. Sarah Johnson',
      participantRole: 'provider',
      participantTitle: 'Dermatologist',
      lastMessage: 'The prescription has been sent to your pharmacy.',
      lastMessageTime: 'May 12',
      unread: 0,
      messages: [
        {
          id: '3-1',
          sender: 'patient',
          senderName: 'You',
          content: 'Hi Dr. Johnson, the rash seems to be getting worse despite using the cream. I\'ve attached some photos.',
          timestamp: 'May 12, 2025 9:15 AM',
          read: true,
          attachments: [
            {
              name: 'rash-photo.jpg',
              type: 'image/jpeg'
            }
          ]
        },
        {
          id: '3-2',
          sender: 'provider',
          senderName: 'Dr. Sarah Johnson',
          content: 'Thank you for the update and photos. I\'ll prescribe a stronger medication. The prescription has been sent to your pharmacy.',
          timestamp: 'May 12, 2025 10:45 AM',
          read: true
        }
      ]
    }
  ];
}

export function getMockProviderConversations(): Conversation[] {
  return [
    {
      id: '1',
      participantName: 'John Smith',
      participantRole: 'patient',
      lastMessage: 'Thank you for the prescription, I\'ll pick it up today.',
      lastMessageTime: '1h ago',
      unread: 1,
      messages: [
        {
          id: '1-1',
          sender: 'provider',
          senderName: 'You (Provider)',
          content: 'Hello John, I\'ve reviewed your lab results. Your cholesterol is slightly elevated, but nothing serious. I recommend continuing your current medication.',
          timestamp: 'May 16, 2025 9:15 AM',
          read: true
        },
        {
          id: '1-2',
          sender: 'patient',
          senderName: 'John Smith',
          content: 'Thank you, Doctor. Should I make any dietary changes as well?',
          timestamp: 'May 16, 2025 9:45 AM',
          read: true
        },
        {
          id: '1-3',
          sender: 'provider',
          senderName: 'You (Provider)',
          content: 'I\'d recommend reducing saturated fat intake and increasing fiber. I\'ll send over a diet plan. Also, I\'ve renewed your prescription for the next 3 months.',
          timestamp: 'May 16, 2025 10:15 AM',
          read: true,
          attachments: [
            {
              name: 'diet_plan.pdf',
              type: 'application/pdf'
            }
          ]
        },
        {
          id: '1-4',
          sender: 'patient',
          senderName: 'John Smith',
          content: 'Thank you for the prescription, I\'ll pick it up today.',
          timestamp: '1h ago',
          read: false
        }
      ]
    },
    {
      id: '2',
      participantName: 'Emma Johnson',
      participantRole: 'patient',
      lastMessage: 'I\'ve been experiencing increased dizziness after starting the new medication.',
      lastMessageTime: '3h ago',
      unread: 2,
      messages: [
        {
          id: '2-1',
          sender: 'patient',
          senderName: 'Emma Johnson',
          content: 'Hello Doctor, I started the new blood pressure medication 3 days ago.',
          timestamp: 'May 17, 2025 8:30 AM',
          read: true
        },
        {
          id: '2-2',
          sender: 'patient',
          senderName: 'Emma Johnson',
          content: 'I\'ve been experiencing increased dizziness after starting the new medication.',
          timestamp: '3h ago',
          read: false
        },
        {
          id: '2-3',
          sender: 'patient',
          senderName: 'Emma Johnson',
          content: 'Should I stop taking it or reduce the dosage?',
          timestamp: '3h ago',
          read: false
        }
      ]
    },
    {
      id: '3',
      participantName: 'Robert Williams',
      participantRole: 'patient',
      lastMessage: 'Here are the photos of the skin reaction you requested.',
      lastMessageTime: 'Yesterday',
      unread: 0,
      messages: [
        {
          id: '3-1',
          sender: 'provider',
          senderName: 'You (Provider)',
          content: 'Hello Mr. Williams, could you please send me photos of the skin reaction you mentioned during our appointment?',
          timestamp: 'May 16, 2025 3:15 PM',
          read: true
        },
        {
          id: '3-2',
          sender: 'patient',
          senderName: 'Robert Williams',
          content: 'Here are the photos of the skin reaction you requested.',
          timestamp: 'Yesterday',
          read: true,
          attachments: [
            {
              name: 'skin_photo_1.jpg',
              type: 'image/jpeg'
            },
            {
              name: 'skin_photo_2.jpg',
              type: 'image/jpeg'
            }
          ]
        }
      ]
    },
    {
      id: '4',
      participantName: 'Linda Brown',
      participantRole: 'patient',
      lastMessage: 'I\'ve scheduled my follow-up appointment for next Tuesday.',
      lastMessageTime: '2 days ago',
      unread: 0,
      messages: [
        {
          id: '4-1',
          sender: 'provider',
          senderName: 'You (Provider)',
          content: 'Ms. Brown, please schedule a follow-up appointment within the next 2 weeks to discuss your treatment progress.',
          timestamp: 'May 15, 2025 11:30 AM',
          read: true
        },
        {
          id: '4-2',
          sender: 'patient',
          senderName: 'Linda Brown',
          content: 'I\'ve scheduled my follow-up appointment for next Tuesday.',
          timestamp: '2 days ago',
          read: true
        }
      ]
    }
  ];
}
