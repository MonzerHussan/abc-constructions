"use client";

import { useSmartNavigation } from "./useSmartNavigation";

/**
 * SmartRouter
 *
 * Mount once inside the app root (after AuthProvider) to enable automatic
 * redirects based on authentication, onboarding, and role.
 *
 * Example:
 *   <AuthProvider>
 *     <Providers>
 *       <SmartRouter />
 *       {children}
 *     </Providers>
 *   </AuthProvider>
 */
export default function SmartRouter() {
  useSmartNavigation();
  return null;
}
