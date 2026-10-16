const locations = [
  {
    name: 'WESTLANDS',
    city: 'Nairobi',
    address: 'Westlands Road, off Waiyaki Way\nWestlands, Nairobi',
    hours: ['Mon – Fri: 8:00 AM – 6:00 PM', 'Saturday: 9:00 AM – 4:00 PM', 'Sunday: Closed'],
  },
  {
    name: 'NYALI',
    city: 'Mombasa',
    address: 'Links Road, Nyali\nMombasa',
    hours: ['Mon – Fri: 8:00 AM – 6:00 PM', 'Saturday: 9:00 AM – 4:00 PM', 'Sunday: Closed'],
  },
  {
    name: 'MILIMANI',
    city: 'Kisumu',
    address: 'Oginga Odinga Street\nMilimani, Kisumu',
    hours: ['Mon – Fri: 8:30 AM – 5:30 PM', 'Saturday: 9:00 AM – 3:00 PM', 'Sunday: Closed'],
  },
];

export default function Locations() {
  return (
    <section className="section" id="locations">
      <div className="section-label reveal">OUR SHOWROOMS</div>
      <h2 className="section-title reveal">FIND US NEAR YOU</h2>

      <div className="loc-grid">
        {locations.map((loc, i) => (
          <div key={i} className={`loc-card reveal reveal-delay-${i + 1}`}>
            <h4>{loc.name}</h4>
            <div className="city">{loc.city}</div>
            <p style={{ whiteSpace: 'pre-line' }}>{loc.address}</p>
            <div className="hours">
              {loc.hours.map((h, j) => (
                <div key={j}>{h}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
