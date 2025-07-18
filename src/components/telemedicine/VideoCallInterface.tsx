import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  MessageSquare,
  Settings,
  Users,
  Clock,
  ChevronDown
} from 'lucide-react';
import { TelehealthSession, SessionParticipant, VideoCallConfig } from '@/types/fhir';

interface VideoCallInterfaceProps {
  session: TelehealthSession;
  currentUserId: string;
  onEndCall: () => void;
  onToggleVideo?: (enabled: boolean) => void;
  onToggleAudio?: (enabled: boolean) => void;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  session,
  currentUserId,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
}) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string; timestamp: Date }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const currentParticipant = session.participants.find(p => p.userId === currentUserId);
  const otherParticipants = session.participants.filter(p => p.userId !== currentUserId);

  useEffect(() => {
    initializeWebRTC();
    
    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      cleanup();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add TURN servers for production
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setConnectionStatus('connected');
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        setConnectionStatus(peerConnection.connectionState as any);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send candidate to other peer via signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };

      setConnectionStatus('connected');
      toast({
        title: "Call Connected",
        description: "Video call has been established successfully",
      });

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Connection Failed",
        description: "Failed to initialize video call",
        variant: "destructive",
      });
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoState;
      }
    }
    
    onToggleVideo?.(newVideoState);
    
    toast({
      title: newVideoState ? "Video Enabled" : "Video Disabled",
      description: newVideoState ? "Camera is now on" : "Camera is now off",
    });
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newAudioState;
      }
    }
    
    onToggleAudio?.(newAudioState);
    
    toast({
      title: newAudioState ? "Microphone Enabled" : "Microphone Disabled",
      description: newAudioState ? "Microphone is now on" : "Microphone is now off",
    });
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      
      setIsScreenSharing(true);
      
      // Replace video track with screen share
      if (peerConnectionRef.current && localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const screenTrack = screenStream.getVideoTracks()[0];
        
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Handle screen share end
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
          }
        };
      }
      
      toast({
        title: "Screen Sharing Started",
        description: "Your screen is now being shared",
      });
    } catch (error) {
      toast({
        title: "Screen Share Failed",
        description: "Unable to start screen sharing",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        sender: currentUserId,
        message: newMessage,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // In real implementation, send via WebRTC data channel or signaling server
      console.log('Sending message:', message);
    }
  };

  const handleEndCall = () => {
    cleanup();
    onEndCall();
    
    toast({
      title: "Call Ended",
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main video area */}
      <div className="flex-1 relative">
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-gray-800"
        />
        
        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Call info overlay */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{formatDuration(callDuration)}</span>
          </div>
        </div>

        {/* Participants info */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">
              {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Control bar */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3">
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="sm"
              onClick={toggleAudio}
              className="rounded-full w-12 h-12"
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="sm"
              onClick={toggleVideo}
              className="rounded-full w-12 h-12"
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={startScreenShare}
              className="rounded-full w-12 h-12"
              disabled={isScreenSharing}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="rounded-full w-12 h-12"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-full w-12 h-12"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndCall}
              className="rounded-full w-12 h-12"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === currentUserId ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender === currentUserId 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <Button size="sm" onClick={sendMessage}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallInterface;