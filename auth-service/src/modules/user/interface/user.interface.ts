export interface IUserBaseModel {
  create(): number;
}

export interface IPasswordReset {
  firstName: string;
  lastName: string;
  email: string;
  resetLink: string;
  token: string;
}

export interface IVerifyEmail {
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  verificationLink: string;
}

export interface PasswordResetPayload {
  'email.password-reset': IPasswordReset;
}

export interface VerifyEmailPayload {
  'email.email-verify': IVerifyEmail;
}
