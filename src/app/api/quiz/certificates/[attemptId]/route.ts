import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { errorResponse } from "@/lib/utils";

const QUOTES = [
  "Arise, awake, and stop not till the goal is reached.",
  "You cannot believe in God until you believe in yourself.",
  "In a conflict between the heart and the brain, follow your heart.",
  "The greatest religion is to be true to your own nature.",
  "All the powers in the universe are already ours.",
  "Education is the manifestation of the perfection already in man.",
  "You have to grow from the inside out. None can teach you, none can make you spiritual.",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    await ensureDb();
    const { attemptId } = await params;

    const attemptResult = await db.execute({
      sql: "SELECT * FROM attempts WHERE id = ?",
      args: [Number(attemptId)],
    });

    if (attemptResult.rows.length === 0) {
      return errorResponse("Attempt not found", 404);
    }

    const attempt = attemptResult.rows[0];

    if (!attempt.passed) {
      return errorResponse("No certificate for failed attempts", 400);
    }

    const quizResult = await db.execute({
      sql: "SELECT title FROM quizzes WHERE id = ?",
      args: [attempt.quiz_id],
    });

    const quizTitle = quizResult.rows.length > 0 ? String(quizResult.rows[0].title) : "Knowledge Quiz";
    const name = String(attempt.visitor_name || "Visitor");
    const score = Number(attempt.score);
    const date = String(attempt.attempted_at || new Date().toISOString()).split("T")[0];
    const coupon = String(attempt.coupon_code || "");
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Inter', sans-serif;
      background: #f5f5f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificate {
      width: 900px;
      max-width: 100%;
      aspect-ratio: 1.414;
      background: #FFFDF7;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    /* Outer border */
    .border-outer {
      position: absolute;
      inset: 12px;
      border: 3px solid #1A237E;
      pointer-events: none;
    }
    .border-inner {
      position: absolute;
      inset: 20px;
      border: 1px solid #C5CAE9;
      pointer-events: none;
    }
    /* Corner ornaments */
    .corner { position: absolute; width: 60px; height: 60px; }
    .corner svg { width: 100%; height: 100%; }
    .corner-tl { top: 24px; left: 24px; }
    .corner-tr { top: 24px; right: 24px; transform: scaleX(-1); }
    .corner-bl { bottom: 24px; left: 24px; transform: scaleY(-1); }
    .corner-br { bottom: 24px; right: 24px; transform: scale(-1); }
    /* Content */
    .content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 60px 80px;
      text-align: center;
    }
    .om-symbol {
      font-size: 36px;
      color: #FF8F00;
      margin-bottom: 8px;
      opacity: 0.8;
    }
    .museum-name {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      color: #1A237E;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .sub-name {
      font-size: 11px;
      color: #666;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .divider {
      width: 120px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #FF8F00, transparent);
      margin: 0 auto 20px;
    }
    .cert-title {
      font-family: 'Playfair Display', serif;
      font-size: 38px;
      font-weight: 700;
      color: #1A237E;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    .cert-subtitle {
      font-size: 13px;
      color: #888;
      margin-bottom: 28px;
      letter-spacing: 1px;
    }
    .presented-to {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 8px;
    }
    .visitor-name {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 600;
      color: #1A237E;
      margin-bottom: 6px;
      font-style: italic;
    }
    .name-line {
      width: 300px;
      height: 1px;
      background: #C5CAE9;
      margin: 0 auto 20px;
    }
    .achievement {
      font-size: 14px;
      color: #555;
      line-height: 1.6;
      max-width: 500px;
      margin-bottom: 20px;
    }
    .score-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #1A237E, #283593);
      color: white;
      padding: 10px 28px;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .quote {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 14px;
      color: #888;
      max-width: 450px;
      line-height: 1.5;
      margin-bottom: 4px;
    }
    .quote-author {
      font-size: 11px;
      color: #aaa;
      margin-bottom: 20px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      margin-top: auto;
    }
    .footer-item {
      text-align: center;
    }
    .footer-line {
      width: 140px;
      height: 1px;
      background: #1A237E;
      margin-bottom: 6px;
    }
    .footer-label {
      font-size: 10px;
      color: #999;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .footer-value {
      font-size: 12px;
      color: #333;
      font-weight: 500;
    }
    .coupon {
      font-size: 11px;
      color: #FF8F00;
      font-weight: 600;
      letter-spacing: 1px;
      margin-top: 8px;
    }
    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 200px;
      color: rgba(26, 35, 126, 0.03);
      font-family: serif;
      pointer-events: none;
      z-index: 1;
    }
    /* Print button */
    .actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
    }
    .btn {
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #1A237E;
      color: white;
    }
    .btn-primary:hover { background: #283593; }
    .btn-secondary {
      background: white;
      color: #1A237E;
      border: 2px solid #1A237E;
    }
    .btn-secondary:hover { background: #E8EAF6; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    
    <!-- Corner ornaments -->
    <div class="corner corner-tl"><svg viewBox="0 0 60 60"><path d="M0 0 Q30 0 30 30 Q30 0 60 0" fill="none" stroke="#C5CAE9" stroke-width="1.5"/><circle cx="8" cy="8" r="3" fill="#FF8F00" opacity="0.6"/></svg></div>
    <div class="corner corner-tr"><svg viewBox="0 0 60 60"><path d="M0 0 Q30 0 30 30 Q30 0 60 0" fill="none" stroke="#C5CAE9" stroke-width="1.5"/><circle cx="8" cy="8" r="3" fill="#FF8F00" opacity="0.6"/></svg></div>
    <div class="corner corner-bl"><svg viewBox="0 0 60 60"><path d="M0 0 Q30 0 30 30 Q30 0 60 0" fill="none" stroke="#C5CAE9" stroke-width="1.5"/><circle cx="8" cy="8" r="3" fill="#FF8F00" opacity="0.6"/></svg></div>
    <div class="corner corner-br"><svg viewBox="0 0 60 60"><path d="M0 0 Q30 0 30 30 Q30 0 60 0" fill="none" stroke="#C5CAE9" stroke-width="1.5"/><circle cx="8" cy="8" r="3" fill="#FF8F00" opacity="0.6"/></svg></div>
    
    <div class="watermark">🙏</div>
    
    <div class="content">
      <div class="om-symbol">ॐ</div>
      <div class="museum-name">Vivekananda Smriti</div>
      <div class="sub-name">Ramakrishna Ashram, Mysore</div>
      <div class="divider"></div>
      
      <div class="cert-title">Certificate</div>
      <div class="cert-subtitle">of Knowledge & Appreciation</div>
      
      <div class="presented-to">Presented To</div>
      <div class="visitor-name">${name}</div>
      <div class="name-line"></div>
      
      <div class="achievement">
        For successfully completing the <strong>${quizTitle}</strong> 
        and demonstrating understanding of the life and teachings of 
        Swami Vivekananda.
      </div>
      
      <div class="score-badge">
        🏆 Score: ${score} — Passed with Distinction
      </div>
      
      <div class="quote">"${quote}"</div>
      <div class="quote-author">— Swami Vivekananda</div>
      
      ${coupon ? `<div class="coupon">🎁 Bookstall Coupon: ${coupon} (10% off)</div>` : ''}
      
      <div class="footer">
        <div class="footer-item">
          <div class="footer-line"></div>
          <div class="footer-value">${date}</div>
          <div class="footer-label">Date</div>
        </div>
        <div class="footer-item">
          <div class="footer-line"></div>
          <div class="footer-value">Vivekananda Smriti</div>
          <div class="footer-label">Museum</div>
        </div>
        <div class="footer-item">
          <div class="footer-line"></div>
          <div class="footer-value">#${attemptId}</div>
          <div class="footer-label">Certificate No.</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="actions no-print">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print Certificate</button>
    <button class="btn btn-secondary" onclick="window.close()">Close</button>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
