import { defineTool } from "@lovable.dev/mcp-js";

const ASSESSMENTS = [
  { id: "holland", name: "קוד הולנד", description: "העדפות תעסוקתיות לפי 6 טיפוסים (RIASEC)." },
  { id: "via", name: "VIA — חוזקות אופי", description: "24 חוזקות אופי מוכחות מחקרית." },
  { id: "schein", name: "עוגני קריירה של שיין", description: "8 עוגני מוטיבציה תעסוקתיים." },
  { id: "skills", name: "מיפוי כישורים", description: "כישורים שאני יודע/רוצה/מוקיר." },
  { id: "personality", name: "אבחון אישיות", description: "פרופיל אישיותי פסיכומטרי קצר." },
  { id: "thinking", name: "כישורי חשיבה", description: "בוחן חשיבה מטריציוני קצר." },
  { id: "motivation", name: "מוטיבציה ומוכנות", description: "מוכנות מנטלית ופרואקטיביות." },
  { id: "values", name: "ערכי עבודה", description: "מיפוי ערכים לתעסוקה משמעותית." },
];

export default defineTool({
  name: "list_assessments",
  title: "List assessments",
  description: "List the 8 self-discovery assessments available in the Sageify journey.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(ASSESSMENTS, null, 2) }],
    structuredContent: { assessments: ASSESSMENTS },
  }),
});
