import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

    // Check role-based access for each portal
    if (pathname.startsWith("/superadmin") && staff.role !== "owner") {
      return NextResponse.redirect(redirectUrl);
    }

    if (
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/procurement") &&
      !["admin", "manager", "owner"].includes(staff.role)
    ) {
      return NextResponse.redirect(redirectUrl);
    }

    if (
      pathname.startsWith("/admin/procurement") &&
      !["admin", "manager", "storekeeper", "owner"].includes(staff.role)
    ) {
      return NextResponse.redirect(redirectUrl);
    }

    if (
      pathname.startsWith("/reception") &&
      !["reception", "admin", "manager", "owner"].includes(staff.role)
    ) {
      return NextResponse.redirect(redirectUrl);
    }

    if (
      pathname.startsWith("/kitchen") &&
      !["kitchen", "admin", "manager", "owner"].includes(staff.role)
    ) {
      return NextResponse.redirect(redirectUrl);
    }

    if (
      pathname.startsWith("/storekeeper") &&
      !["storekeeper", "admin", "manager", "owner"].includes(staff.role)
    ) {
      return NextResponse.redirect(redirectUrl);
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
