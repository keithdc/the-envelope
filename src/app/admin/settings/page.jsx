"use client";

import AdminShell from "../../../features/admin/AdminShell.jsx";
import SettingsPage from "../../../features/admin/SettingsPage.jsx";

/** /admin/settings — profile, password, workspace. */
export default function Page() {
  return (
    <AdminShell>
      <SettingsPage />
    </AdminShell>
  );
}
