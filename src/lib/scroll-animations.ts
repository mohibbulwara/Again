'use client';

// Initialize scroll animations when DOM is loaded
export function initScrollAnimations() {
  if (typeof window === 'undefined') return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  // Observe all elements with animate-on-scroll class
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  animateElements.forEach((el) => observer.observe(el));

  // Add staggered animation delays for child elements
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  staggerContainers.forEach((container) => {
    const children = container.querySelectorAll('.animate-on-scroll');
    children.forEach((child, index) => {
      (child as HTMLElement).style.animationDelay = `${index * 100}ms`;
    });
  });

  return () => {
    observer.disconnect();
  };
}

// Smooth scroll to element
export function smoothScrollTo(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Add parallax effect to elements
export function initParallaxEffects() {
  if (typeof window === 'undefined') return;

  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach((element) => {
      const rate = scrolled * -0.5;
      (element as HTMLElement).style.transform = `translateY(${rate}px)`;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

// Add mouse move parallax effect
export function initMouseParallax() {
  if (typeof window === 'undefined') return;

  const parallaxElements = document.querySelectorAll('[data-mouse-parallax]');
  
  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    parallaxElements.forEach((element) => {
      const speed = parseFloat((element as HTMLElement).dataset.mouseParallax || '0.1');
      const x = (clientX - centerX) * speed;
      const y = (clientY - centerY) * speed;
      
      (element as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
    });
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
}

// Add floating animation to elements
export function addFloatingAnimation(selector: string) {
  if (typeof window === 'undefined') return;

  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    (element as HTMLElement).style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
    (element as HTMLElement).style.animationDelay = `${index * 0.2}s`;
  });
}

// Initialize all animations
export function initAllAnimations() {
  if (typeof window === 'undefined') return;

  const cleanupFunctions: (() => void)[] = [];

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const scrollCleanup = initScrollAnimations();
      const parallaxCleanup = initParallaxEffects();
      const mouseCleanup = initMouseParallax();
      
      if (scrollCleanup) cleanupFunctions.push(scrollCleanup);
      if (parallaxCleanup) cleanupFunctions.push(parallaxCleanup);
      if (mouseCleanup) cleanupFunctions.push(mouseCleanup);
    });
  } else {
    const scrollCleanup = initScrollAnimations();
    const parallaxCleanup = initParallaxEffects();
    const mouseCleanup = initMouseParallax();
    
    if (scrollCleanup) cleanupFunctions.push(scrollCleanup);
    if (parallaxCleanup) cleanupFunctions.push(parallaxCleanup);
    if (mouseCleanup) cleanupFunctions.push(mouseCleanup);
  }

  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}