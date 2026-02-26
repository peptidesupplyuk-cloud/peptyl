import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Checks sessionStorage for pending onboarding answers and saves them
 * to the user's profile. Works for both email signup and Google OAuth.
 * Runs once per session when the user is authenticated.
 */
export function useSaveOnboarding() {
  const { user } = useAuth();
  const attempted = useRef(false);

  useEffect(() => {
    if (!user || attempted.current) return;

    const raw = sessionStorage.getItem("onboarding_answers");
    if (!raw) return;

    attempted.current = true;

    let answers: Record<string, string>;
    try {
      answers = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem("onboarding_answers");
      return;
    }

    const updates: Record<string, string | null> = {};
    if (answers.first_name) updates.first_name = answers.first_name;
    if (answers.last_name) updates.last_name = answers.last_name;
    if (answers.goal) updates.research_goal = answers.goal;
    if (answers.experience) updates.experience_level = answers.experience;
    if (answers.compounds) updates.current_compounds = answers.compounds;
    if (answers.biomarkers) updates.biomarker_availability = answers.biomarkers;
    if (answers.risk) updates.risk_tolerance = answers.risk;
    if (answers.country) updates.country = answers.country;

    if (Object.keys(updates).length === 0) {
      sessionStorage.removeItem("onboarding_answers");
      return;
    }

    supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .then(({ error }) => {
        if (!error) {
          sessionStorage.removeItem("onboarding_answers");
          console.log("[onboarding] Profile updated with onboarding data");
        } else {
          console.error("[onboarding] Failed to save onboarding data:", error.message);
          // Allow retry on next mount
          attempted.current = false;
        }
      });
  }, [user]);
}
