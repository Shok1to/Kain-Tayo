import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-5xl leading-none">Admin sign in</h1>
      <p className="mt-2 text-ink">For administrators only.</p>
      <Suspense fallback={<p className="mt-6">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
