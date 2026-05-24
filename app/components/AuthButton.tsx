"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export default function AuthButton() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <SignInButton mode="modal">
      <button className="text-xs font-semibold bg-lime-600 hover:bg-lime-700 text-white px-3 py-1.5 rounded-lg transition-colors">
        Sign In
      </button>
    </SignInButton>
  );
}
