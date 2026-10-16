const values = [
  { icon: '🛡️', title: 'Certified Quality', desc: 'Every vehicle undergoes a rigorous 150-point inspection before it reaches our showroom floor.' },
  { icon: '💎', title: 'Premium Selection', desc: 'Curated collection of luxury and performance vehicles from the world\'s most prestigious brands.' },
  { icon: '🤝', title: 'Trusted Service', desc: 'Transparent pricing, honest advice, and after-sales support that keeps you on the road.' },
];

const milestones = [
  { number: '15+', label: 'Years in business' },
  { number: '3,200+', label: 'Cars delivered' },
  { number: '3', label: 'Showroom locations' },
  { number: '98%', label: 'Client satisfaction' },
];

const team = [
  { name: 'James Kamau', role: 'Chief Executive Officer', initials: 'JK' },
  { name: 'Amina Ochieng', role: 'Sales Director', initials: 'AO' },
  { name: 'David Njoroge', role: 'Finance Manager', initials: 'DN' },
  { name: 'Grace Wanjiku', role: 'After-Sales Manager', initials: 'GW' },
];

const brands = ['Toyota', 'BMW', 'Mercedes', 'Porsche', 'Audi', 'Lexus'];

export default function About() {
  return (
    <section className="section" id="about">
      <div className="section-label reveal">ABOUT US</div>
      <h2 className="section-title reveal">DRIVEN BY EXCELLENCE</h2>

      <div className="about-grid reveal">
        <div className="about-img">
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            <rect width="400" height="300" fill="#111" />
            <text x="200" y="150" textAnchor="middle" fill="#333" fontFamily="monospace" fontSize="14">SHOWROOM</text>
          </svg>
        </div>
        <div className="about-text">
          Since 2009, Wheelians has been Kenya&apos;s most trusted name in premium and luxury automobiles.
          Our three strategically located showrooms in Nairobi, Mombasa, and Kisumu bring world-class
          vehicles closer to discerning Kenyan buyers.<br /><br />
          We combine deep automotive expertise with genuine Kenyan hospitality — because buying a car
          should be as exciting as driving one.
        </div>
      </div>

      <div className="values-grid">
        {values.map((v, i) => (
          <div key={i} className={`value-card reveal reveal-delay-${i + 1}`}>
            <div className="value-icon">{v.icon}</div>
            <h4>{v.title}</h4>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="milestones reveal">
        {milestones.map((m, i) => (
          <div key={i} className="milestone">
            <div className="number">{m.number}</div>
            <div className="label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="team-grid">
        {team.map((t, i) => (
          <div key={i} className={`team-card reveal reveal-delay-${i + 1}`}>
            <div className="team-photo">
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--silver-dim)' }}>{t.initials}</span>
            </div>
            <h4>{t.name}</h4>
            <p>{t.role}</p>
          </div>
        ))}
      </div>

      <div className="brand-logos reveal">
        {brands.map((b) => (
          <div key={b} className="brand-logo">
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              {b.slice(0, 3).toUpperCase()}
            </div>
            <span>{b.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
