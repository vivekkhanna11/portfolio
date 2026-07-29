document.addEventListener('DOMContentLoaded', () => {
  const plates = document.querySelectorAll('.plate');

  if (!plates.length) return;

  // Prepare SVG stroke paths for blueprint drawing animation
  const svgPaths = document.querySelectorAll('.plate-media svg path, .plate-media svg circle, .plate-media svg rect');
  svgPaths.forEach(path => {
    try {
      const length = path.getTotalLength();
      if (length > 0) {
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
      }
    } catch (e) {
      // Fallback for simple elements
    }
  });

  const observerOptions = {
    root: null,
    rootMargin: '-15% 0px -15% 0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const paths = entry.target.querySelectorAll('path, circle, rect');

      if (entry.isIntersecting) {
        entry.target.classList.add('is-active');
        paths.forEach(path => {
          path.style.strokeDashoffset = '0';
        });
      } else {
        entry.target.classList.remove('is-active');
        paths.forEach(path => {
          try {
            const length = path.getTotalLength();
            if (length > 0) path.style.strokeDashoffset = length;
          } catch (e) {}
        });
      }
    });
  }, observerOptions);

  plates.forEach(plate => {
    plate.classList.add('plate-scroll-effect');
    observer.observe(plate);
  });
});
