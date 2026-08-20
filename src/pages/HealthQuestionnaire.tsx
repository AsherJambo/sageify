import { useEffect } from "react";
import QuestionnaireByToken from "./QuestionnaireByToken";

/**
 * The full Sageify journey (same tokens, same admin data) tuned for the
 * healthcare-professions track: /#/health/q/:token
 */
export default function HealthQuestionnaire() {
  useEffect(() => {
    document.title = "SAGEIFY בריאות | מסע הגילוי שלך";
  }, []);

  return (
    <QuestionnaireByToken
      domain="health"
      partnerOrg={{
        org_name: "SAGEIFY בריאות",
        logo_url: null,
        custom_welcome_message:
          "ברוכים הבאים למסלול מקצועות הבריאות. נגלה יחד מה מתאים לך — סיעוד, פיזיותרפיה, תזונה קלינית ועוד.",
      }}
    />
  );
}
