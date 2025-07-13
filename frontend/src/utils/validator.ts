export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const hasUpperCase = (password: string) => /[A-Z]/.test(password);
export const hasLowerCase = (password: string) => /[a-z]/.test(password);
export const hasNumber = (password: string) => /[0-9]/.test(password);
// export const hasSpecialChar = (password: string) => /[^A-Za-z0-9]/.test(password);

export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    hasUpperCase(password) &&
    hasLowerCase(password) &&
    hasNumber(password)
  );
};