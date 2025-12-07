// TODO: wire this to your auth provider (Clerk/NextAuth/custom).
// Return the internal user ID that maps to User.id in Prisma.
export async function getCurrentUserId(_req?: unknown): Promise<string | null> {
  return null;
}
