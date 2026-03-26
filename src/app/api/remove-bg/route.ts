import { NextResponse } from "next/server";

// Default API key - 用户可以替换为自己的 key
// 或者在部署时设置环境变量 REMOVE_BG_API_KEY
const DEFAULT_API_KEY = process.env.REMOVE_BG_API_KEY || "";

export async function POST(request: Request) {
  try {
    const { image, apiKey } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Use provided API key or fallback to default
    const apiKeyToUse = apiKey || DEFAULT_API_KEY;
    
    if (!apiKeyToUse) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Call remove.bg API
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Api-Key": apiKeyToUse,
      },
      body: new URLSearchParams({
        image_base64: image,
        size: "auto",
        format: "png",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("remove.bg API error:", errorText);
      return NextResponse.json(
        { error: "Failed to remove background" },
        { status: 500 }
      );
    }

    // Convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    return NextResponse.json({
      result: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
