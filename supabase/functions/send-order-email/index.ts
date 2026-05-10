import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildEmailHtml(
  orderNumber: string,
  customerName: string,
  deliveryAddress: string,
  items: Array<{ product_name: string; size?: string; color?: string; quantity: number; subtotal: number }>,
  totalAmount: number,
): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #2a2a2a;">
        <td style="padding: 12px 8px; color: #e5e7eb;">${item.product_name}</td>
        <td style="padding: 12px 8px; color: #9ca3af; text-align: center;">${[item.size, item.color].filter(Boolean).join(" / ") || "—"}</td>
        <td style="padding: 12px 8px; color: #9ca3af; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; color: #e87d3c; font-weight: bold; text-align: right;">₵${Number(item.subtotal).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#0f0f0f;font-family:Inter,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
          <div style="background:linear-gradient(135deg,#e25d1b,#af3312);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">New order</h1>
            <p style="color:rgba(255,255,255,0.8);margin-top:8px;font-size:14px;">Manuel's Closet</p>
          </div>
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center;">
            <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">Order number</p>
            <p style="color:#e87d3c;font-size:32px;font-weight:800;margin:0;font-family:monospace;">${orderNumber}</p>
          </div>
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:20px;">
            <p style="color:#e5e7eb;margin:0;">Customer: <strong style="color:white;">${customerName}</strong></p>
            <p style="color:#9ca3af;margin:12px 0 0;font-size:14px;line-height:1.6;">${deliveryAddress}</p>
          </div>
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:24px;margin-bottom:20px;">
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="border-bottom:1px solid #2a2a2a;">
                <th style="padding:8px;color:#6b7280;font-size:12px;text-align:left;">Item</th>
                <th style="padding:8px;color:#6b7280;font-size:12px;text-align:center;">Size/Color</th>
                <th style="padding:8px;color:#6b7280;font-size:12px;text-align:center;">Qty</th>
                <th style="padding:8px;color:#6b7280;font-size:12px;text-align:right;">Price</th>
              </tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #2a2a2a;text-align:right;">
              <span style="color:#e87d3c;font-size:22px;font-weight:800;">₵${Number(totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </body>
      </html>`;
}

async function sendViaResend(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: (body as { message?: string }).message || `Resend HTTP ${res.status}` };
  }
  return { ok: true };
}

async function sendViaSmtp(params: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
  const client = new SMTPClient({
    connection: {
      hostname: params.host,
      port: params.port,
      tls: params.secure,
      auth: { username: params.user, password: params.pass },
    },
  });
  try {
    await client.send({
      from: `${params.fromName} <${params.from}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } finally {
    await client.close();
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderId, orderNumber, customerName, items, totalAmount, deliveryAddress } = body;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: smtpConfig, error: smtpError } = await supabaseAdmin
      .from("smtp_config")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (smtpError || !smtpConfig) {
      return new Response(JSON.stringify({ error: "SMTP config not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smtpHost = smtpConfig.host ?? smtpConfig.smtp_host;
    const smtpPort = Number(smtpConfig.port ?? smtpConfig.smtp_port ?? 587);
    const smtpSecure = Boolean(smtpConfig.secure ?? false);
    const smtpUser = smtpConfig.username ?? smtpConfig.smtp_user;
    const smtpPass = smtpConfig.password ?? smtpConfig.smtp_pass;
    const fromEmail = smtpConfig.from_email ?? smtpUser;
    const fromName = smtpConfig.from_name ?? "Manuel's Closet";
    const recipientFromDb = smtpConfig.recipient_email ?? fromEmail;
    const notifyEmail = Deno.env.get("ORDER_NOTIFY_EMAIL")?.trim() || recipientFromDb;

    const emailHtml = buildEmailHtml(orderNumber, customerName, deliveryAddress, items || [], totalAmount);
    const subject = `New Order ${orderNumber} - Manuel's Closet`;

    const resendKey = Deno.env.get("RESEND_API_KEY")?.trim();
    const resendFrom = Deno.env.get("RESEND_FROM")?.trim() || "Manuel Closet <onboarding@resend.dev>";

    if (resendKey) {
      const r = await sendViaResend({
        apiKey: resendKey,
        from: resendFrom,
        to: notifyEmail,
        subject,
        html: emailHtml,
      });
      if (!r.ok) {
        return new Response(JSON.stringify({ error: r.error || "Resend failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ success: true, channel: "resend", orderId, orderNumber, recipientEmail: notifyEmail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail || !notifyEmail) {
      return new Response(
        JSON.stringify({
          error:
            "SMTP config incomplete. For reliable delivery on Supabase Edge, set secrets RESEND_API_KEY and ORDER_NOTIFY_EMAIL.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await sendViaSmtp({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
      from: fromEmail,
      fromName,
      to: notifyEmail,
      subject,
      html: emailHtml,
    });

    return new Response(
      JSON.stringify({ success: true, channel: "smtp", orderId, orderNumber, recipientEmail: notifyEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("send-order-email error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
