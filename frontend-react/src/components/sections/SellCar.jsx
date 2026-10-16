import { useState } from 'react';
import api from '../../utils/api';

export default function SellCar() {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const fd = new FormData(e.target);
    const body = {
      make: fd.get('make'),
      model: fd.get('model'),
      year: parseInt(fd.get('year'), 10),
      km: parseInt(fd.get('km'), 10),
      condition: fd.get('condition'),
      owner_name: fd.get('name'),
      owner_phone: fd.get('phone'),
      owner_email: fd.get('email'),
      notes: fd.get('notes') || null,
    };

    try {
      await api('/api/sell-car', { method: 'POST', body });
      setFeedback({ type: 'success', msg: 'Submission received! Our team will contact you within 24 hours.' });
      e.target.reset();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section" id="sell">
      <div className="section-label reveal">SELL YOUR CAR</div>
      <h2 className="section-title reveal">GET A FAIR OFFER TODAY</h2>

      <div className="sell-steps reveal">
        {[
          { num: '1', title: 'Submit Details', desc: 'Tell us about your vehicle using the form below.' },
          { num: '2', title: 'Get Valued', desc: 'Our expert team reviews and values your car within 24 hours.' },
          { num: '3', title: 'Get Paid', desc: 'Accept our offer and receive payment — fast and hassle-free.' },
        ].map((s, i) => (
          <div key={i} className="sell-step">
            <div className="num">{s.num}</div>
            <h4>{s.title}</h4>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <form className="sell-form reveal" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Make</label>
            <input className="form-input" name="make" placeholder="e.g. Toyota" required />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input className="form-input" name="model" placeholder="e.g. Land Cruiser" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Year</label>
            <input className="form-input" name="year" type="number" placeholder="e.g. 2023" min="1990" max="2027" required />
          </div>
          <div className="form-group">
            <label>Kilometres</label>
            <input className="form-input" name="km" type="number" placeholder="e.g. 45000" min="0" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Condition</label>
            <select className="form-input" name="condition" required>
              <option value="">Select…</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Your Name</label>
            <input className="form-input" name="name" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input className="form-input" name="phone" type="tel" placeholder="+254 7XX XXX XXX" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" name="email" type="email" required />
          </div>
        </div>
        <div className="form-group">
          <label>Additional Notes</label>
          <textarea className="form-input" name="notes" placeholder="Service history, modifications, reason for selling…" />
        </div>
        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'SUBMITTING…' : 'SUBMIT FOR VALUATION'}
        </button>
        {feedback && (
          <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>
        )}
      </form>
    </section>
  );
}
