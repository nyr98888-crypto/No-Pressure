import { NextResponse } from "next/server";
import { cookieOptions, ensurePublicSession, SESSION_COOKIE } from "@/lib/session";
import { paywallDefaults } from "@/lib/paywall";

function applyCookie(res: NextResponse, token?: string) {
  if (token) {
    res.cookies.set(SESSION_COOKIE, token, cookieOptions());
  }
  return res;
}

/**
 * Session bootstrap — always returns quickly with safe defaults.
 * Never used as a gate for rendering the main UI.
 */
export async function GET() {
  try {
    const { body, setCookie } = await ensurePublicSession();
    return applyCookie(NextResponse.json(body), setCookie);
  } catch {
    const d = paywallDefaults();
    return NextResponse.json({
      ok: true,
      paywallEnabled: d.paywallEnabled,
      testMode: d.testMode,
      isUnlocked: d.isUnlocked,
      sessionId: "",
      vipCode: null,
      checkoutUrl: "",
      dareCount: 0,
      freeDaresRemaining: 3,
    });
  }
}

export async function POST() {
  // Re-mint / refresh cookie — same as GET
  return GET();
}
