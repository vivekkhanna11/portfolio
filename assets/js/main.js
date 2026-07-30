document.addEventListener('DOMContentLoaded', () => {
  const plates = document.querySelectorAll('.plate');

  if (!plates.length) return;

  // 1. Prepare SVG stroke paths for blueprint line-drawing
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
      // Fallback for simple shapes
    }
  });

  // Helper functions to animate or reset a plate
  const activatePlate = (plate) => {
    plate.classList.add('is-active');
    const paths = plate.querySelectorAll('path, circle, rect');
    paths.forEach(path => {
      path.style.strokeDashoffset = '0';
    });
  };

  const deactivatePlate = (plate) => {
    plate.classList.remove('is-active');
    const paths = plate.querySelectorAll('path, circle, rect');
    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        if (length > 0) path.style.strokeDashoffset = length;
      } catch (e) {}
    });
  };

  // 2. Setup IntersectionObserver for continuous scroll up/down
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -10% 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activatePlate(entry.target);
      } else {
        deactivatePlate(entry.target);
      }
    });
  }, observerOptions);

  plates.forEach(plate => {
    plate.classList.add('plate-scroll-effect');
    observer.observe(plate);
  });

  // 3. Trigger immediate activation on Load
  const checkInitialView = () => {
    plates.forEach(plate => {
      const rect = plate.getBoundingClientRect();
      // If the plate is inside the visible viewport on load, activate it immediately
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15) {
        activatePlate(plate);
      }
    });
  };

  // Run initial load check across frame cycles to guarantee early execution
  requestAnimationFrame(checkInitialView);
  setTimeout(checkInitialView, 50);
});
//Cursor
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.querySelector('.custom-cursor');

  if (!cursor) return;

  // Track cursor position centered on the mouse pointer
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Expand cursor when hovering interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering-interactive'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-interactive'));
  });
});
