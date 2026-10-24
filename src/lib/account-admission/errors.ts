export class AccountAdmissionError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AccountAdmissionError';
    this.status = status;
    this.code = code;
  }
}
