"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SUPABASE_READY } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

// ヘッダー右端。ログイン状態に応じて「無料登録」と「ログアウト」を切り替える。
// 全ページを静的に保つため、サーバーではなくブラウザ側でログイン状態を確認する。
export default function AuthNav() {
  const router = useRouter();
  const [state, setState] = useState<"unknown" | "in" | "out">("unknown");

  useEffect(() => {
    if (!SUPABASE_READY) {
      setState("out");
      return;
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setState(data.session ? "in" : "out"));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState(session ? "in" : "out"));
    return () => data.subscription.unsubscribe();
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  // 確認が終わるまでは何も出さない（「無料登録」が一瞬見えるのを防ぐ）
  if (state === "unknown") return <span className="nav-slot" aria-hidden="true" />;
  if (state === "in") {
    return (
      <>
        <Link href="/mycar">マイカー</Link>
        <button type="button" className="nav-logout" onClick={logout}>
          ログアウト
        </button>
      </>
    );
  }
  return (
    <>
      <Link href="/login" className="nav-login">
        ログイン
      </Link>
      <Link href="/signup" className="nav-cta">
        無料登録
      </Link>
    </>
  );
}
