import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "無料登録" };

export default function Page() {
  return (
    <div className="container section">
      <AuthForm mode="signup" next="/mycar" />
    </div>
  );
}
