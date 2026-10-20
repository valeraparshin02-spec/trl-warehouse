/* A single entrance animation; photos and editable copy work without JavaScript. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }, {threshold: 0.2});
  document.querySelectorAll('.warehouse-story').forEach(story => observer.observe(story));
})();
