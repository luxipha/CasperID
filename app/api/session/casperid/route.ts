import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wallet = body.wallet as string | undefined;
    const cnsName = body.cnsName as string | undefined;
    const verified = Boolean(body.verified);
    const tier = body.tier as string | undefined;

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("casperid_wallet", wallet, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    if (cnsName) {
      res.cookies.set("casperid_cns", cnsName, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    res.headers.set("x-casperid-verified", verified ? "true" : "false");
    if (tier) res.headers.set("x-casperid-tier", tier);
    return res;
  } catch (error) {
    console.error("casperid session error", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
