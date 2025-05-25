import { Headers } from '@nestjs/common';

export const PayloadCompanyId = 'payload-company-id';
export const PayloadRole = 'payload-role';
export const PayloadUserId = 'payload-user-id';

export const PayloadCompany = () => Headers(PayloadCompanyId);
export const PayloadUser = () => Headers(PayloadUserId);
