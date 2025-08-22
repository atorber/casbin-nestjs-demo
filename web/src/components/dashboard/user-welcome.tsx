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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("获取用户信息失败");
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
          title: "错误",
          description: "获取用户信息失败",
          variant: "destructive",
        });
        // If unauthorized, redirect to login
        if (error.message.includes("401")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      });
  }, [router, toast]);

  if (!userInfo) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">欢迎，{userInfo.username}！</h1>
          <p className="text-lg text-muted-foreground">
            您已成功登录到 Casbin 权限管理演示应用。
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">您的角色</h2>
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