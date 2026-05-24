import React, { useState, useEffect, useCallback, useRef } from 'react'; // 引入 useRef
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Fixed image URLs (removed the markdown formatting)
const IMAGES = [
  { src: 'https://github.com/ginagao1996-dev/3d-web/blob/main/Boy1.png?raw=true', bg: '#D4A373', panel: '#E0B589' },
  { src: 'https://github.com/ginagao1996-dev/3d-web/blob/main/Boy2.png?raw=true', bg: '#8F9B82', panel: '#A2AD96' },
  { src: 'https://github.com/ginagao1996-dev/3d-web/blob/main/G2.png?raw=true', bg: '#B8929A', panel: '#C9A6AE' },
  { src: 'https://github.com/ginagao1996-dev/3d-web/blob/main/G1.png?raw=true', bg: '#7B8C9C', panel: '#909FA8' },
];

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prevActiveIndex = useRef(0); // 使用 ref 记录上一个激活的索引

  // Preload images, handle window resize, and inject required fonts
  useEffect(() => {
    // Inject fonts
    const fontStyle = document.createElement('style');
    fontStyle.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap');
    `;
    document.head.appendChild(fontStyle);

    // Preload images for smooth transitions
    IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.src;
    });

    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize(); // Initial check
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.head.removeChild(fontStyle);
    };
  }, []);

  // Carousel navigation logic with 650ms animation lock
  const navigate = useCallback((direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    prevActiveIndex.current = activeIndex; // 在切换前记录当前的索引
    
    setActiveIndex((prev) => 
      direction === 'next' ? (prev + 1) % 4 : (prev + 3) % 4
    );
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  }, [isAnimating, activeIndex]); // 添加 activeIndex 到依赖项

  // Calculate dynamic styles based on role (center, left, right, back)
  const getRoleStyles = (index) => {
    // 1. 确定当前图片的角色
    let role = 'back';
    if (index === activeIndex) role = 'center';
    else if (index === (activeIndex + 3) % 4) role = 'left';
    else if (index === (activeIndex + 1) % 4) role = 'right';

    // 2. 定义每个角色的基础样式
    const baseStyles = {
      center: {
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: 'blur(0px)',
        opacity: 1,
        left: '50%',
        height: isMobile ? '60%' : '92%',
        bottom: isMobile ? '22%' : '0',
        zIndex: 20, // 静态时的最高层级
      },
      left: {
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        left: isMobile ? '20%' : '30%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        zIndex: 10,
      },
      right: {
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        left: isMobile ? '80%' : '70%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        zIndex: 10,
      },
      back: {
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(4px)',
        opacity: 1,
        left: '50%',
        height: isMobile ? '13%' : '22%',
        bottom: isMobile ? '32%' : '12%',
        zIndex: 5,
      },
    };

    let styles = { ...baseStyles[role] };

    // 3. 关键修改：在动画期间动态调整 zIndex 以实现自然过渡
    if (isAnimating) {
      if (index === activeIndex) {
        // 正在进入中间的图片，层级最高
        styles.zIndex = 30;
      } else if (index === prevActiveIndex.current) {
        // 刚刚从中间移走的图片，层级次高，确保它在移动过程中压在侧边和后排图片之上
        styles.zIndex = 25;
      }
      // 其他图片保持原有的较低 zIndex (10 或 5)
    }

    return styles;
  };

  // Grain SVG data URI
  const grainSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E`;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
        
        {/* 1. Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[50]"
          style={{
            opacity: 0.4,
            backgroundImage: `url("${grainSvg}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* 2. Giant ghost text */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2]"
          style={{ top: '18%' }}
        >
          <span
            className="text-white uppercase whitespace-nowrap"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(90px, 28vw, 380px)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            3D SHAPE
          </span>
        </div>

        {/* 3. Top-left brand label */}
        <div className="absolute top-6 left-4 sm:left-8 z-[60]">
          <span className="text-xs font-semibold uppercase text-white opacity-90 tracking-[0.18em]">
            GINA
          </span>
        </div>

        {/* 4. Carousel */}
        <div className="absolute inset-0 z-[3]">
          {IMAGES.map((img, index) => (
            <div
              key={img.src}
              className="absolute"
              style={{
                aspectRatio: '0.6 / 1',
                // zIndex 不在 transition 中，它是瞬间变化的
                willChange: 'transform, filter, opacity',
                transition: 'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1), bottom 650ms cubic-bezier(0.4,0,0.2,1), height 650ms cubic-bezier(0.4,0,0.2,1)',
                ...getRoleStyles(index),
              }}
            >
              <img
                src={img.src}
                alt={`Gina Figurine ${index + 1}`}
                draggable={false}
                className="w-full h-full object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          ))}
        </div>

        {/* 5. Bottom-left text + nav buttons */}
        <div className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24 z-[60] max-w-[320px]">
          <p className="font-bold uppercase tracking-widest mb-2 sm:mb-3 text-base sm:text-[22px] text-white opacity-95" style={{ letterSpacing: '0.02em' }}>
            GINA FIGURINES
          </p>
          <p className="hidden sm:block text-xs sm:text-sm text-white opacity-85 leading-[1.6] mb-4 sm:mb-5">
            The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate('prev')}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-transparent border-2 border-white/80 flex items-center justify-center text-white transition-all duration-150 hover:scale-105 hover:bg-white/10"
              aria-label="Previous figurine"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button
              onClick={() => navigate('next')}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-transparent border-2 border-white/80 flex items-center justify-center text-white transition-all duration-150 hover:scale-105 hover:bg-white/10"
              aria-label="Next figurine"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* 6. Bottom-right link */}
        <div className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 z-[60]">
          <a
            href="#"
            className="flex items-center text-white uppercase no-underline opacity-95 hover:opacity-100 transition-opacity duration-200"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(20px, 4vw, 56px)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            DISCOVER IT
            <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8 ml-2" strokeWidth={2.25} />
          </a>
        </div>
        
      </div>
    </div>
  );
}