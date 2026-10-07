/**
 * Hình tay cầm PS5 trong khung cắt góc (chép từ prototype). Chỉ để trang trí nên ẩn với trình đọc màn
 * hình. Màu trong SVG dùng biến theme (var(--color-*)), không hardcode.
 */
export function HeroController() {
  return (
    <div
      aria-hidden="true"
      className="clip-corner relative flex aspect-square items-center justify-center border-2 border-brand-500 bg-linear-135 from-brand-500/5 to-neon-red/5 p-8"
    >
      <p className="absolute top-4 left-6 font-mono text-xs tracking-[0.2em] text-brand-500">
        PS5 // PRO GEAR
      </p>
      <svg
        viewBox="0 0 300 200"
        className="w-4/5 animate-float drop-shadow-[0_0_30px_rgb(255_106_0/0.5)]"
      >
        <defs>
          <linearGradient id="hero-controller-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-500)" />
            <stop offset="100%" stopColor="var(--color-neon-amber)" />
          </linearGradient>
        </defs>
        {/* Thân */}
        <path
          d="M50 80 Q50 50 80 50 L120 50 Q140 50 150 65 L150 65 Q160 50 180 50 L220 50 Q250 50 250 80 L250 140 Q250 170 220 170 L210 170 Q190 170 180 155 L150 130 L120 155 Q110 170 90 170 L80 170 Q50 170 50 140 Z"
          fill="var(--color-dark)"
          fillOpacity="0.95"
          stroke="url(#hero-controller-stroke)"
          strokeWidth="2"
        />
        {/* Phím mũi tên */}
        <rect
          x="75"
          y="85"
          width="8"
          height="22"
          rx="2"
          fill="var(--color-brand-500)"
          opacity="0.8"
        />
        <rect
          x="68"
          y="92"
          width="22"
          height="8"
          rx="2"
          fill="var(--color-brand-500)"
          opacity="0.8"
        />
        {/* Nút bấm */}
        <circle cx="215" cy="80" r="6" fill="var(--color-neon-red)" />
        <circle cx="235" cy="96" r="6" fill="var(--color-neon-gold)" />
        <circle cx="215" cy="112" r="6" fill="var(--color-brand-500)" />
        <circle cx="195" cy="96" r="6" fill="var(--color-neon-amber)" />
        {/* Cần analog */}
        <circle
          cx="110"
          cy="130"
          r="14"
          fill="var(--color-brand-500)"
          fillOpacity="0.1"
          stroke="var(--color-brand-500)"
          strokeWidth="2"
        />
        <circle cx="110" cy="130" r="8" fill="var(--color-brand-500)" />
        <circle
          cx="180"
          cy="130"
          r="14"
          fill="var(--color-neon-red)"
          fillOpacity="0.1"
          stroke="var(--color-neon-red)"
          strokeWidth="2"
        />
        <circle cx="180" cy="130" r="8" fill="var(--color-neon-red)" />
        {/* Touchpad */}
        <rect
          x="125"
          y="75"
          width="50"
          height="20"
          rx="3"
          fill="var(--color-brand-500)"
          fillOpacity="0.05"
          stroke="var(--color-brand-500)"
          strokeWidth="1"
          opacity="0.6"
        />
        {/* Cò L2/R2 */}
        <path
          d="M65 50 Q60 35 75 30 L95 30 L95 50 Z"
          fill="var(--color-brand-500)"
          fillOpacity="0.1"
          stroke="var(--color-brand-500)"
          strokeWidth="2"
        />
        <path
          d="M235 50 Q240 35 225 30 L205 30 L205 50 Z"
          fill="var(--color-neon-red)"
          fillOpacity="0.1"
          stroke="var(--color-neon-red)"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}
