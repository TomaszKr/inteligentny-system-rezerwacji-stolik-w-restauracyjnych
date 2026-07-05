export interface MailErrorClassification {
  /** HTTP/SMTP status code */
  code?: number | string;
  /** Whether the error is temporary and retry is appropriate */
  isTransient: boolean;
  /** Human-readable description */
  message: string;
}

export class TransientMailError extends Error implements MailErrorClassification {
  isTransient = true;
  code?: number | string;

  constructor(message: string, code?: number | string) {
    super(message);
    this.code = code;
    this.name = 'TransientMailError';
  }
}

export class PermanentMailError extends Error implements MailErrorClassification {
  isTransient = false;
  code?: number | string;

  constructor(message: string, code?: number | string) {
    super(message);
    this.code = code;
    this.name = 'PermanentMailError';
  }
}
