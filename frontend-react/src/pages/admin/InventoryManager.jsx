import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { fmtKES } from '../../utils/format';
import Modal from '../../components/ui/Modal';

const BODIES = ['SUV', 'Sedan', 'Coupe', 'Pickup', 'Hatchback', 'Convertible', 'Wagon', 'Van'];
const CONDITIONS = ['new', 'used', 'certified'];

export default function InventoryManager() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const [bodyFilter, setBodyFilter] = useState('');
  const [facets, setFacets] = useState([]);
  const [editCar, setEditCar] = useState(null);
  const [carImages, setCarImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadCars = useCallback(async () => {
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.set('q', search);
    if (bodyFilter) params.set('body', bodyFilter);
    const data = await api('/api/cars?' + params);
    setCars(data.data || []);
  }, [search, bodyFilter]);

  useEffect(() => { loadCars(); }, [loadCars]);

  useEffect(() => {
    api('/api/cars/meta/facets').then((f) => setFacets(f.bodies || [])).catch(() => {});
  }, []);

  // Load images when editing a car
  useEffect(() => {
    if (editCar?.id) {
      setCarImages(editCar.images || []);
    } else {
      setCarImages([]);
    }
  }, [editCar]);

  const markSold = async (id) => {
    if (!window.confirm('Mark this car as sold?')) return;
    await api(`/api/cars/${id}/mark-sold`, { method: 'POST' });
    loadCars();
  };

  const saveCar = async (formData) => {
    const colors = (formData.get('colors') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const body = {
      make: formData.get('make'), model: formData.get('model'),
      year: parseInt(formData.get('year'), 10),
      price_kes: parseInt(formData.get('price_kes'), 10),
      body: formData.get('body'), condition: formData.get('condition'),
      km: parseInt(formData.get('km'), 10) || 0,
      power: formData.get('power') || null, engine: formData.get('engine') || null,
      badge: formData.get('badge') || null, location: formData.get('location') || null,
      colors, description: formData.get('description') || null,
      featured: formData.get('featured') === 'on',
    };
    if (editCar.id) {
      await api(`/api/cars/${editCar.id}`, { method: 'PUT', body });
    } else {
      const res = await api('/api/cars', { method: 'POST', body });
      // Upload queued images for new car
      const fileInput = document.getElementById('car-image-input');
      if (fileInput?.files?.length && res.id) {
        await uploadImages(res.id, fileInput.files);
      }
    }
    setEditCar(null);
    loadCars();
  };

  const uploadImages = async (carId, files) => {
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of files) fd.append('images', f);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cars/${carId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      setCarImages((prev) => [...prev, ...(data.images || [])]);
    } catch (err) {
      alert('Image upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (editCar?.id) {
      await uploadImages(editCar.id, files);
    }
    e.target.value = '';
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api(`/api/cars/${editCar.id}/images/${imageId}`, { method: 'DELETE' });
      setCarImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  return (
    <>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Inventory</h3>
          <div className="admin-filters">
            <input
              type="text" placeholder="Search make/model…" value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={bodyFilter} onChange={(e) => setBodyFilter(e.target.value)}>
              <option value="">All bodies</option>
              {facets.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <button className="btn btn-sm" onClick={() => setEditCar({ year: new Date().getFullYear(), body: 'SUV', condition: 'new', colors: [] })}>
              + New car
            </button>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr><th>Make / Model</th><th>Year</th><th>Price</th><th>Body</th><th>Condition</th><th>Images</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {cars.length === 0 ? (
              <tr><td colSpan={8} className="admin-empty">No cars yet.</td></tr>
            ) : (
              cars.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.make}</strong> {c.model}</td>
                  <td>{c.year}</td>
                  <td>{fmtKES(c.price_kes)}</td>
                  <td>{c.body}</td>
                  <td><span className={`pill ${c.condition}`}>{c.condition}</span></td>
                  <td>{c.images?.length || 0}</td>
                  <td>{c.sold ? <span className="pill rejected">Sold</span> : <span className="pill new">Available</span>}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn-ghost btn-sm" onClick={() => setEditCar(c)}>Edit</button>
                    {!c.sold && <button className="btn-ghost btn-sm" onClick={() => markSold(c.id)} style={{ marginLeft: 6 }}>Mark Sold</button>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editCar && (
        <Modal
          title={editCar.id ? `Edit — ${editCar.make} ${editCar.model}` : 'Add New Car'}
          onClose={() => setEditCar(null)}
          footer={
            <>
              <button className="btn" onClick={() => {
                const form = document.getElementById('car-form');
                saveCar(new FormData(form)).catch((err) => alert(err.message));
              }}>Save</button>
              <button className="btn-ghost" onClick={() => setEditCar(null)}>Cancel</button>
            </>
          }
        >
          <form id="car-form">
            <dt>Make</dt><dd><input className="input" name="make" defaultValue={editCar.make || ''} required /></dd>
            <dt>Model</dt><dd><input className="input" name="model" defaultValue={editCar.model || ''} required /></dd>
            <dt>Year / Body</dt>
            <dd style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="input" type="number" name="year" defaultValue={editCar.year} min="1950" max="2027" required />
              <select className="input" name="body" defaultValue={editCar.body}>
                {BODIES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </dd>
            <dt>Price (KES)</dt><dd><input className="input" type="number" name="price_kes" defaultValue={editCar.price_kes || ''} required /></dd>
            <dt>Condition / km</dt>
            <dd style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <select className="input" name="condition" defaultValue={editCar.condition}>
                {CONDITIONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <input className="input" type="number" name="km" defaultValue={editCar.km || 0} min="0" />
            </dd>
            <dt>Power / Engine</dt>
            <dd style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="input" name="power" defaultValue={editCar.power || ''} placeholder="415hp" />
              <input className="input" name="engine" defaultValue={editCar.engine || ''} placeholder="3.5L V6" />
            </dd>
            <dt>Badge / Location</dt>
            <dd style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="input" name="badge" defaultValue={editCar.badge || ''} placeholder="New / CPO / Low Mileage" />
              <input className="input" name="location" defaultValue={editCar.location || ''} placeholder="Nairobi" />
            </dd>
            <dt>Colors (hex, comma-separated)</dt>
            <dd><input className="input" name="colors" defaultValue={(Array.isArray(editCar.colors) ? editCar.colors : []).join(', ')} placeholder="#1a1a2e, #c0c0c0" /></dd>
            <dt>Description</dt><dd><textarea className="input" name="description" rows="3" defaultValue={editCar.description || ''} /></dd>
            <dt>Featured</dt><dd><label><input type="checkbox" name="featured" defaultChecked={editCar.featured} /> Yes</label></dd>
          </form>

          {/* ─── Image Upload Section ──────────────────────── */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16 }}>
            <dt style={{ marginBottom: 8 }}>Car Images</dt>
            {carImages.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
                {carImages.map((img) => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', aspectRatio: '4/3', background: '#1a1a1a' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => deleteImage(img.id)}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none',
                        borderRadius: '50%', width: 22, height: 22, cursor: 'pointer',
                        fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      title="Delete image"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            <label
              htmlFor="car-image-input"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '14px 20px', border: '2px dashed var(--border)',
                borderRadius: 8, cursor: 'pointer', color: 'var(--dim)',
                fontSize: 13, gap: 8, transition: 'border-color 0.2s',
              }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--silver)'; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
                if (e.dataTransfer.files.length && editCar?.id) {
                  uploadImages(editCar.id, e.dataTransfer.files);
                }
              }}
            >
              {uploading ? '⏳ Uploading…' : '📷 Click or drag images here (max 10 per upload)'}
            </label>
            <input
              id="car-image-input"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
