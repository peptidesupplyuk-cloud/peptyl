import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const WhoopCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setStatus("error");
      setErrorMsg("Missing authorization code from WHOOP.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("whoop-oauth-callback", {
          body: { code, state },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setStatus("success");
        // Redirect to dashboard after brief success message
        setTimeout(() => navigate("/dashboard?tab=overview&whoop=connected"), 2000);
      } catch (err: any) {
        console.error("WHOOP callback error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Failed to connect WHOOP.");
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Connecting WHOOP…</h1>
            <p className="text-muted-foreground">Exchanging credentials securely.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">WHOOP Connected!</h1>
            <p className="text-muted-foreground">
              Your data will sync overnight. We'll notify you when it's ready.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Connection Failed</h1>
            <p className="text-muted-foreground">{errorMsg}</p>
            <button
              onClick={() => navigate("/dashboard?tab=overview")}
              className="mt-4 text-primary underline"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WhoopCallback;
