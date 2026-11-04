"use client";

import AdminShell from "../../../features/admin/AdminShell.jsx";
import UsersPage from "../../../features/admin/UsersPage.jsx";

/** /admin/users — team management (owner/admin). */
export default function Page() {
  return (
    <AdminShell>
      <UsersPage />
    </AdminShell>
  );
}
