export function calcMonthly(price, deposit, termMonths, annualRate) {
  const principal = price - deposit;
  if (principal <= 0) return { monthly: 0, totalPayment: 0, totalInterest: 0 };

  const r = annualRate / 100 / 12;
  if (r === 0) {
    const monthly = principal / termMonths;
    return { monthly, totalPayment: principal, totalInterest: 0 };
  }

  const monthly = (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  const totalPayment = monthly * termMonths;
  const totalInterest = totalPayment - principal;

  return { monthly, totalPayment, totalInterest };
}
