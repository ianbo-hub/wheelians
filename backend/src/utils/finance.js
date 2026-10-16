// Standard amortising loan monthly payment.
// Mirrors the frontend finance calculator so quotes match exactly.
function monthlyPayment(principal, annualRatePct, termMonths) {
  const r = (annualRatePct / 100) / 12;
  if (r === 0) return Math.round(principal / termMonths);
  const factor = Math.pow(1 + r, termMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

function totalPayable(monthly, termMonths, deposit) {
  return Math.round(monthly * termMonths + deposit);
}

module.exports = { monthlyPayment, totalPayable };
