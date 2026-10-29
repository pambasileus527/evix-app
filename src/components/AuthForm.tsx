"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({
  mode,
  next = "/mycar",
  notice: guide,
}: {
  mode: "login" | "signup";
  next?: string;
  notice?: string;
}) {
  const uid = useId();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (isSignup && password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    if (isSignup) {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (err) {
        setError("登録できませんでした。入力内容を確認するか、別のメールアドレスをお試しください");
        return;
      }
      if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setNotice("確認メールを送りました。メール内のリンクを開いてから、ログインしてください。");
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) {
        setError("メールアドレスかパスワードが違います");
        return;
      }
      router.push(next);
      router.refresh();
    }
  }

  return (
    <form className="card auth-card" onSubmit={submit} aria-labelledby={`${uid}-title`}>
      <h1 id={`${uid}-title`} style={{ fontSize: 24 }}>
        {isSignup ? "無料登録" : "ログイン"}
      </h1>
      <div className="field">
        <label htmlFor={`${uid}-email`}>メールアドレス</label>
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${uid}-pw`}>パスワード{isSignup ? "（8文字以上）" : ""}</label>
        <input
          id={`${uid}-pw`}
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={isSignup ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {guide && (
        <p role="note" className="estimate-result">
          {guide}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="estimate-result">
          {notice}
        </p>
      )}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "送信中…" : isSignup ? "登録する" : "ログイン"}
      </button>
      {isSignup && (
        <p className="fine">
          デモのため、登録情報はこのサイトの動作確認だけに使います。実際に使っているメールアドレスやパスワードの使い回しは避けてください。
        </p>
      )}
      <p className="fine">
        {isSignup ? (
          <>
            登録済みの方は <Link href="/login">ログイン</Link>
          </>
        ) : (
          <>
            はじめての方は <Link href="/signup">無料登録</Link>
          </>
        )}
      </p>
    </form>
  );
}
