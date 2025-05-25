import { TokenPayload } from 'src/token/entities/token-payload.entity';

export class VerifyTokenResponse {
  public readonly userId: string;
  public readonly role: string;
  public readonly companyId: string;

  constructor(payload: TokenPayload) {
    this.userId = payload.sub;
    this.role = payload.role;
    this.companyId = payload.companyId;
  }
}
