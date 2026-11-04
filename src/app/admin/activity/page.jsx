"use client";

import AdminShell from "../../../features/admin/AdminShell.jsx";
import ActivityPage from "../../../features/admin/ActivityPage.jsx";

/** /admin/activity — append-only activity log (owner/admin). */
export default function Page() {
  return (
    <AdminShell>
      <ActivityPage />
    </AdminShell>
  );
}
