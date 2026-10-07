import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markEmailAsSpam, moveEmailToTrash, markEmailAsRead } from "@/lib/gmail";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (!session || !accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, messageId } = await req.json();
  if (!messageId || !action) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    if (action === "spam") await markEmailAsSpam(accessToken, messageId);
    else if (action === "trash") await moveEmailToTrash(accessToken, messageId);
    else if (action === "read") await markEmailAsRead(accessToken, messageId);
    else return NextResponse.json({ error: "Unknown action" }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Action error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
