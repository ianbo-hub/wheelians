import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    // Observe all current .reveal elements
    function observeAll() {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        obs.observe(el);
      });
    }

    observeAll();

    // Watch for new .reveal elements added dynamically (e.g. after API fetch)
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mo.disconnect();
    };
  }, []);
}
