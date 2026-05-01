import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, orderNumber, customerName, items, totalAmount, deliveryAddress } = await req.json();

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch SMTP config from DB
    const { data: smtpConfig, error: smtpError } = await supabaseAdmin
      .from('smtp_config')
      .select('*')
      .limit(1)
      .single();

    if (smtpError || !smtpConfig) {
      console.error('SMTP config not found:', smtpError);
      return new Response(JSON.stringify({ error: 'SMTP config not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build items HTML
    const itemsHtml = items.map((item: any) => `
      <tr style="border-bottom: 1px solid #2a2a2a;">
        <td style="padding: 12px 8px; color: #e5e7eb;">${item.product_name}</td>
        <td style="padding: 12px 8px; color: #9ca3af; text-align: center;">${[item.size, item.color].filter(Boolean).join(' / ') || '—'}</td>
        <td style="padding: 12px 8px; color: #9ca3af; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; color: #e87d3c; font-weight: bold; text-align: right;">₵${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    // HTML Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Order Confirmation - Manuel's Closet</title>
      </head>
      <body style="margin:0;padding:0;background:#0f0f0f;font-family:Inter,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#e25d1b,#af3312);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
            <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:white;line-height:56px;">M</div>
            <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Order Confirmed! 🎉</h1>
            <p style="color:rgba(255,255,255,0.8);margin-top:8px;font-size:14px;">Thank you for shopping with Manuel's Closet</p>
          </div>

          <!-- Order Number -->
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center;">
            <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">Your Order Number</p>
            <p style="color:#e87d3c;font-size:32px;font-weight:800;margin:0;font-family:monospace;letter-spacing:2px;">${orderNumber}</p>
            <p style="color:#6b7280;font-size:12px;margin-top:8px;">Save this number to track your order</p>
          </div>

          <!-- Greeting -->
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:20px;">
            <p style="color:#e5e7eb;margin:0;font-size:15px;">Hi <strong style="color:white;">${customerName}</strong>,</p>
            <p style="color:#9ca3af;margin:12px 0 0;font-size:14px;line-height:1.6;">
              We've received your order and our team is already getting it ready for you. 
              You'll receive another update once your order is on its way.
            </p>
          </div>

          <!-- Delivery Address -->
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:20px;">
            <h3 style="color:white;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">📦 Delivery To</h3>
            <p style="color:#9ca3af;margin:0;font-size:14px;line-height:1.6;">${deliveryAddress}</p>
          </div>

          <!-- Items Table -->
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:20px;">
            <h3 style="color:white;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">🛍 Order Items</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid #2a2a2a;">
                  <th style="padding:8px;color:#6b7280;font-size:12px;text-align:left;font-weight:500;">Item</th>
                  <th style="padding:8px;color:#6b7280;font-size:12px;text-align:center;font-weight:500;">Size/Color</th>
                  <th style="padding:8px;color:#6b7280;font-size:12px;text-align:center;font-weight:500;">Qty</th>
                  <th style="padding:8px;color:#6b7280;font-size:12px;text-align:right;font-weight:500;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#9ca3af;font-size:14px;">Total Amount</span>
              <span style="color:#e87d3c;font-size:22px;font-weight:800;">₵${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align:center;padding:16px;">
            <p style="color:#4b5563;font-size:13px;margin:0;">Questions? Contact us anytime.</p>
            <p style="color:#374151;font-size:12px;margin-top:8px;">© ${new Date().getFullYear()} Manuel's Closet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via SMTP using fetch to an SMTP API or via built-in Deno SMTP
    // Using SMTP via TCP with Deno's standard library
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');

    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: smtpConfig.port,
        tls: smtpConfig.secure,
        auth: {
          username: smtpConfig.username,
          password: smtpConfig.password,
        },
      },
    });


    
  } catch (error: any) {
    console.error('send-order-email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
