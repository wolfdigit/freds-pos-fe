/** Blank or whitespace names are shown as the account email. */
export function displayAccountName(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  const trimmedName = (name ?? '').trim();
  if (trimmedName) return trimmedName;
  return (email ?? '').trim();
}
