import sharp from 'sharp';
import fs from 'fs';

// Colors - IOF standard
const PURPLE = '#FF00FF'; // Orienteering purple (magenta)
const BROWN = '#804000'; // Brown for depression
const WHITE = '#FFFFFF'; // White background
const ORANGE = '#FF6600'; // Orange for kite

// Orienteering symbol dimensions (in mm, IOF standard)
const CONTROL_CIRCLE_DIAMETER = 5.0;
const CONTROL_CIRCLE_STROKE = 0.35;
const DEPRESSION_WIDTH = 0.8 * 2; // 2x size for visibility
const DEPRESSION_DEPTH = 0.4 * 2; // 2x size for visibility
const DEPRESSION_STROKE = 0.18 * 2; // 2x size for visibility

// Create SVG for the icon
function createIconSVG(size) {
  const center = size / 2;

  // Scale everything based on the control circle diameter
  // Control circle takes up ~70% of canvas to leave room for course lines
  const scale = (size * 0.7) / CONTROL_CIRCLE_DIAMETER;

  const circleRadius = (CONTROL_CIRCLE_DIAMETER / 2) * scale;
  const circleStroke = CONTROL_CIRCLE_STROKE * scale;

  // Depression dimensions (U-shape)
  const depressionWidth = DEPRESSION_WIDTH * scale;
  const depressionDepth = DEPRESSION_DEPTH * scale;
  const depressionStroke = DEPRESSION_STROKE * scale;
  const depressionHalfWidth = depressionWidth / 2;

  // Course lines (extending beyond the circle)
  const lineLength = size * 0.15;
  const lineStart = circleRadius + circleStroke / 2;
  const lineEnd = lineStart + lineLength;
  const lineStroke = circleStroke * 0.8;

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- White background -->
      <rect width="${size}" height="${size}" fill="${WHITE}"/>

      <!-- Orange triangle (bottom-right corner for orienteering kite appearance) -->
      <path
        d="M ${size} 0 L ${size} ${size} L 0 ${size} Z"
        fill="${ORANGE}"
      />

      <!-- WHITE BORDERS LAYER (drawn first, beneath everything) -->

      <!-- Course line coming in from top-left - white border -->
      <line
        x1="${center - lineEnd * 0.7}"
        y1="${center - lineEnd * 0.7}"
        x2="${center - lineStart * 0.7}"
        y2="${center - lineStart * 0.7}"
        stroke="${WHITE}"
        stroke-width="${lineStroke + depressionStroke}"
        stroke-linecap="round"
      />

      <!-- Course line going out to bottom-right - white border -->
      <line
        x1="${center + lineStart * 0.7}"
        y1="${center + lineStart * 0.7}"
        x2="${center + lineEnd * 0.7}"
        y2="${center + lineEnd * 0.7}"
        stroke="${WHITE}"
        stroke-width="${lineStroke + depressionStroke}"
        stroke-linecap="round"
      />

      <!-- Control circle white border -->
      <circle
        cx="${center}"
        cy="${center}"
        r="${circleRadius}"
        fill="none"
        stroke="${WHITE}"
        stroke-width="${circleStroke + depressionStroke * 1.5}"
      />

      <!-- Depression symbol white border -->
      <path
        d="M ${center - depressionHalfWidth} ${center - depressionDepth * 0.3}
           A ${depressionHalfWidth * 1.2} ${depressionDepth * 1.5} 0 0 0 ${center + depressionHalfWidth} ${center - depressionDepth * 0.3}"
        fill="none"
        stroke="${WHITE}"
        stroke-width="${depressionStroke + depressionStroke * 0.8}"
        stroke-linecap="round"
      />

      <!-- COLORED ELEMENTS LAYER (drawn on top) -->

      <!-- Course line coming in from top-left - purple -->
      <line
        x1="${center - lineEnd * 0.7}"
        y1="${center - lineEnd * 0.7}"
        x2="${center - lineStart * 0.7}"
        y2="${center - lineStart * 0.7}"
        stroke="${PURPLE}"
        stroke-width="${lineStroke}"
        stroke-linecap="round"
      />

      <!-- Course line going out to bottom-right - purple -->
      <line
        x1="${center + lineStart * 0.7}"
        y1="${center + lineStart * 0.7}"
        x2="${center + lineEnd * 0.7}"
        y2="${center + lineEnd * 0.7}"
        stroke="${PURPLE}"
        stroke-width="${lineStroke}"
        stroke-linecap="round"
      />

      <!-- Control circle - purple -->
      <circle
        cx="${center}"
        cy="${center}"
        r="${circleRadius}"
        fill="none"
        stroke="${PURPLE}"
        stroke-width="${circleStroke}"
      />

      <!-- Depression symbol - brown -->
      <path
        d="M ${center - depressionHalfWidth} ${center - depressionDepth * 0.3}
           A ${depressionHalfWidth * 1.2} ${depressionDepth * 1.5} 0 0 0 ${center + depressionHalfWidth} ${center - depressionDepth * 0.3}"
        fill="none"
        stroke="${BROWN}"
        stroke-width="${depressionStroke}"
        stroke-linecap="round"
      />
    </svg>
  `.trim();
}

// Generate icons at different sizes
async function generateIcons() {
  console.log('Generating Course View app icons...');

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 }
  ];

  for (const { name, size } of sizes) {
    const svg = createIconSVG(size);
    const outputPath = `./public/${name}`;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
