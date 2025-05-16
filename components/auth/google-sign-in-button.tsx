"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { FcGoogle } from "react-icons/fc";

export function GoogleSignInButton() {
  const supabase = createClient();

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      onClick={signInWithGoogle}
    >
      <FcGoogle className="h-5 w-5 mr-2" />
      Continuar con Google
    </Button>
  );
} 