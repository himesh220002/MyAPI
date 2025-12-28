//src/app/page.tsx

"use client";

import IndexPage from "@/components/IndexPage";
import AssetsPage from "@/components/AssetsPage";

export default function Home() {
  return (
    <div style={{ background: "#0b1625ff", minHeight: "100vh", padding: "20px 0" }}>
      <IndexPage />

      <AssetsPage />
    </div>
  );
}
