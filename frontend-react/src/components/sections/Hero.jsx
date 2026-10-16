export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" />
      <div className="hero-scrim" />
      <div className="hero-content">
        <h1>WHEEL<span>IANS</span></h1>
        <p>Kenya's premier destination for luxury and performance vehicles. Experience automotive excellence in Nairobi, Mombasa, and Kisumu.</p>
        <a href="#inventory" className="hero-cta" onClick={(e) => { e.preventDefault(); document.querySelector('#inventory')?.scrollIntoView({ behavior: 'smooth' }); }}>
          EXPLORE INVENTORY →
        </a>
      </div>
      <div className="hero-scroll">
        <span>SCROLL</span>
        <div className="line" />
      </div>
    </section>
  );
}
