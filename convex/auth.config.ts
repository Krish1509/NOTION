// Clerk Authentication Configuration
// This tells Convex to accept and verify Clerk JWTs

export default {
  providers: [
    {
      // Your Clerk domain
      domain: "https://polished-clam-96.clerk.accounts.dev",
      // Application ID that matches the JWT template
      applicationID: "convex",
    },
  ],
};

