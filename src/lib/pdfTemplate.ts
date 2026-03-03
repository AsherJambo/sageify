export function generatePrintHTML(username: string, bodyContent: string, idNumber?: string | null): string {
  const date = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>פרופיל אישי – ${username}</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 12mm 14mm;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Heebo', sans-serif;
      direction: rtl;
      color: #1e293b;
      background: #fff;
      font-size: 13px;
      line-height: 1.6;
    }

    /* ── Decorative page frame ── */
    .page-frame {
      border: 2.5px solid #1e3a5f;
      border-radius: 12px;
      padding: 28px 32px;
      min-height: calc(100vh - 24mm);
      position: relative;
      background: linear-gradient(135deg, #fefefe 0%, #f8f6f0 100%);
    }

    .page-frame::before {
      content: '';
      position: absolute;
      inset: 5px;
      border: 1px solid #c8a96e;
      border-radius: 9px;
      pointer-events: none;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #1e3a5f;
      position: relative;
    }

    .header::after {
      content: '🦉';
      font-size: 28px;
      position: absolute;
      bottom: -18px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #fefefe 0%, #f8f6f0 100%);
      padding: 0 12px;
    }

    .header h1 {
      font-size: 26px;
      font-weight: 800;
      color: #1e3a5f;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }

    .header .subtitle {
      font-size: 15px;
      color: #c8a96e;
      font-weight: 600;
    }

    .header .date {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
      margin-bottom: 8px;
    }

    /* ── Sections ── */
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    h3 {
      font-size: 15px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 10px;
      padding: 6px 14px;
      background: linear-gradient(90deg, #1e3a5f 0%, #2d5a8e 100%);
      color: #fff;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ── Score bars ── */
    .flex.items-center.gap-3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
    }

    .text-sm.w-36 {
      font-size: 12px;
      width: 130px;
      text-align: right;
      color: #334155;
      font-weight: 500;
    }

    .flex-1.bg-muted {
      flex: 1;
      background: #e8e4da;
      border-radius: 8px;
      height: 16px;
      overflow: hidden;
    }

    .bg-primary {
      background: linear-gradient(90deg, #1e3a5f, #c8a96e) !important;
      height: 100%;
      border-radius: 8px;
      transition: none;
    }

    .text-xs.text-muted-foreground.w-10 {
      font-size: 11px;
      color: #64748b;
      width: 36px;
      text-align: left;
      font-weight: 600;
    }

    /* ── Badges ── */
    .inline-block.px-2.py-0\\.5.rounded-full {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      margin: 2px;
    }

    .bg-green-100,
    [class*="bg-green"] {
      background: #dcfce7 !important;
      color: #166534 !important;
    }

    .bg-yellow-100,
    [class*="bg-yellow"] {
      background: #fef9c3 !important;
      color: #854d0e !important;
    }

    .bg-primary\\/10 {
      background: #e8e4da !important;
      color: #1e3a5f !important;
    }

    .bg-muted {
      background: #f1f0eb !important;
      color: #64748b !important;
    }

    /* ── Skills lists ── */
    ul {
      list-style: none;
      padding: 0;
    }

    li {
      padding: 2px 0;
      font-size: 12px;
      color: #334155;
    }

    .text-sm.font-semibold {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .text-green-700 { color: #15803d !important; }
    .text-yellow-700 { color: #a16207 !important; }

    /* ── Chat messages ── */
    .rounded-xl.px-4.py-3 {
      padding: 10px 14px;
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 12px;
      page-break-inside: avoid;
    }

    .bg-primary\\/10.text-foreground {
      background: #eef2f7 !important;
      border-right: 3px solid #1e3a5f;
    }

    .bg-muted.text-foreground {
      background: #f8f6f0 !important;
      border-right: 3px solid #c8a96e;
    }

    .text-xs.font-bold {
      font-size: 11px;
      font-weight: 700;
      color: #64748b !important;
      margin-bottom: 3px;
    }

    .whitespace-pre-wrap {
      white-space: pre-wrap;
      line-height: 1.5;
    }

    /* ── Footer area ── */
    .border-t.border-border {
      border-top: 1.5px solid #e2e0d8;
      padding-top: 10px;
      margin-top: 16px;
    }

    /* ── Considerations ── */
    .space-y-1\\.5 > div {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 0;
      border-bottom: 1px dotted #e2e0d8;
    }

    .space-y-1\\.5 > div:last-child {
      border-bottom: none;
    }

    /* ── Footer branding ── */
    .footer-brand {
      text-align: center;
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1.5px solid #1e3a5f;
      font-size: 11px;
      color: #94a3b8;
    }

    .footer-brand strong {
      color: #1e3a5f;
      font-weight: 700;
    }

    /* ── Print specifics ── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-frame { border-color: #1e3a5f; }
    }
  </style>
</head>
<body>
  <div class="page-frame">
    <div class="header">
      <h1>פרופיל אישי – ${username}</h1>
      <div class="date">${date}</div>
      <div class="subtitle">✦ מפת חוזקות וכיוון מקצועי ✦</div>
    </div>
    ${bodyContent}
    <div class="footer-brand">
      נוצר באמצעות <strong>Sageify</strong> 🦉 — המסע החכם שלך לקריירה
    </div>
  </div>
</body>
</html>`;
}
