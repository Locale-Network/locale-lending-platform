import 'server-only';

import prisma from '@prisma/index';
import { LoanApplication } from '@prisma/client';

// needed to reference loan application id in reclaim proof
export const initialiseLoanApplication = async (chainAccountAddress: string): Promise<LoanApplication> => {
  const result = await prisma.loanApplication.create({
    data: {
      chainAccountAddress,
      businessLegalName: '',
      businessAddress: '',
      businessState: '',
      businessCity: '',
      businessZipCode: '',
      ein: '',
      businessFoundedYear: 0,
      businessLegalStructure: '',
      businessWebsite: '',
      businessPrimaryIndustry: '',
      businessDescription: '',
    },
  });
  return result;
};
