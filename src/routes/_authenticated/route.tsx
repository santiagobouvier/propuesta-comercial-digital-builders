import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { PortalHeader } from "@/components/portal-header";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { user: data.user };
  },
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <div className="min-h-screen bg-background">
      <PortalHeader />
      <Outlet />
    </div>
  );
}
