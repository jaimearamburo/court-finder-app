export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidQ(q: string | null): boolean {
  return !!q && q.trim().length > 1;
}