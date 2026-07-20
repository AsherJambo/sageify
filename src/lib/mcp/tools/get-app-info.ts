import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_app_info",
  title: "About Sageify",
  description: "Get a short public description of the Sageify app: purpose, audience, and main journey.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Sageify",
      tagline: "ינשוף חכם. כיוון אמיתי.",
      audience:
        "בוגרים בגיל 60-80 המחפשים כיוון תעסוקתי משמעותי לפרק החיים הבא, ולצידם סימולטור בריאות לקהל צעיר השוקל תואר במקצועות הבריאות.",
      mentor: "סגי — ינשוף מנטור מלווה בשיחה אישית ובניתוח פסיכולוגי.",
      journey:
        "8 שאלונים חווייתיים (הולנד, VIA, שיין, ועוד) → סיכום פסיכולוגי → שיחה עם סגי → תוכנית התפתחות אישית → אפשרות לפגישת ייעוץ אנושי.",
      urls: {
        home: "https://sageify.life",
        demo: "https://sageify.life/#/demo-full",
        healthcareSim: "https://sageify.life/#/healthcare-sim",
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
