import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// 👉 Decode signed_request từ Facebook
function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split(".");

  const sig = Buffer.from(encodedSig, "base64");
  const data = JSON.parse(
    Buffer.from(payload, "base64").toString("utf-8")
  );

  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error("Invalid signature");
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signed_request } = body;

    if (!signed_request) {
      return NextResponse.json(
        { error: "Missing signed_request" },
        { status: 400 }
      );
    }

    const data = parseSignedRequest(
      signed_request,
      process.env.FACEBOOK_APP_SECRET!
    );

    const userId = data.user_id;

    // 🔥 TODO: XÓA USER TRONG DB
    console.log("Delete user:", userId);

    // ví dụ:
    // await prisma.user.delete({ where: { facebookId: userId } });

    const confirmationCode = crypto.randomBytes(10).toString("hex");

    return NextResponse.json({
      url: `https://yourdomain.com/delete-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}