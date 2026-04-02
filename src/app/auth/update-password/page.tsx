"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  useEffect(() => {
    const supabase = createClient();

    const createSession = async () => {
      await supabase.auth.exchangeCodeForSession(window.location.href);
    };

    createSession();
  }, []);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
