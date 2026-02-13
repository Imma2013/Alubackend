const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(canvas, size) {
    const ctx = canvas.getContext('2d');
    const center = size / 2;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background - Deep gradient with subtle texture
    const bgGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.7);
    bgGradient.addColorStop(0, '#1a1a1a');
    bgGradient.addColorStop(0.5, '#0d0d0d');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);

    // Add subtle noise texture
    for (let i = 0; i < size * 2; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const opacity = Math.random() * 0.03;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Main symbol - Abstract "A" with neural network inspiration
    ctx.save();
    ctx.translate(center, center);

    // Golden gradient for main elements
    const goldGradient = ctx.createLinearGradient(-size * 0.3, -size * 0.3, size * 0.3, size * 0.3);
    goldGradient.addColorStop(0, '#F5D060');
    goldGradient.addColorStop(0.5, '#D4A017');
    goldGradient.addColorStop(1, '#B8860B');

    // Draw stylized "A" with geometric precision
    ctx.strokeStyle = goldGradient;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Left leg of A
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, size * 0.3);
    ctx.lineTo(0, -size * 0.3);
    ctx.stroke();

    // Right leg of A
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.3);
    ctx.lineTo(0, -size * 0.3);
    ctx.stroke();

    // Crossbar - positioned as AI neural connection
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, size * 0.05);
    ctx.lineTo(size * 0.15, size * 0.05);
    ctx.stroke();

    // Neural network nodes - small circles at key points
    const nodeSize = size * 0.035;
    const nodes = [
        [0, -size * 0.3],           // Top
        [-size * 0.15, size * 0.05], // Left crossbar
        [size * 0.15, size * 0.05],  // Right crossbar
        [-size * 0.25, size * 0.3],  // Bottom left
        [size * 0.25, size * 0.3],   // Bottom right
    ];

    // Glow effect for nodes
    ctx.shadowColor = '#D4A017';
    ctx.shadowBlur = size * 0.05;

    nodes.forEach(([x, y]) => {
        ctx.fillStyle = goldGradient;
        ctx.beginPath();
        ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(x - nodeSize * 0.3, y - nodeSize * 0.3, nodeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Add connecting pulse lines (subtle)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(212, 160, 23, 0.3)';
    ctx.lineWidth = size * 0.015;
    ctx.setLineDash([size * 0.02, size * 0.02]);

    // Horizontal connections
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, size * 0.05);
    ctx.lineTo(size * 0.15, size * 0.05);
    ctx.stroke();

    ctx.setLineDash([]);

    // Outer ring - orbital accent
    ctx.strokeStyle = 'rgba(212, 160, 23, 0.15)';
    ctx.lineWidth = size * 0.01;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    // Second ring for depth
    ctx.strokeStyle = 'rgba(212, 160, 23, 0.08)';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Corner accent - tiny sparkle effect
    const sparkleSize = size * 0.08;
    ctx.fillStyle = goldGradient;
    ctx.save();
    ctx.translate(size * 0.85, size * 0.15);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-sparkleSize / 2, -sparkleSize * 0.1, sparkleSize, sparkleSize * 0.2);
    ctx.fillRect(-sparkleSize * 0.1, -sparkleSize / 2, sparkleSize * 0.2, sparkleSize);
    ctx.restore();
}

// Generate both icons
console.log('🎨 Generating Alu PWA icons...\n');

const sizes = [192, 512];
sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);

    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(__dirname, 'public', `icon-${size}.png`);

    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Generated: icon-${size}.png (${(buffer.length / 1024).toFixed(1)} KB)`);
});

console.log('\n🎉 PWA icons generated successfully!');
console.log('📍 Location: alu-frontend/public/\n');
