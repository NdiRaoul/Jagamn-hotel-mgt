import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/staff-session";
import { getTransactions, RECEPTION_PAGE_SIZE } from "@/lib/data/reception";

const ALLOWED_ROLES = ["owner", "admin", "manager", "reception"];

// GET /api/reception/transactions?offset=&limit= — paginated "load more" feed
// for the Transactions timeline. First page is server-rendered.
export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.status !== "active" || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(
    100,
    Number(searchParams.get("limit")) || RECEPTION_PAGE_SIZE,
  );

  try {
    const transactions = await getTransactions({ limit, offset });
    return NextResponse.json({
      transactions,
      hasMore: transactions.length === limit,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
