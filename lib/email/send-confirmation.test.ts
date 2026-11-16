import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendConfirmationEmail } from "./send-confirmation";

// Fake data only.
const input = { to: "test@example.com", firstName: "Test", emailOptIn: false };

function resendSays(status: number) {
  const fetchMock = vi.fn().mockImplementation(async () => new Response("{}", { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

let errorLog: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "test-key");
  vi.stubEnv("EMAIL_FROM", "Test Company <hello@example.com>");
  vi.stubEnv("SITE_URL", "https://example.com");
  errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// Nothing written to the log may contain the person's address or name.
function expectNoPersonalDataLogged() {
  const logged = JSON.stringify(errorLog.mock.calls);
  expect(logged).not.toContain("test@example.com");
  expect(logged).not.toContain("Test");
}

describe("sendConfirmationEmail", () => {
  it("sends one email through Resend and reports success", async () => {
    const fetchMock = resendSays(200);
    expect(await sendConfirmationEmail(input)).toBe(true);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(request.headers.Authorization).toBe("Bearer test-key");
    const body = JSON.parse(request.body);
    expect(body.to).toEqual(["test@example.com"]);
    expect(body.from).toBe("Test Company <hello@example.com>");
    expect(body.text).toContain("https://example.com/signup/privacy");
  });

  it("reports failure when Resend refuses the email", async () => {
    resendSays(422);
    expect(await sendConfirmationEmail(input)).toBe(false);
    expectNoPersonalDataLogged();
  });

  it("reports failure when Resend cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await sendConfirmationEmail(input)).toBe(false);
    expectNoPersonalDataLogged();
  });

  it("sends nothing when a setting is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const fetchMock = resendSays(200);
    expect(await sendConfirmationEmail(input)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expectNoPersonalDataLogged();
  });
});
