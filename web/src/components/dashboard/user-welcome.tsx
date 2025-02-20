"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface UserInfo {
  username: string;
  roles: string[];
}

export function UserWelcome() {
  const router = useRouter();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user info from the backend
    fetch("http://localhost:8000/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user info");
        }
        return res.json();
      })
      .then((data) => {
        console.log("User info:", data);
        setUserInfo(data);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user information",
          variant: "destructive",
        });
        // If unauthorized, redirect to login
        if (error.message.includes("401")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      });
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({
      title: "Success",
      description: "You have been logged out.",
    });
    router.push("/login");
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Welcome, {userInfo.username}!</h1>
          <p className="text-lg text-muted-foreground">
            You have successfully logged in to the Casbin Demo application.
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Your Roles</h2>
        <div className="flex gap-2">
          {userInfo.roles?.map((role) => (
            <span
              key={role}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 