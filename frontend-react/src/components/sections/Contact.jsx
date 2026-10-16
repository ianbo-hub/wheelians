import { useState } from 'react';
import api from '../../utils/api';

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const fd = new FormData(e.target);
    const body = {
      name: `${fd.get('first_name')} ${fd.get('last_name')}`.trim(),
      email: fd.get('email'),
      phone: fd.get('phone') || null,
      subject: fd.get('subject') || null,
      message: fd.get('message'),
      source: 'contact_form',
    };

    try {
      await api('/api/enquiries', { method: 'POST', body });
      setFeedback({ type: 'success', msg: 'Message sent! We\'ll get back to you shortly.' });
      e.target.reset();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="section-label reveal">CONTACT</div>
      <h2 className="section-title reveal">GET IN TOUCH</h2>

      <div className="contact-layout reveal">
        <div className="contact-info">
          <h3>LET&apos;S TALK</h3>
          <p>Whether you&apos;re looking for your next dream car, need financing advice, or want to sell your vehicle — our team is ready to help.</p>

          <div className="contact-detail">
            <strong>Phone</strong>
            <a href="tel:+254711222333">+254 711 222 333</a>
          </div>
          <div className="contact-detail">
            <strong>Email</strong>
            <a href="mailto:info@wheelians.co.ke">info@wheelians.co.ke</a>
          </div>
          <div className="contact-detail">
            <strong>WhatsApp</strong>
            <a href="https://wa.me/254711222333" target="_blank" rel="noopener noreferrer">+254 711 222 333</a>
          </div>
          <div className="contact-detail">
            <strong>Hours</strong>
            <span>Mon – Sat: 8:00 AM – 6:00 PM</span>
          </div>
        </div>

        <form className="sell-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input className="form-input" name="first_name" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input className="form-input" name="last_name" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" name="email" type="email" required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" name="phone" type="tel" placeholder="+254 7XX XXX XXX" />
            </div>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select className="form-input" name="subject">
              <option value="">Select…</option>
              <option>General Enquiry</option>
              <option>Vehicle Enquiry</option>
              <option>Test Drive</option>
              <option>Finance</option>
              <option>After-Sales</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea className="form-input" name="message" placeholder="How can we help?" required />
          </div>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'SENDING…' : 'SEND MESSAGE'}
          </button>
          {feedback && (
            <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>
          )}
        </form>
      </div>
    </section>
  );
}
