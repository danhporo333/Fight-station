import { argon2id, hash, verify } from 'argon2';

// Mật khẩu hash bằng argon2id (DATABASE.md: không lưu mật khẩu thô)
export function hashPassword(plain: string): Promise<string> {
  return hash(plain, { type: argon2id });
}

let dummyHash: Promise<string> | undefined;

/**
 * So mật khẩu với hash. Không có hash (username không tồn tại) thì vẫn verify với một hash giả,
 * để thời gian phản hồi không cho biết tài khoản có tồn tại hay không.
 */
export async function verifyPassword(passwordHash: string | null, plain: string): Promise<boolean> {
  if (passwordHash === null) {
    dummyHash ??= hashPassword('fight-station-dummy-password');
    await verify(await dummyHash, plain);
    return false;
  }
  try {
    return await verify(passwordHash, plain);
  } catch {
    // Hash hỏng hoặc sai định dạng: coi như sai mật khẩu
    return false;
  }
}
