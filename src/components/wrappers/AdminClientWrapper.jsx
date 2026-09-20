"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserProvider } from "@/context";

const RESTRICTED_PATHS = ["/admin/users", "/admin/blotters"];

export default function AdminClientWrapper({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isRestrictedPath = RESTRICTED_PATHS.some((path) =>
    pathname?.startsWith(path)
  );
  const isForbidden = isRestrictedPath && user?.dashboardRole !== "ADMIN";

  useEffect(() => {
    if (isForbidden) router.replace("/admin");
  }, [isForbidden, router]);

  if (isForbidden) return null;

  return <UserProvider user={user}>{children}</UserProvider>;
}
