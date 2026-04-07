'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Your Money is Safe',
    description: 'Advanced fraud detection protects every transaction',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Instant Transfers',
    description: 'Send and receive money in seconds',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'No Hidden Charges',
    description: 'Transparent fees, no surprises',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 4,
    title: 'Track Everything',
    description: 'Detailed spending insights and analytics',
    color: 'from-green-500 to-emerald-500',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full">
      <div className={`bg-gradient-to-br ${slide.color} rounded-3xl p-8 text-white min-h-[200px] flex flex-col justify-between transition-all duration-500`}>
        <div>
          <h3 className="text-3xl font-bold mb-3">{slide.title}</h3>
          <p className="text-white/90 text-lg">{slide.description}</p>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-foreground w-8'
                : 'bg-muted w-2 hover:bg-muted-foreground'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
