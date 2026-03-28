import * as bcrypt from 'bcrypt'

const saltRounds = 12;

async function hashPassword(plainText: string): Promise<string> {
  const result = await bcrypt.hash(plainText, saltRounds)
  return result
}

async function comparePassword(plainText: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  const ok = await bcrypt.compare(plainText, hash)
  return ok
}

export {hashPassword, comparePassword}