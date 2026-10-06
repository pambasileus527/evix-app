import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "ログイン" };

export default function Page() {
  return (
    <div className="container section">
      <AuthForm mode="login" />
    </div>
  );
}
