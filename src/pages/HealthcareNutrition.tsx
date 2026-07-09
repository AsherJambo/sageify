import TrackGame from "@/components/healthcareSim/TrackGame";
import { NUTRITION_TRACK } from "@/components/healthcareSim/tracks";

export default function HealthcareNutrition() {
  return <TrackGame config={NUTRITION_TRACK} />;
}
