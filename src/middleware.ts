import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_READY, SUPABASE_URL } from "@/lib/supabase/env";

// ログインの有効期限を更新し、/mycar は未ログインなら /login へ送る。
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!SUPABASE_READY) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && path.startsWith("/mycar")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/mycar", request.url));
  }
  return response;
}

export const config = { matcher: ["/mycar/:path*", "/login", "/signup"] };
