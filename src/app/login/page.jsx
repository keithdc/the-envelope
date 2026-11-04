import { Suspense } from "react";
import LoginPage from "../../features/admin/LoginPage.jsx";

export const metadata = {
  title: "Sign in · The Envelope",
  robots: { index: false, follow: false },
};

// LoginPage reads ?next= via useSearchParams, which Next 15 requires to sit
// inside a Suspense boundary on statically rendered pages.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
