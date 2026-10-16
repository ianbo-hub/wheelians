import { useState } from 'react';
import { fmtKES } from '../../utils/format';
import { calcMonthly } from '../../utils/finance';
import api from '../../utils/api';
import Modal from '../ui/Modal';

export default function FinanceCalc() {
  const [price, setPrice] = useState(10000000);
  const [deposit, setDeposit] = useState(2000000);
  const [term, setTerm] = useState(60);
  const [rate, setRate] = useState(14);
  const [showApply, setShowApply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { monthly, totalPayment, totalInterest } = calcMonthly(price, deposit, term, rate);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const fd = new FormData(e.target);
    try {
      await api('/api/finance/applications', {
        method: 'POST',
        body: {
          applicant_name: fd.get('name'),
          applicant_email: fd.get('email'),
          applicant_phone: fd.get('phone'),
          vehicle_price: price,
          deposit_kes: deposit,
          term_months: term,
          interest_rate: rate,
          employment: fd.get('employment') || null,
          monthly_income: parseInt(fd.get('monthly_income'), 10) || null,
        },
      });
      setFeedback({ type: 'success', msg: 'Application submitted! Our finance team will contact you shortly.' });
      e.target.reset();
      setTimeout(() => { setShowApply(false); setFeedback(null); }, 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section" id="finance">
      <div className="section-label reveal">FINANCE</div>
      <h2 className="section-title reveal">PAYMENT CALCULATOR</h2>

      <div className="calc-layout reveal">
        <div>
          <div className="calc-field">
            <label>
              <span>Vehicle Price</span>
              <span className="val">{fmtKES(price)}</span>
            </label>
            <input type="range" min={1000000} max={30000000} step={500000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>

          <div className="calc-field">
            <label>
              <span>Deposit</span>
              <span className="val">{fmtKES(deposit)}</span>
            </label>
            <input type="range" min={0} max={price * 0.8} step={100000} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
          </div>

          <div className="calc-field">
            <label>
              <span>Term</span>
              <span className="val">{term} months</span>
            </label>
            <input type="range" min={12} max={84} step={6} value={term} onChange={(e) => setTerm(Number(e.target.value))} />
          </div>

          <div className="calc-field">
            <label>
              <span>Interest Rate</span>
              <span className="val">{rate}%</span>
            </label>
            <input type="range" min={8} max={24} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </div>
        </div>

        <div className="calc-result">
          <div className="monthly">{fmtKES(Math.round(monthly))}</div>
          <div className="monthly-label">Estimated monthly payment</div>

          <div className="calc-breakdown">
            <div className="calc-row">
              <span>Vehicle Price</span>
              <span>{fmtKES(price)}</span>
            </div>
            <div className="calc-row">
              <span>Deposit</span>
              <span>– {fmtKES(deposit)}</span>
            </div>
            <div className="calc-row">
              <span>Loan Amount</span>
              <span>{fmtKES(price - deposit)}</span>
            </div>
            <div className="calc-row">
              <span>Total Interest</span>
              <span>{fmtKES(Math.round(totalInterest))}</span>
            </div>
            <div className="calc-row total">
              <span>Total Payment</span>
              <span>{fmtKES(Math.round(totalPayment))}</span>
            </div>
          </div>

          <button
            className="btn-submit"
            style={{ marginTop: 20, width: '100%' }}
            onClick={() => setShowApply(true)}
          >
            APPLY FOR FINANCING
          </button>
        </div>
      </div>

      {showApply && (
        <Modal
          title="Apply for Vehicle Financing"
          onClose={() => { setShowApply(false); setFeedback(null); }}
          footer={null}
        >
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(192,192,192,0.08)', borderRadius: 8, fontSize: 13 }}>
            <strong>Your quote:</strong> {fmtKES(Math.round(monthly))}/mo for {term} months
            <br />Vehicle: {fmtKES(price)} · Deposit: {fmtKES(deposit)} · Rate: {rate}%
          </div>
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" name="name" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" name="email" type="email" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" name="phone" type="tel" placeholder="+254 7XX XXX XXX" required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Employment Status</label>
                <select className="form-input" name="employment">
                  <option value="">Select…</option>
                  <option>Employed</option>
                  <option>Self-Employed</option>
                  <option>Business Owner</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Income (KES)</label>
                <input className="form-input" name="monthly_income" type="number" placeholder="e.g. 250000" />
              </div>
            </div>
            <button type="submit" className="btn-submit" style={{ width: '100%', marginTop: 12 }} disabled={submitting}>
              {submitting ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
            </button>
            {feedback && (
              <div className={`feedback ${feedback.type}`} style={{ marginTop: 12 }}>{feedback.msg}</div>
            )}
          </form>
        </Modal>
      )}
    </section>
  );
}
