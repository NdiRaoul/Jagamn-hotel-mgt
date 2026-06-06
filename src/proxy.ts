import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ACTIVITY_COOKIE_NAME,
  isIdleExpired,
  parseLastActivity,
} from "@/lib/auth/session-constants";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: do not add logic between createServerClient
  // and getUser() or the session may not be refreshed correctly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect all /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect staff portals with role checks
  const staffPrefixes = [
    "/admin",
    "/reception",
    "/kitchen",
    "/storekeeper",
    "/superadmin",
  ];
  const isStaffRoute = staffPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isStaffRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/staff-login";
    redirectUrl.searchParams.set("redirect", pathname);

    if (!user) {
      return NextResponse.redirect(redirectUrl);
    }

    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("role,status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (staffError || !staff || staff.status !== "active") {
      return NextResponse.redirect(redirectUrl);
    }

    // Reject idle-expired staff sessions (defence in depth alongside
    // getStaffSession). An absent cookie = fresh login and is allowed.
    const lastActivity = parseLastActivity(
      request.cookies.get(ACTIVITY_COOKIE_NAME)?.value,
    );
    if (isIdleExpired(lastActivity)) {
      const timeoutUrl = request.nextUrl.clone();
      timeoutUrl.pathname = "/staff-login";
      timeoutUrl.search = "";
      timeoutUrl.searchParams.set("timeout", "1");
      return NextResponse.redirect(timeoutUrl);
    }

    // Role-based access per portal. The owner can access everything;
    // each other role is confined to its own portal (admins/managers also
    // oversee reception, kitchen and store). Order matters — most specific
    // prefix first.
    const portalFor = (role: string) =>
      role === "owner"
        ? "/superadmin"
        : role === "admin" || role === "manager"
          ? "/admin"
          : role === "kitchen"
            ? "/kitchen"
            : role === "storekeeper"
              ? "/storekeeper"
              : "/reception";

    const ACCESS: { prefix: string; roles: string[] }[] = [
      { prefix: "/superadmin", roles: ["owner"] },
      { prefix: "/storekeeper", roles: ["storekeeper", "admin", "manager", "owner"] },
      { prefix: "/admin", roles: ["admin", "manager", "owner"] },
      { prefix: "/kitchen", roles: ["kitchen", "admin", "manager", "owner"] },
      { prefix: "/reception", roles: ["reception", "admin", "manager", "owner"] },
    ];

    const rule = ACCESS.find((r) => pathname.startsWith(r.prefix));
    if (rule && !rule.roles.includes(staff.role)) {
      // Bounce a mismatched role to their own portal instead of the login page.
      const portalUrl = request.nextUrl.clone();
      portalUrl.search = "";
      portalUrl.pathname = portalFor(staff.role);
      return NextResponse.redirect(portalUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
