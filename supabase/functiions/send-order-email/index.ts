import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SmtpClient } from "npm:smtp-client@0.2.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerLocation: string;
  customerPhone: string;
  totalAmount: number;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: OrderEmailPayload = await req.json();

    const {
      orderNumber,
      customerName,
      customerLocation,
      customerPhone,
      totalAmount,
      items,
    } = body;

    if (!orderNumber || !customerName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read SMTP config from database using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const sbAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: smtpConfig, error: configError } = await sbAdmin
      .from("smtp_config")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (configError || !smtpConfig) {
      return new Response(
        JSON.stringify({ error: "SMTP configuration not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smtpHost = smtpConfig.smtp_host;
    const smtpPort = smtpConfig.smtp_port;
    const smtpUser = smtpConfig.smtp_user;
    const smtpPass = smtpConfig.smtp_pass;
    const recipientEmail = smtpConfig.recipient_email;

    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.product_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">GHS ${item.unit_price.toFixed(2)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">GHS ${(item.quantity * item.unit_price).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#1c1917;padding:24px 32px;">
          <h1 style="margin:0;color:#f59e0b;font-size:24px;">StepStyle</h1>
          <p style="margin:4px 0 0;color:#a8a29e;font-size:14px;">New Order Received</p>
        </div>
        <div style="padding:24px 32px;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#1c1917;">Order: ${orderNumber}</h2>

          <div style="background:#f5f5f4;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;font-size:14px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Customer Details</h3>
            <p style="margin:4px 0;color:#1c1917;font-size:14px;"><strong>Name:</strong> ${customerName}</p>
            <p style="margin:4px 0;color:#1c1917;font-size:14px;"><strong>Phone:</strong> ${customerPhone}</p>
            <p style="margin:4px 0;color:#1c1917;font-size:14px;"><strong>Location:</strong> ${customerLocation}</p>
          </div>

          <h3 style="margin:0 0 8px;font-size:14px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Items Ordered</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <thead>
              <tr style="background:#f5f5f4;">
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#78716c;">Product</th>
                <th style="padding:8px 12px;text-align:center;font-size:12px;color:#78716c;">Qty</th>
                <th style="padding:8px 12px;text-align:right;font-size:12px;color:#78716c;">Price</th>
                <th style="padding:8px 12px;text-align:right;font-size:12px;color:#78716c;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="border-top:2px solid #1c1917;padding-top:12px;text-align:right;">
            <span style="font-size:16px;font-weight:bold;color:#1c1917;">Total: GHS ${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <div style="background:#f5f5f4;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#78716c;">This order was placed on the StepStyle online store.</p>
        </div>
      </div>
    `;

    const textBody = [
      `New Order: ${orderNumber}`,
      ``,
      `Customer Details:`,
      `  Name: ${customerName}`,
      `  Phone: ${customerPhone}`,
      `  Location: ${customerLocation}`,
      ``,
      `Items:`,
      ...items.map(
        (i) =>
          `  ${i.product_name} x${i.quantity} @ GHS ${i.unit_price.toFixed(2)} = GHS ${(i.quantity * i.unit_price).toFixed(2)}`
      ),
      ``,
      `Total: GHS ${totalAmount.toFixed(2)}`,
    ].join("\n");

    const client = new SmtpClient({
      host: smtpHost,
      port: smtpPort,
    });

    await client.connect();
    await client.login({
      user: smtpUser,
      pass: smtpPass,
    });

    await client.send({
      from: `"StepStyle Store" <${smtpUser}>`,
      to: recipientEmail,
      subject: `New Order: ${orderNumber} - ${customerName}`,
      content: textBody,
      html: htmlBody,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
