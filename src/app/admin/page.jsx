"use client";

import { useRouter } from "next/navigation";
import Gallery from "../../features/builder/Gallery.jsx";
import AdminShell from "../../features/admin/AdminShell.jsx";
import { useAuth } from "../../features/admin/AuthProvider.jsx";

/** /admin — the studio gallery (Templates / Projects). */
export default function AdminPage() {
  const router = useRouter();
  const { can } = useAuth();
  return (
    <AdminShell>
      <Gallery onOpen={(id) => router.push(`/admin/${id}`)} can={can} />
    </AdminShell>
  );
}
