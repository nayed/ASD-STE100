// src/login.ts — Git marks the lines that conflict
export function validate(attempts: number) {
<<<<<<< HEAD
  const MAX_ATTEMPTS = 5;
=======
  const MAX_ATTEMPTS = 3;
>>>>>>> fix/login-error
  return attempts <= MAX_ATTEMPTS;
}
