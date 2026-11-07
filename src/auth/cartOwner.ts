let boundUserId: string | null = null;

export function setBoundCartUserId(userId: string | null): void {
  boundUserId = userId;
}

export function getBoundCartUserId(): string | null {
  return boundUserId;
}
