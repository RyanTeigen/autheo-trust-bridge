import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlert {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  context?: Record<string, any>;
}

interface EmailRequest {
  alert: SecurityAlert;
  recipients: string[];
  complianceOfficer?: string;
}

const getEmailTemplate = (alert: SecurityAlert) => {
  const severityColors = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#d97706',
    low: '#65a30d'
  };

  const severityEmojis = {
    critical: '🚨',
    high: '⚠️',
    medium: '📢',
    low: 'ℹ️'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Alert</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${severityColors[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">
          ${severityEmojis[alert.severity]} Security Alert - ${alert.severity.toUpperCase()}
        </h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: ${severityColors[alert.severity]}; margin-top: 0;">${alert.title}</h2>
        
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Alert Type:</strong> ${alert.type}</p>
          <p><strong>Timestamp:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
          ${alert.userId ? `<p><strong>User ID:</strong> ${alert.userId}</p>` : ''}
          ${alert.ipAddress ? `<p><strong>IP Address:</strong> ${alert.ipAddress}</p>` : ''}
          ${alert.userAgent ? `<p><strong>User Agent:</strong> ${alert.userAgent}</p>` : ''}
        </div>

        ${alert.context && Object.keys(alert.context).length > 0 ? `
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin-top: 0;">Additional Context:</h3>
          ${Object.entries(alert.context).map(([key, value]) => 
            `<p><strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}</p>`
          ).join('')}
        </div>
        ` : ''}

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Immediate Actions Required:</h3>
          <ul style="color: #856404;">
            ${alert.severity === 'critical' ? `
              <li>Investigate immediately</li>
              <li>Check for data breach indicators</li>
              <li>Review audit logs</li>
              <li>Consider temporary access restrictions</li>
            ` : alert.severity === 'high' ? `
              <li>Review within 1 hour</li>
              <li>Check user activity patterns</li>
              <li>Verify system integrity</li>
            ` : `
              <li>Review within 24 hours</li>
              <li>Monitor for patterns</li>
              <li>Update security policies if needed</li>
            `}
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">
            This is an automated security alert from your HIPAA compliance system.<br>
            Please do not reply to this email. Check your compliance dashboard for more details.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alert, recipients, complianceOfficer }: EmailRequest = await req.json();

    if (!alert || !recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Alert and recipients are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailHtml = getEmailTemplate(alert);
    const subject = `${alert.severity === 'critical' ? '🚨 CRITICAL' : '⚠️'} Security Alert: ${alert.title}`;

    // Send to all recipients
    const allRecipients = [...recipients];
    if (complianceOfficer && !recipients.includes(complianceOfficer)) {
      allRecipients.push(complianceOfficer);
    }

    const emailResponse = await resend.emails.send({
      from: "Security Alerts <security@resend.dev>",
      to: allRecipients,
      subject,
      html: emailHtml,
    });

    console.log(`Security alert email sent successfully to ${allRecipients.length} recipients:`, emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        recipients: allRecipients.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error sending security alert email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);