"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
// 1. Import the browser client creator
import { createClient } from "@/lib/supabase/client";

export function Header() {
  // 2. Initialize the client
  const supabase = createClient();
  const [user, setUser] = useState<any>(null); // Use 'any' or import { User } from '@supabase/supabase-js'
  const router = useRouter();

  useEffect(() => {
    // 3. Get user directly from Supabase
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) setUser(user);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    // 4. Use supabase.auth.signOut() instead of a manual fetch if possible
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <User size={20} />
          {/* 5. Access email or metadata from the Supabase user object */}
          <span className="text-sm font-medium">{user?.email || "Admin"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </header>
  );
}
