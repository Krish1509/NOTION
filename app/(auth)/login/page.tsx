/**
 * Login Page
 * 
 * Single login page for the entire application.
 * Username + password authentication only.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  // If user is already authenticated, redirect to dashboard
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}

