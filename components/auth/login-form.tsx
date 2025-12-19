"use client";

/**
 * Login Form Component
 * 
 * Professional login form with username + password only.
 * No social login, no email login, no signup.
 */

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Sign in with username + password
      // Clerk's identifier can be username, email, or phone
      // Since we only use username, we pass it directly
      const result = await signIn.create({
        identifier: username.trim(),
        password,
        strategy: "password", // Explicitly use password strategy
      });

      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });
        
        // Redirect will be handled by middleware based on role
        router.push("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      
      // Extract error message
      let errorMessage = "Invalid username or password";
      
      if (err && typeof err === 'object') {
        if ('errors' in err && Array.isArray(err.errors) && err.errors.length > 0) {
          errorMessage = err.errors[0].message || errorMessage;
        } else if ('message' in err) {
          errorMessage = err.message as string;
        }
      }
      
      // More specific error messages
      if (errorMessage.toLowerCase().includes("couldn't find")) {
        errorMessage = "Account not found. Please verify your username or contact your administrator.";
      } else if (errorMessage.toLowerCase().includes("password")) {
        errorMessage = "Invalid password. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="text-3xl font-bold">NOTION</CardTitle>
        <CardDescription className="text-base">
          Enterprise CRM System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Contact your administrator for account access</p>
        </div>
      </CardContent>
    </Card>
  );
}

