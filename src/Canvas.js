// src/Canvas.js
import React, { useRef, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];

    class Particle {
      constructor(x, y, radius, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
      }

      update(particles) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 벽 충돌 감지
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
          this.velocityX = -this.velocityX;
        }

        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
          this.velocityY = -this.velocityY;
        }

        // 입자 충돌 감지
        for (let other of particles) {
          if (this !== other) {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + other.radius) {
              // 속도 교환
              [this.velocityX, other.velocityX] = [other.velocityX, this.velocityX];
              [this.velocityY, other.velocityY] = [other.velocityY, this.velocityY];
            }
          }
        }

        this.draw();
      }
    }

    for (let i = 0; i < 10; i++) {
      const radius = 10;
      const x = Math.random() * (canvas.width - radius * 2) + radius;
      const y = Math.random() * (canvas.height - radius * 2) + radius;
      const velocityX = (Math.random() - 0.5) * 2;
      const velocityY = (Math.random() - 0.5) * 2;
      particles.push(new Particle(x, y, radius, velocityX, velocityY));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => particle.update(particles));
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '2px solid black' }}
    />
  );
};

export default Canvas;
