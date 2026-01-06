'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  gender: 'male' | 'female';
  rating: number;
  text: string;
}

const reviewsData: Review[] = [
  {
    id: 1,
    name: 'Alex Martinez',
    gender: 'male',
    rating: 5,
    text: 'Best hoodie I\'ve ever owned. The quality is incredible and it fits perfectly. Worth every penny. I\'ve already ordered two more for my friends.'
  },
  {
    id: 2,
    name: 'Jordan Lee',
    gender: 'female',
    rating: 5,
    text: 'Subtle design, premium feel. These are now my go-to pieces for everyday wear. The fabric is so soft and breathable, perfect for layering.'
  },
  {
    id: 3,
    name: 'Sam Rivera',
    gender: 'male',
    rating: 5,
    text: 'Fast shipping, great quality, and the customer service is top-notch. Highly recommend! I wore it on a flight and got compliments the whole time.'
  },
  {
    id: 4,
    name: 'Emma Thompson',
    gender: 'female',
    rating: 4.5,
    text: 'Absolutely love the minimalist aesthetic. The colors are exactly as shown online and the fit is true to size. Been wearing it constantly since it arrived.'
  },
  {
    id: 5,
    name: 'Marcus Johnson',
    gender: 'male',
    rating: 5,
    text: 'The attention to detail is unmatched. From the stitching to the fabric weight, everything screams premium. Best purchase I\'ve made all year.'
  },
  {
    id: 6,
    name: 'Sophie Chen',
    gender: 'female',
    rating: 4.5,
    text: 'Impressed with how versatile these pieces are. Dressed up or down, they work for any occasion. The packaging was beautiful too!'
  },
  {
    id: 7,
    name: 'David Rodriguez',
    gender: 'male',
    rating: 5,
    text: 'The comfort level is insane. I\'ve worn it for 12+ hours and zero complaints. My family loves it so much we\'re thinking of getting matching sets.'
  },
  {
    id: 8,
    name: 'Olivia Kim',
    gender: 'female',
    rating: 5,
    text: 'Finally found a brand that gets it. The sustainability aspect plus the quality equals a perfect purchase. Will be a loyal customer for life.'
  },
  {
    id: 9,
    name: 'James Williams',
    gender: 'male',
    rating: 4,
    text: 'Really nice quality, though I wish they had more color options. The fit is great and the material feels premium. Would definitely buy again.'
  },
  {
    id: 10,
    name: 'Isabella Santos',
    gender: 'female',
    rating: 5,
    text: 'Every single detail is perfect. The way it drapes, the weight of the fabric, the finishing—truly a masterpiece. This is luxury made accessible.'
  },
  {
    id: 11,
    name: 'Ryan Patrick',
    gender: 'male',
    rating: 5,
    text: 'Been recommending this to everyone. The value for money is incredible. Looks and feels way more expensive than it is. Shipping was fast too!'
  },
  {
    id: 12,
    name: 'Maya Patel',
    gender: 'female',
    rating: 4.5,
    text: 'Such a vibe. The customer service team helped me pick the perfect size and they were so helpful. Wearing it made me feel more confident immediately.'
  },
  {
    id: 13,
    name: 'Christopher Blake',
    gender: 'male',
    rating: 5,
    text: 'This is what quality looks like. The fabric won\'t pill, the seams are solid, and it\'s already my favorite piece in my closet. 10/10.'
  },
  {
    id: 14,
    name: 'Natasha Volkov',
    gender: 'female',
    rating: 5,
    text: 'Exceeded all my expectations. The product photos don\'t do it justice—it\'s even better in person. Already planning my next order!'
  },
  {
    id: 15,
    name: 'Lucas Anderson',
    gender: 'male',
    rating: 4.5,
    text: 'Great investment piece. The minimalist design means it pairs with everything I own. Quality is top-notch and customer service was amazing.'
  }
];

const getMonogram = (name: string) => {
  const parts = name.split(' ');
  const initials = parts.length >= 2 
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
  return initials;
};

const getGenderColor = (gender: 'male' | 'female') => {
  return gender === 'female' 
    ? 'bg-rose-400' 
    : 'bg-blue-400';
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="flex text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="h-5 w-5 fill-current" />;
        } else if (i === fullStars && hasHalfStar) {
          return (
            <div key={i} className="relative w-5 h-5">
              <Star className="h-5 w-5" />
              <div className="absolute top-0 left-0 overflow-hidden w-2.5">
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
          );
        } else {
          return <Star key={i} className="h-5 w-5" />;
        }
      })}
    </div>
  );
};

export function ReviewsCarousel() {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-advance slideshow on mobile every 3 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviewsData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextSlide();
    }
    if (isRightSwipe) {
      goToPrevSlide();
    }
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviewsData.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviewsData.length) % reviewsData.length);
  };

  // Double the reviews for seamless scrolling
  const extendedReviews = [...reviewsData, ...reviewsData];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX - (scrollContainerRef.current?.scrollLeft || 0));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const newOffset = e.clientX - dragStart;
    scrollContainerRef.current.scrollLeft = -newOffset;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Width of one card + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Mobile Slideshow */}
      <div className="md:hidden relative overflow-hidden px-4">
        {/* Arrow buttons */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all hover:scale-110 backdrop-blur"
          aria-label="Previous review"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all hover:scale-110 backdrop-blur"
          aria-label="Next review"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {reviewsData.map((review) => (
            <div 
              key={review.id}
              className="flex-shrink-0 w-full px-2"
            >
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-soft">
                {/* Stars */}
                <div className="mb-4">
                  {renderStars(review.rating)}
                </div>

                {/* Review text */}
                <p className="mb-6 min-h-24 text-black/80 text-sm leading-relaxed select-none">
                  &quot;{review.text}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${getGenderColor(review.gender)}`}>
                    {getMonogram(review.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-black">{review.name}</p>
                    <p className="text-xs text-black/50">Verified buyer</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {reviewsData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-green' : 'w-2 bg-black/20'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Carousel */}
      <div 
        className="hidden md:block relative overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsDragging(false);
        }}
      >
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .carousel-scroll {
            animation: scroll 20s linear infinite;
          }
          .carousel-scroll.paused {
            animation-play-state: paused;
          }
          .carousel-container {
            scroll-behavior: smooth;
          }
          .carousel-container.dragging {
            scroll-behavior: auto;
          }
        `}</style>
      
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 transition-all hover:scale-110 backdrop-blur"
        aria-label="Scroll left"
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 transition-all hover:scale-110 backdrop-blur"
        aria-label="Scroll right"
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div 
        ref={scrollContainerRef}
        className={`carousel-container relative overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={`carousel-scroll ${isHovering ? 'paused' : ''} flex gap-6`}>
          {extendedReviews.map((review, idx) => (
            <div 
              key={`${review.id}-${idx}`}
              className="flex-shrink-0 w-80 md:w-96 rounded-2xl border border-black/5 bg-white p-6 md:p-8 shadow-soft pointer-events-none"
            >
              {/* Stars */}
              <div className="mb-4">
                {renderStars(review.rating)}
              </div>

              {/* Review text */}
              <p className="mb-6 min-h-24 text-black/80 text-sm leading-relaxed select-none">
                &quot;{review.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${getGenderColor(review.gender)}`}>
                  {getMonogram(review.name)}
                </div>
                <div>
                  <p className="font-semibold text-black">{review.name}</p>
                  <p className="text-xs text-black/50">Verified buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Fade effect on edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      </div>
    </>
  );
}
