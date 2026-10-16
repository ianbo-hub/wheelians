import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { placeholderImg } from '../../utils/format';
import CarCard from '../cars/CarCard';

const MAKES = ['All', 'Toyota', 'BMW', 'Mercedes', 'Porsche', 'Audi', 'Lexus'];
const BODIES = ['All', 'SUV', 'Sedan', 'Coupe', 'Pickup'];
const YEARS = ['All', '2024', '2023', '2022', 'Pre-2022'];
const CONDITIONS = ['All', 'New', 'Certified Pre-Owned'];

export default function Inventory() {
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState({ make: 'All', body: 'All', year: 'All', condition: 'All' });
  const [priceMax, setPriceMax] = useState(20000000);

  useEffect(() => {
    api('/api/cars?limit=100')
      .then((res) => {
        const mapped = (res.data || []).map((c) => ({
          ...c,
          price: c.price_kes,
          body: c.body,
          cond: c.condition,
          badge: c.badge || (c.condition === 'new' ? 'New' : c.condition === 'certified' ? 'Certified' : c.km < 20000 ? 'Low Mileage' : null),
          img: c.images?.[0]?.url || placeholderImg(c),
        }));
        setCars(mapped);
      })
      .catch(() => setCars([]));
  }, []);

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (filters.make !== 'All' && c.make !== filters.make) return false;
      if (filters.body !== 'All' && c.body !== filters.body) return false;
      if (filters.year !== 'All') {
        if (filters.year === 'Pre-2022' && c.year >= 2022) return false;
        if (filters.year !== 'Pre-2022' && String(c.year) !== filters.year) return false;
      }
      if (filters.condition !== 'All') {
        const map = { 'New': 'new', 'Certified Pre-Owned': 'certified' };
        if (map[filters.condition] && c.cond !== map[filters.condition]) return false;
      }
      if ((c.price_kes || c.price) > priceMax) return false;
      return true;
    });
  }, [cars, filters, priceMax]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <section className="section" id="inventory">
      <div className="section-label reveal">INVENTORY</div>
      <h2 className="section-title reveal">EXPLORE OUR COLLECTION</h2>

      <div className="inv-layout">
        <aside className="filter-side reveal">
          <div className="filter-group">
            <label>MAKE</label>
            <div className="chip-row">
              {MAKES.map((m) => (
                <button key={m} className={`chip${filters.make === m ? ' active' : ''}`} onClick={() => setFilter('make', m)}>{m}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>BODY</label>
            <div className="chip-row">
              {BODIES.map((b) => (
                <button key={b} className={`chip${filters.body === b ? ' active' : ''}`} onClick={() => setFilter('body', b)}>{b}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>MAX PRICE</label>
            <div className="price-range">
              <input type="range" min={1000000} max={25000000} step={500000} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} />
              <div className="price-val">KES {priceMax.toLocaleString()}</div>
            </div>
          </div>
          <div className="filter-group">
            <label>YEAR</label>
            <div className="chip-row">
              {YEARS.map((y) => (
                <button key={y} className={`chip${filters.year === y ? ' active' : ''}`} onClick={() => setFilter('year', y)}>{y}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>CONDITION</label>
            <div className="chip-row">
              {CONDITIONS.map((c) => (
                <button key={c} className={`chip${filters.condition === c ? ' active' : ''}`} onClick={() => setFilter('condition', c)}>{c}</button>
              ))}
            </div>
          </div>
        </aside>

        <div className="car-grid">
          {filtered.length === 0 ? (
            <div className="no-cars">No vehicles match your filters. Try adjusting your criteria.</div>
          ) : (
            filtered.map((car) => <CarCard key={car.id} car={car} />)
          )}
        </div>
      </div>
    </section>
  );
}
