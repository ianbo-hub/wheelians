import { useState } from 'react';

const faqs = [
  {
    q: 'What financing options do you offer?',
    a: 'We partner with leading Kenyan banks and SACCOs to offer competitive vehicle financing. Our finance team can help you find terms that work for your budget, whether you\'re looking at hire purchase, asset finance, or a personal loan.',
  },
  {
    q: 'Do you accept trade-ins?',
    a: 'Yes! We accept trade-ins on all makes and models. Bring your vehicle to any of our three showrooms for a free valuation, and we\'ll apply the value as a deposit toward your new car.',
  },
  {
    q: 'Are your cars inspected before sale?',
    a: 'Every vehicle undergoes our comprehensive 150-point inspection covering mechanical, electrical, bodywork, and safety systems. Certified Pre-Owned vehicles receive an extended warranty on top of this.',
  },
  {
    q: 'Can I book a test drive online?',
    a: 'Absolutely. Use the contact form below or call any of our showrooms directly to schedule a test drive at a time that suits you. We can also arrange for a vehicle to be brought to your location within Nairobi.',
  },
  {
    q: 'Do you deliver nationwide?',
    a: 'Yes, we deliver to all major towns across Kenya. Delivery fees depend on the destination. Vehicles can be shipped via car carrier or driven by our professional drivers — your choice.',
  },
  {
    q: 'What after-sales support do you provide?',
    a: 'Our after-sales team handles service scheduling, warranty claims, and spare parts sourcing. We maintain relationships with authorised service centres for all major brands we sell.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section className="section" id="faq">
      <div className="section-label reveal">FAQ</div>
      <h2 className="section-title reveal" style={{ textAlign: 'center' }}>FREQUENTLY ASKED QUESTIONS</h2>

      <div className="faq-list reveal">
        {faqs.map((item, i) => (
          <div key={i} className={`faq-item${openIndex === i ? ' open' : ''}`}>
            <div className="faq-q" onClick={() => setOpenIndex(openIndex === i ? -1 : i)}>
              <span>{item.q}</span>
              <span className="icon">+</span>
            </div>
            <div className="faq-a">
              <div className="faq-a-inner">{item.a}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
