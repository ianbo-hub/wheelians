import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { fmtKES, placeholderImg } from '../../utils/format';

export default function NewArrivals() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    api('/api/cars?limit=6&sort=created_at&order=desc')
      .then((res) => setCars((res.data || []).slice(0, 6)))
      .catch(() => setCars([]));
  }, []);

  if (cars.length === 0) return null;

  return (
    <section className="section" id="new-arrivals">
      <div className="section-label reveal">JUST IN</div>
      <h2 className="section-title reveal">NEW ARRIVALS</h2>

      <div className="arrivals-grid reveal">
        {cars.map((car) => {
          const imgSrc = car.images?.[0]?.url || placeholderImg(car);
          return (
            <a key={car.id} className="arrival-card" href="#inventory">
              <div className="arrival-img">
                <img src={imgSrc} alt={`${car.make} ${car.model}`} loading="lazy" />
                {car.badge && <span className="arrival-badge">{car.badge}</span>}
              </div>
              <div className="arrival-info">
                <div className="arrival-name">{car.make} {car.model} <span>{car.year}</span></div>
                <div className="arrival-price">{fmtKES(car.price_kes)}</div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
