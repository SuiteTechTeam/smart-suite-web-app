"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { FaGithub } from "react-icons/fa";

export function GitHubSignInButton() {
  const supabase = createClient();

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
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
      onClick={signInWithGitHub}
    >
      <FaGithub className="h-5 w-5 mr-2" />
      Continuar con GitHub
    </Button>
  );
} 