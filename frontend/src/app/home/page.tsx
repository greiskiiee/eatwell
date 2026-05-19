"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeFeed } from "@/components/HomeFeed";
import { useUser } from "@/context/UserContext";

export default function HomePage() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin");
    }
  }, [user?.role, router]);

  return <HomeFeed />;
}
