import { defineTool } from "@lovable.dev/mcp-js";

const TRACKS = [
  {
    id: "pt",
    name: "פיזיותרפיה",
    path: "/healthcare-sim/pt",
    description: "טפל במטופלים עם כאבי גב/כתף/ברך ברצף הנכון של חימום, חיזוק וארגונומיה.",
  },
  {
    id: "nutrition",
    name: "תזונה קלינית",
    path: "/healthcare-sim/nutrition",
    description: "בנה תוכניות טיפול תזונתי לסוכרת, עייפות וכולסטרול.",
  },
  {
    id: "nursing-er",
    name: "סיעוד — משמרת מיון",
    path: "/nursing-er",
    description: "משמרת מיון של 90 שניות: בדוק סימנים חיוניים, טפל, ואל תשכח לתעד ולשחרר.",
  },
];

export default defineTool({
  name: "list_healthcare_tracks",
  title: "List healthcare simulator tracks",
  description: "List the healthcare career simulator tracks in the Sageify app (for young audiences exploring health degrees).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(TRACKS, null, 2) }],
    structuredContent: { tracks: TRACKS },
  }),
});
