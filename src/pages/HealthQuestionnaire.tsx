import { useEffect } from "react";
import QuestionnaireByToken from "./QuestionnaireByToken";

/**
 * The full Sageify journey (same tokens, same games, same admin data) rendered
 * in the healthcare visual identity: /#/health/q/:token
 *
 * The `theme-health` class remaps every semantic design token (background,
 * primary, accent, shadows, legacy tokens) onto the medical brand palette —
 * teal #26af95 / navy #000049 / blue #005293 / yellow #eaff18 — so all shared
 * journey components inherit the health design language automatically.
 */
export default function HealthQuestionnaire() {
  useEffect(() => {
    document.title = "SAGEIFY בריאות | מסע הגילוי שלך";
  }, []);

  return (
    <div className="theme-health relative min-h-dvh bg-background text-foreground">
      {/* Brand diagonal stripe signature, subtle behind the journey */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-40 z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, hsl(var(--med-teal)) 0 14px, transparent 14px 46px)",
        }}
        aria-hidden
      />
      <div className="relative z-10">
        <QuestionnaireByToken
          domain="health"
          partnerOrg={{
            org_name: "SAGEIFY בריאות",
            logo_url: null,
            custom_welcome_message:
              "ברוכים הבאים למסלול מקצועות הבריאות. נגלה יחד מה מתאים לך — סיעוד, פיזיותרפיה, תזונה קלינית ועוד.",
          }}
        />
      </div>
    </div>
  );
}
