import React, { useRef, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const canvasRadius = canvas.width / 2;

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

        // 원형 경계 내 충돌 감지
        const distanceFromCenter = Math.sqrt(
          (this.x - canvasRadius) ** 2 + (this.y - canvasRadius) ** 2
        );
        if (distanceFromCenter + this.radius > canvasRadius) {
          // 경계를 넘으면 속도를 반전시킴
          const angle = Math.atan2(this.y - canvasRadius, this.x - canvasRadius);
          this.velocityX = -Math.cos(angle) * Math.abs(this.velocityX);
          this.velocityY = -Math.sin(angle) * Math.abs(this.velocityY);
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
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (canvasRadius - radius);
      const x = canvasRadius + Math.cos(angle) * distance;
      const y = canvasRadius + Math.sin(angle) * distance;
      const velocityX = (Math.random() - 0.5) * 2;
      const velocityY = (Math.random() - 0.5) * 2;
      particles.push(new Particle(x, y, radius, velocityX, velocityY));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(canvasRadius, canvasRadius, canvasRadius, 0, Math.PI * 2);
      ctx.clip(); // 원형 영역으로 클립

      particles.forEach(particle => particle.update(particles));
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      style={{
        border: '2px solid black',
        borderRadius: '50%',
        width: '800px',
        height: '800px',
        display: 'block',
        margin: '0 auto',
        overflow: 'hidden'
      }}
    />
  );
};

export default Canvas;
