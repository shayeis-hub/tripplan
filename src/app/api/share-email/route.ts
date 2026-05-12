import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { toEmail, fromEmail, tripDestination, tripDates } = await req.json();

    if (!toEmail || !fromEmail || !tripDestination) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "טיולון <onboarding@resend.dev>",
        to: [toEmail],
        subject: `${fromEmail} שיתף איתך טיול לטיולון 🌴`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0d2137; color: #ffffff; border-radius: 16px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #091928, #0d2137); padding: 32px 28px 24px; text-align: center; border-bottom: 1px solid rgba(100,223,223,0.15);">
              <h1 style="font-size: 36px; font-weight: 900; color: #ffffff; letter-spacing: -1px; margin: 0 0 6px;">טיולון</h1>
              <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0;">מתכנן הטיולים שלי</p>
            </div>

            <!-- Body -->
            <div style="padding: 28px;">
              <p style="font-size: 16px; color: rgba(255,255,255,0.85); margin: 0 0 20px; line-height: 1.6;">
                היי! <strong style="color: #64dfdf;">${fromEmail}</strong> שיתף איתך טיול ב-טיולון 🎉
              </p>

              <!-- Trip card -->
              <div style="background: rgba(255,255,255,0.06); border: 0.5px solid rgba(100,223,223,0.2); border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                <div style="font-size: 22px; margin-bottom: 8px;">🌍 ${tripDestination}</div>
                ${tripDates ? `<div style="font-size: 13px; color: rgba(255,255,255,0.4);">${tripDates}</div>` : ""}
              </div>

              <p style="font-size: 14px; color: rgba(255,255,255,0.6); margin: 0 0 24px; line-height: 1.6;">
                כדי לראות את הטיול המשותף, היכנס לטיולון עם האימייל שלך.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://tulon.co.il" 
                   style="display: inline-block; background: #64dfdf; color: #0d2137; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; letter-spacing: 0.3px;">
                  פתח את טיולון ←
                </a>
              </div>

              <p style="font-size: 12px; color: rgba(255,255,255,0.25); text-align: center; margin: 0;">
                אם אין לך חשבון, הירשם עם האימייל הזה וטיול יופיע אוטומטית
              </p>
            </div>

            <!-- Footer -->
            <div style="padding: 16px 28px; border-top: 0.5px solid rgba(255,255,255,0.07); text-align: center;">
              <p style="font-size: 11px; color: rgba(255,255,255,0.2); margin: 0;">טיולון – מתכנן הטיולים שלי</p>
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
