"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
    return (
        <AuthenticateWithRedirectCallback
            signInUrl="/login"
            signUpUrl="/login"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
        />
    );
}