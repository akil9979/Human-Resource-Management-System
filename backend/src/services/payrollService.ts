export interface SalaryInput {
  monthlySalary: number;
  basicPercentage: number;
  hraPercentage: number;
  allowancePercentage: number;
  bonusPercentage: number;
  pfPercentage: number;
  professionalTax: number;
}

export interface SalaryOutput {
  basic: number;
  hra: number;
  allowance: number;
  bonus: number;
  grossSalary: number;
  pf: number;
  tax: number;
  netSalary: number;
}

/**
 * Calculates earnings components and deduction breakups based on base monthly salary and percentages.
 * Throws an error if earnings percentages do not total exactly 100%.
 */
export const calculateSalary = (input: SalaryInput): SalaryOutput => {
  const {
    monthlySalary,
    basicPercentage,
    hraPercentage,
    allowancePercentage,
    bonusPercentage,
    pfPercentage,
    professionalTax,
  } = input;

  // Validate percentage totals (earnings breakdown must sum to exactly 100%)
  const totalPercent = Math.round((basicPercentage + hraPercentage + allowancePercentage + bonusPercentage) * 100) / 100;
  if (totalPercent !== 100) {
    throw new Error(`Earnings percentage breakdown must sum up to exactly 100%. Currently: ${totalPercent}%`);
  }

  // Calculate earnings components
  const basic = monthlySalary * (basicPercentage / 100);
  const hra = monthlySalary * (hraPercentage / 100);
  const allowance = monthlySalary * (allowancePercentage / 100);
  const bonus = monthlySalary * (bonusPercentage / 100);
  const grossSalary = basic + hra + allowance + bonus;

  // Calculate deductions
  const pf = basic * (pfPercentage / 100);
  const tax = professionalTax;

  const totalDeductions = pf + tax;
  const netSalary = grossSalary - totalDeductions;

  // Round values to 2 decimal places
  const round2 = (num: number) => Math.round(num * 100) / 100;

  return {
    basic: round2(basic),
    hra: round2(hra),
    allowance: round2(allowance),
    bonus: round2(bonus),
    grossSalary: round2(grossSalary),
    pf: round2(pf),
    tax: round2(tax),
    netSalary: round2(Math.max(0, netSalary)),
  };
};

export default calculateSalary;
