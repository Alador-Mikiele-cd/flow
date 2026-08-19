export { auth as proxy } from "@/auth";

export const config = {
  // Protect everything except the login page, auth API routes, and static assets.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
