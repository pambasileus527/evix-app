import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "ログイン" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/mycar";
  // マイカーなどログイン必須のページから来たときだけ案内を出す
  const notice = next ? "このページを見るにはログインが必要です。" : undefined;

  return (
    <div className="container section">
      <AuthForm mode="login" next={safeNext} notice={notice} />
    </div>
  );
}
