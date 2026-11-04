import { AuthProvider } from "../../features/admin/AuthProvider.jsx";
import AdminGuard from "../../features/admin/AdminGuard.jsx";

/**
 * Every /admin/* page requires a signed-in staff user.
 * Mock: the guard runs in the browser. Backend: ALSO enforce in Next.js
 * middleware + every admin API route (see BACKEND.md).
 */
export const metadata = {
  title: "Studio · The Envelope",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
