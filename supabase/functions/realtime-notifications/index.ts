import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    // Create Supabase client for authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from connection
    const authToken = headers.get('authorization')?.replace('Bearer ', '');
    
    if (!authToken) {
      return new Response("Authentication required", { status: 401 });
    }

    // Verify user
    const { data: { user }, error } = await supabase.auth.getUser(authToken);
    if (error || !user) {
      return new Response("Invalid authentication", { status: 401 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    console.log(`WebSocket connection established for user: ${user.id}`);

    // Store connected clients (in production, use Redis or similar)
    const connectedClients = new Map();

    socket.onopen = () => {
      connectedClients.set(user.id, socket);
      console.log(`User ${user.id} connected to real-time notifications`);
      
      // Send welcome message
      socket.send(JSON.stringify({
        type: 'connection_established',
        userId: user.id,
        timestamp: new Date().toISOString()
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);

        switch (message.type) {
          case 'subscribe_notifications':
            // Subscribe to user-specific notifications
            socket.send(JSON.stringify({
              type: 'subscribed',
              channel: `notifications:${user.id}`,
              timestamp: new Date().toISOString()
            }));
            break;

          case 'mark_notification_read':
            // Mark notification as read in database
            const { error: updateError } = await supabase
              .from('patient_notifications')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', message.notificationId)
              .eq('patient_id', user.id);

            if (!updateError) {
              socket.send(JSON.stringify({
                type: 'notification_updated',
                notificationId: message.notificationId,
                timestamp: new Date().toISOString()
              }));
            }
            break;

          case 'send_message':
            // Handle secure messaging between patient and provider
            const { error: messageError } = await supabase
              .from('messages')
              .insert({
                sender_id: user.id,
                conversation_id: message.conversationId,
                content: message.content,
                message_type: 'text'
              });

            if (!messageError) {
              // Notify other participants in the conversation
              socket.send(JSON.stringify({
                type: 'message_sent',
                conversationId: message.conversationId,
                timestamp: new Date().toISOString()
              }));
            }
            break;

          case 'ping':
            socket.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
            break;

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
          timestamp: new Date().toISOString()
        }));
      }
    };

    socket.onclose = () => {
      connectedClients.delete(user.id);
      console.log(`User ${user.id} disconnected from real-time notifications`);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(user.id);
    };

    return response;

  } catch (error) {
    console.error('WebSocket setup error:', error);
    return new Response("Internal server error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});