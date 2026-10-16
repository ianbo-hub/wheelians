import { useState } from 'react';
import { fmtKES, placeholderImg } from '../../utils/format';
import api from '../../utils/api';
import Modal from '../ui/Modal';

export default function CarCard({ car }) {
  const imgSrc = car.images?.[0]?.url || car.img || placeholderImg(car);
  const [showTestDrive, setShowTestDrive] = useState(false);
  const [showEnquire, setShowEnquire] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleTestDrive = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const fd = new FormData(e.target);
    try {
      await api('/api/test-drives', {
        method: 'POST',
        body: {
          car_id: car.id,
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          preferred_date: fd.get('preferred_date'),
          notes: fd.get('notes') || null,
        },
      });
      setFeedback({ type: 'success', msg: 'Test drive booked! We\'ll confirm your appointment shortly.' });
      e.target.reset();
      setTimeout(() => { setShowTestDrive(false); setFeedback(null); }, 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnquire = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const fd = new FormData(e.target);
    try {
      await api('/api/enquiries', {
        method: 'POST',
        body: {
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone') || null,
          message: fd.get('message'),
          car_id: car.id,
          source: 'car_enquiry',
        },
      });
      setFeedback({ type: 'success', msg: 'Enquiry sent! Our team will get back to you.' });
      e.target.reset();
      setTimeout(() => { setShowEnquire(false); setFeedback(null); }, 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Tomorrow's date as min for date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="car-card">
      <div className="car-img">
        <img src={imgSrc} alt={`${car.make} ${car.model}`} loading="lazy" />
        {car.badge && <span className="car-badge">{car.badge}</span>}
      </div>
      <div className="car-body">
        <div className="car-name">
          {car.make} {car.model}
          <span>{car.year}</span>
        </div>

        <div className="car-specs">
          {car.power && <span className="car-spec">⚡ {car.power}</span>}
          {car.engine && <span className="car-spec">🔧 {car.engine}</span>}
          {car.km > 0 && <span className="car-spec">📏 {car.km.toLocaleString()} km</span>}
        </div>

        {car.colors && car.colors.length > 0 && (
          <div className="car-swatches">
            {car.colors.map((c, i) => (
              <div key={i} className="car-swatch" style={{ background: c }} />
            ))}
          </div>
        )}

        <div className="car-price">{fmtKES(car.price_kes || car.price)}</div>

        {car.rep && (
          <div className="car-rep">
            <div className="car-rep-avatar">
              {car.rep.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ color: 'var(--text)', fontWeight: 500 }}>{car.rep.name}</div>
              <div>{car.rep.tel || car.rep.phone}</div>
            </div>
          </div>
        )}

        <div className="car-actions">
          <button className="btn-card" onClick={() => setShowEnquire(true)}>ENQUIRE</button>
          <button className="btn-card primary" onClick={() => setShowTestDrive(true)}>TEST DRIVE</button>
        </div>
      </div>

      {/* Enquire Modal */}
      {showEnquire && (
        <Modal
          title={`Enquire — ${car.make} ${car.model}`}
          onClose={() => { setShowEnquire(false); setFeedback(null); }}
          footer={null}
        >
          <form onSubmit={handleEnquire}>
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
                <input className="form-input" name="phone" type="tel" placeholder="+254 7XX…" />
              </div>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="form-input" name="message" rows="3" required
                defaultValue={`I'm interested in the ${car.year} ${car.make} ${car.model}. Please send me more details.`}
              />
            </div>
            <button type="submit" className="btn-submit" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'SENDING…' : 'SEND ENQUIRY'}
            </button>
            {feedback && <div className={`feedback ${feedback.type}`} style={{ marginTop: 12 }}>{feedback.msg}</div>}
          </form>
        </Modal>
      )}

      {/* Test Drive Modal */}
      {showTestDrive && (
        <Modal
          title={`Book a Test Drive — ${car.make} ${car.model}`}
          onClose={() => { setShowTestDrive(false); setFeedback(null); }}
          footer={null}
        >
          <form onSubmit={handleTestDrive}>
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
                <input className="form-input" name="phone" type="tel" placeholder="+254 7XX…" required />
              </div>
            </div>
            <div className="form-group">
              <label>Preferred Date</label>
              <input className="form-input" name="preferred_date" type="date" min={minDate} required />
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea className="form-input" name="notes" rows="2" placeholder="Any preferences or questions…" />
            </div>
            <button type="submit" className="btn-submit" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'BOOKING…' : 'BOOK TEST DRIVE'}
            </button>
            {feedback && <div className={`feedback ${feedback.type}`} style={{ marginTop: 12 }}>{feedback.msg}</div>}
          </form>
        </Modal>
      )}
    </div>
  );
}
