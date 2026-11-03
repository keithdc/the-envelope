"use client";

import { useRouter } from "next/navigation";
import Gallery from "../../features/builder/Gallery.jsx";

/** /admin — the studio gallery (Templates / Projects). */
export default function AdminPage() {
  const router = useRouter();
  return <Gallery onOpen={(id) => router.push(`/admin/${id}`)} />;
}
