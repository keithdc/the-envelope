"use client";

import { useRouter, useParams } from "next/navigation";
import BuilderApp from "../../../features/builder/BuilderApp.jsx";

/** /admin/[id] — the visual builder for one document. */
export default function BuilderPage() {
  const router = useRouter();
  const { id } = useParams();
  return (
    <BuilderApp key={id} docId={id} onBack={() => router.push("/admin")} />
  );
}
