import { vi } from "vitest";

// A fake Supabase client for tests. Nothing here talks to a real database.
// Each option sets up one part of the fake answer.
export function fakeSupabase(options: {
  userId?: string | null;
  isAdmin?: boolean;
  aal?: "aal1" | "aal2";
  signInError?: boolean;
  factors?: { id: string; factor_type: string; status: string }[];
  verifyError?: boolean;
}) {
  const userId = options.userId ?? null;
  const user = userId ? { id: userId, email: "test@example.com" } : null;

  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.isAdmin ? { id: userId } : null,
    error: null,
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));

  return {
    from: vi.fn(() => ({ select })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: user ? null : { code: "no_user" } }),
      signInWithPassword: vi.fn().mockResolvedValue(
        options.signInError
          ? { data: { user: null }, error: { code: "invalid_credentials" } }
          : { data: { user: { id: userId ?? "user-1", email: "test@example.com" } }, error: null }
      ),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      mfa: {
        getAuthenticatorAssuranceLevel: vi
          .fn()
          .mockResolvedValue({ data: { currentLevel: options.aal ?? "aal1" }, error: null }),
        listFactors: vi.fn().mockResolvedValue({ data: { all: options.factors ?? [] }, error: null }),
        challengeAndVerify: vi
          .fn()
          .mockResolvedValue({ error: options.verifyError ? { code: "invalid_code" } : null }),
        enroll: vi.fn(),
        unenroll: vi.fn(),
      },
    },
  };
}

// next/navigation's redirect() stops the code by throwing. The fake does the same,
// so tests can check where it was sending the person.
export class RedirectError extends Error {
  constructor(public readonly to: string) {
    super(`redirect to ${to}`);
  }
}

export function fakeRedirect(to: string): never {
  throw new RedirectError(to);
}
