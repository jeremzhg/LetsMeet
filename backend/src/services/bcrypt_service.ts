import * as bcrypt from 'bcrypt'

const saltRounds = 12;

async function hash(plainText: string): Promise<string> {
  const result = await bcrypt.hash(plainText, saltRounds)
  return result
}

async function compare(plainText: string, hash: string): Promise<boolean> {
  const ok = await bcrypt.compare(plainText, hash)
  return ok
}