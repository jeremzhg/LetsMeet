import jwt from "jsonwebtoken"

const jwtSecret = process.env.JWT_SECRET || 'blablabla1234saiwqjodnck';
async function generateJWT(payload: { id: string; email: string; }): Promise<string> {
    const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' })
    return jwtToken
}

async function verifyJWT(token: string): Promise<{ id: string; email: string; }> {
  try {
    const payload = jwt.verify(token, jwtSecret);

    if (typeof payload === 'object' && 'id' in payload && 'email' in payload) {
        return payload as { id: string, email: string };
    }
    throw new Error('invalid token payload');

  } catch (error) {
    throw new Error('invalid or expired token.');
  }
}
