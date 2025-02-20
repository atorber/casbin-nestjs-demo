import { Metadata } from "next";
import { UserWelcome } from "@/components/dashboard/user-welcome";

export const metadata: Metadata = {
  title: "Dashboard - Casbin Demo",
  description: "Dashboard page of the Casbin Demo application",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <UserWelcome />
      </div>
    </div>
  );
} 