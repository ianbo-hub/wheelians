export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-newsletter">
          <div>
            <h3>STAY UPDATED</h3>
            <p>Get notified about new arrivals, exclusive deals, and automotive news from Wheelians Kenya.</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" />
            <button type="submit">SUBSCRIBE</button>
          </form>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h4>INVENTORY</h4>
            <a href="#inventory">All Cars</a>
            <a href="#inventory">SUVs</a>
            <a href="#inventory">Sedans</a>
            <a href="#inventory">Coupes</a>
            <a href="#inventory">Pickups</a>
          </div>
          <div className="footer-col">
            <h4>SERVICES</h4>
            <a href="#finance">Finance Calculator</a>
            <a href="#sell">Sell Your Car</a>
            <a href="#contact">Book Test Drive</a>
            <a href="#contact">Trade-in</a>
          </div>
          <div className="footer-col">
            <h4>COMPANY</h4>
            <a href="#about">About Us</a>
            <a href="#about">Our Team</a>
            <a href="#locations">Locations</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-col">
            <h4>FOLLOW US</h4>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://wa.me/254711222333" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24"><path d="M12.004 2A9.98 9.98 0 0 0 2.05 11.95a9.88 9.88 0 0 0 1.348 4.98L2 22l5.233-1.374A9.98 9.98 0 0 0 22 11.95 9.98 9.98 0 0 0 12.004 2zm4.49 14.07c-.246-.123-1.455-.718-1.682-.8-.226-.082-.39-.123-.555.123-.165.246-.638.8-.782.964-.144.165-.288.185-.534.062-.246-.123-1.039-.383-1.978-1.222-.731-.652-1.225-1.457-1.369-1.703-.144-.246-.015-.38.108-.503.111-.111.246-.288.37-.432.122-.144.164-.246.245-.41.082-.165.041-.308-.02-.432-.062-.123-.555-1.338-.76-1.833-.2-.482-.404-.417-.555-.424l-.473-.009c-.165 0-.432.062-.658.308-.226.246-.863.843-.863 2.05s.882 2.38 1.005 2.543c.123.165 1.737 2.653 4.21 3.72.588.255 1.047.407 1.405.52.59.188 1.128.161 1.552.098.473-.07 1.455-.595 1.66-1.17.206-.574.206-1.066.144-1.168-.062-.103-.226-.165-.473-.288z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Wheelians Kenya. All rights reserved.</span>
          <span>Westlands, Nairobi · Nyali, Mombasa · Milimani, Kisumu</span>
        </div>
      </div>
    </footer>
  );
}
