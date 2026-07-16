import React from 'react';

interface BrandLogoProps {
  className?: string;
}

/**
 * BrandLogoIMG7751 - Login/Auth Screen Logo
 * Features:
 * - Solid emerald green canvas (#1b9d5e)
 * - Solid white head & sweeping leaf silhouette
 * - Emerald green face cutout mask, leaf branch, & leaf vein
 * - White closed peaceful eye
 */
export const BrandLogoIMG7751 = ({ className = "w-10 h-10" }: BrandLogoProps) => (
  <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* 1. Clean emerald-green canvas with smooth rounded corners */}
    <rect width="512" height="512" rx="112" fill="#1b9d5e" />
    
    {/* 2. Solid White Silhouette Mass (Hair, head, and base) */}
    {/* Circular head mass */}
    <circle cx="250" cy="210" r="120" fill="#ffffff" />
    
    {/* Bottom sweeping white leaf wrapper */}
    <path 
      d="M 125,280 
         C 115,340 135,390 180,415 
         C 230,440 310,430 365,370 
         C 385,345 395,310 395,290 
         C 395,285 390,285 385,292 
         C 360,335 320,360 270,360 
         C 210,360 155,320 145,280 
         C 142,272 128,272 125,280 Z" 
      fill="#ffffff" 
    />

    {/* 3. Green Face Cutout (Masking with background color #1b9d5e) */}
    <path 
      d="M 260,91 
         C 285,115 295,145 295,170 
         C 295,178 292,185 290,190 
         C 298,195 332,205 342,210 
         C 330,214 318,220 318,222 
         C 324,225 329,228 329,230 
         C 329,232 318,234 314,236 
         C 320,239 324,242 324,245 
         C 324,248 314,250 310,253 
         C 315,258 320,263 320,268 
         C 320,278 305,295 290,320 
         L 450,320 
         L 450,50 
         L 250,50 
         Z" 
      fill="#1b9d5e" 
    />

    {/* 4. Elegant Green Leaf Branch inside the white hair mass */}
    {/* Branch Stem */}
    <path 
      d="M 185,250 
         C 178,210 182,178 213,142 
         C 215,139 212,137 210,138 
         C 190,178 186,210 190,250 Z" 
      fill="#1b9d5e" 
    />
    
    {/* Leaf 1 (Left-leaning) */}
    <path 
      d="M 183,195 
         C 170,190 152,175 155,155 
         C 168,155 180,172 184,188 Z" 
      fill="#1b9d5e" 
    />
    
    {/* Leaf 2 (Right-leaning, slightly higher) */}
    <path 
      d="M 197,175 
         C 202,150 215,125 235,125 
         C 230,145 215,165 200,180 Z" 
      fill="#1b9d5e" 
    />

    {/* 5. Elegant Green Leaf Vein inside the sweeping bottom wrap */}
    <path 
      d="M 148,295 
         C 160,345 220,380 345,340" 
      stroke="#1b9d5e" 
      strokeWidth="5" 
      strokeLinecap="round" 
      fill="none" 
    />

    {/* 6. Peaceful closed eye as a white curved arc */}
    <path 
      d="M 295,185 Q 302,191 309,185" 
      stroke="#ffffff" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      fill="none" 
    />
  </svg>
);

/**
 * BrandLogoIMG7747 - Inside / App Dashboard Logo
 * Features:
 * - Clean white card canvas (#ffffff) with rounded corners
 * - Vibrant mint-to-emerald linear gradient silhouette head & sweeping leaf
 * - Solid white face cutout mask, leaf branch, & leaf vein
 * - Rich emerald green closed peaceful eye (#128c52)
 */
export const BrandLogoIMG7747 = ({ className = "w-10 h-10" }: BrandLogoProps) => (
  <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad-7747" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#54e186" />
        <stop offset="50%" stopColor="#2ecc71" />
        <stop offset="100%" stopColor="#128c52" />
      </linearGradient>
    </defs>

    {/* 1. White card canvas matching IMG_7747's clean background with smooth rounded corners */}
    <rect width="512" height="512" rx="112" fill="#ffffff" />
    
    {/* 2. Head Silhouette Mass filled with the vibrant green gradient */}
    {/* Circular head mass */}
    <circle cx="250" cy="210" r="120" fill="url(#logo-grad-7747)" />
    
    {/* Bottom sweeping leaf wrapper also filled with the green gradient */}
    <path 
      d="M 125,280 
         C 115,340 135,390 180,415 
         C 230,440 310,430 365,370 
         C 385,345 395,310 395,290 
         C 395,285 390,285 385,292 
         C 360,335 320,360 270,360 
         C 210,360 155,320 145,280 
         C 142,272 128,272 125,280 Z" 
      fill="url(#logo-grad-7747)" 
    />

    {/* 3. Solid White Face Cutout (Framing the right side of the head mass with exact face profile) */}
    <path 
      d="M 260,91 
         C 285,115 295,145 295,170 
         C 295,178 292,185 290,190 
         C 298,195 332,205 342,210 
         C 330,214 318,220 318,222 
         C 324,225 329,228 329,230 
         C 329,232 318,234 314,236 
         C 320,239 324,242 324,245 
         C 324,248 314,250 310,253 
         C 315,258 320,263 320,268 
         C 320,278 305,295 290,320 
         L 450,320 
         L 450,50 
         L 250,50 
         Z" 
      fill="#ffffff" 
    />

    {/* 4. Elegant White Leaf Branch inside the green hair mass (on the left side) */}
    {/* Branch Stem */}
    <path 
      d="M 185,250 
         C 178,210 182,178 213,142 
         C 215,139 212,137 210,138 
         C 190,178 186,210 190,250 Z" 
      fill="#ffffff" 
    />
    
    {/* Leaf 1 (Left-leaning) */}
    <path 
      d="M 183,195 
         C 170,190 152,175 155,155 
         C 168,155 180,172 184,188 Z" 
      fill="#ffffff" 
    />
    
    {/* Leaf 2 (Right-leaning, slightly higher) */}
    <path 
      d="M 197,175 
         C 202,150 215,125 235,125 
         C 230,145 215,165 200,180 Z" 
      fill="#ffffff" 
    />

    {/* 5. Elegant White Leaf Vein inside the sweeping bottom green wrap */}
    <path 
      d="M 148,295 
         C 160,345 220,380 345,340" 
      stroke="#ffffff" 
      strokeWidth="5" 
      strokeLinecap="round" 
      fill="none" 
    />

    {/* 6. Peaceful closed eye as a green curved arc in the white face space */}
    <path 
      d="M 295,185 Q 302,191 309,185" 
      stroke="#128c52" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      fill="none" 
    />
  </svg>
);
