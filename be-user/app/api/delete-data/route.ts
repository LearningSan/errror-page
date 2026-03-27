import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// 👉 Decode signed_request từ Facebook (an toàn hơn)
function parseSignedRequest(signedRequest: string, appSecret: string) {
  if (!signedRequest || !signedRequest.includes(".")) {
    throw new Error("Invalid signed_request format");
  }

  const [encodedSig, payload] = signedRequest.split(".");

  if (!encodedSig || !payload) {
    throw new Error("Invalid signed_request parts");
  }

  // base64url → base64
  const base64urlToBase64 = (str: string) =>
    str.replace(/-/g, "+").replace(/_/g, "/");

  const sig = Buffer.from(base64urlToBase64(encodedSig), "base64");
  const decodedPayload = Buffer.from(
    base64urlToBase64(payload),
    "base64"
  ).toString("utf-8");

  const data = JSON.parse(decodedPayload);

  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error("Invalid signature");
  }

  return data;
}

// 👉 GET để tránh 405 + test nhanh
export async function GET() {
  return NextResponse.json({
    message: "API delete-data is working. Use POST.",
  });
}

// 👉 POST chính
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const signed_request = body?.signed_request;

    // ❗ Check input
    if (!signed_request) {
      return NextResponse.json(
        { error: "Missing signed_request" },
        { status: 400 }
      );
    }

    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appSecret) {
      return NextResponse.json(
        { error: "Server config error: missing APP SECRET" },
        { status: 500 }
      );
    }

    let data;
    try {
      data = parseSignedRequest(signed_request, appSecret);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid signed_request" },
        { status: 400 }
      );
    }

    const userId = data.user_id;

    // 🔥 TODO: XÓA USER TRONG DB
    console.log("Delete user:", userId);

    const confirmationCode = crypto.randomBytes(10).toString("hex");

    return NextResponse.json({
      url: `https://errror-page.vercel.app/delete-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}