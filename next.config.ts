import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ポートフォリオ用デモ：架空の相場が検索結果に出ないよう、全ページに noindex を付ける
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // ESLint は未導入のため、ビルド時のチェックを省略する
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
