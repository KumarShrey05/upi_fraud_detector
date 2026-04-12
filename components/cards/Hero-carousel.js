'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Stay Safe from UPI Frauds',
    description:
      'Detect suspicious transactions instantly and protect your money in real time.',
    color: 'from-[#1e3a8a] via-[#2563eb] to-[#38bdf8]',
  },
  {
    id: 2,
    title: 'Real-Time Fraud Detection',
    description:
      'AI continuously monitors UPI activity to catch unusual behavior instantly.',
    color: 'from-[#4c1d95] via-[#7c3aed] to-[#c084fc]',
  },
  {
    id: 3,
    title: 'Block Fake Payments',
    description:
      'Avoid phishing, fake QR codes, and unauthorized payment requests easily.',
    color: 'from-[#7c2d12] via-[#ea580c] to-[#fdba74]',
  },
  {
    id: 4,
    title: 'Secure Every Transaction',
    description:
      'Smart fraud detection ensures complete protection of your money.',
    color: 'from-[#064e3b] via-[#059669] to-[#6ee7b7]',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full">

      {/* SLIDER WRAPPER */}
      <div className="overflow-hidden rounded-3xl shadow-xl shadow-black/10">

        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >

          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`relative min-w-full h-[220px] md:h-[240px] flex items-center justify-center text-center px-6 text-white bg-gradient-to-br ${slide.color}`}
            >

              {/* soft glow */}
              <div className="absolute -top-10 -left-10 w-60 h-60 bg-white/20 rounded-full blur-3xl animate-pulse z-0" />
              <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-black/20 rounded-full blur-3xl z-0" />

              {/* glass overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl z-10" />

              {/* CONTENT CENTERED */}
              <div className="relative z-20 max-w-xl">

                <div className="inline-flex mb-3 px-3 py-1 rounded-full bg-white/20 text-xs">
                  UPay Fraud Shield
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                  {slide.title}
                </h3>

                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  {slide.description}
                </p>

              </div>

            </div>
          ))}

        </div>
      </div>

      {/* LEFT BUTTON */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md z-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md z-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-black w-8' : 'bg-gray-300 w-2'
            }`}
          />
        ))}
      </div>

    </div>
  );
}