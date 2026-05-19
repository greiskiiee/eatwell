export function isMongoObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}
