/**
 * Root Page
 * 
 * Redirects to dashboard (which will then redirect based on role).
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function RootPage() {
  const { userId } = await auth();

  if (userId) {
    // User is authenticated, redirect to dashboard
    redirect("/dashboard");
  } else {
    // User is not authenticated, redirect to login
    redirect("/login");
  }
}
