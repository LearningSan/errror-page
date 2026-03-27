import { NextRequest, NextResponse } from "next/server";
import { GoogleLogin } from "@/app/helper/authenHelper";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ message: "No code" }, { status: 400 });
  }

let result;
  try {
    result = await GoogleLogin(code);
    console.log("GoogleLogin result:", result);
  } catch (err) {
    console.error("GoogleLogin failed:", err);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
      const { accessToken, refreshToken,user } = result;

  
 const response = NextResponse.json({
    user
  });

     response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: false, // nên true nếu HTTPS
    sameSite: "strict",
    maxAge: 60 * 60 // 1 giờ
  });
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 
  });

  return response;
}