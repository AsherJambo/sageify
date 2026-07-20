import { defineMcp } from "@lovable.dev/mcp-js";
import listAssessments from "./tools/list-assessments";
import listHealthcareTracks from "./tools/list-healthcare-tracks";
import getAppInfo from "./tools/get-app-info";

export default defineMcp({
  name: "sageify-mcp",
  title: "Sageify MCP",
  version: "0.1.0",
  instructions:
    "Public read-only tools that describe the Sageify career-discovery app: available assessments, healthcare simulator tracks, and general app info. No user or session data is exposed.",
  tools: [listAssessments, listHealthcareTracks, getAppInfo],
});
