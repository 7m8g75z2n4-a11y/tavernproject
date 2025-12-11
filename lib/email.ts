export async function sendWelcomeEmail(to: string, name?: string) {
  console.log(`[welcome-email] to=${to} name=${name ?? ""}`);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password/${token}`;
  console.log(`[password-reset-email] to=${to} link=${resetLink}`);
}
