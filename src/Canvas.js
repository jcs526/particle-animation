import React, { useRef, useEffect, useState } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);
  const redCanvasRef = useRef(null);
  const [simulationData, setSimulationData] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSimulationReady, setIsSimulationReady] = useState(false);

  const particleCount = 500;
  const particleRadius = 5;
  const totalFrames = 6000; // 10초 동안 60FPS로 재생
  const restitution = 1; // 탄성 계수 (1이면 완전 탄성, 0이면 완전 비탄성)

  const startSimulation = () => {
    setIsCalculating(true);
    setIsSimulationReady(false);
    const canvas = canvasRef.current;
    const canvasRadius = canvas.width / 2;

    // 초기 입자 생성
    const particles = generateInitialParticles(canvasRadius);

    const frames = [];

    // 시뮬레이션 미리 계산
    for (let frame = 0; frame < totalFrames; frame++) {
      updateParticles(particles, canvasRadius);
      frames.push(particles.map(p => ({ x: p.x, y: p.y, radius: p.radius })));
    }

    setSimulationData(frames);
    setIsCalculating(false);
    setIsSimulationReady(true); // 계산이 완료되면 시뮬레이션 준비 완료 상태로 전환
  };

  const generateInitialParticles = (canvasRadius) => {
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      let x, y;
      let overlapping = true;
      let attempts = 0;

      // 입자들이 겹치지 않도록 위치를 생성
      while (overlapping && attempts < 1000) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (canvasRadius - particleRadius * 2) + particleRadius;
        x = canvasRadius + Math.cos(angle) * distance;
        y = canvasRadius + Math.sin(angle) * distance;

        overlapping = particles.some(p => {
          const dx = p.x - x;
          const dy = p.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist < particleRadius * 2;
        });

        attempts++;
      }

      const velocityMagnitude = 1;
      const velocityAngle = Math.random() * Math.PI * 2;
      const velocityX = Math.cos(velocityAngle) * velocityMagnitude;
      const velocityY = Math.sin(velocityAngle) * velocityMagnitude;

      particles.push({
        x,
        y,
        radius: particleRadius,
        velocityX,
        velocityY,
        mass: 1,
      });
    }

    return particles;
  };

  const updateParticles = (particles, canvasRadius) => {
    particles.forEach(p => {
      // 위치 업데이트
      p.x += p.velocityX;
      p.y += p.velocityY;

      // 벽과의 충돌 처리
      const distFromCenter = Math.sqrt((p.x - canvasRadius) ** 2 + (p.y - canvasRadius) ** 2);
      if (distFromCenter + p.radius > canvasRadius) {
        const angle = Math.atan2(p.y - canvasRadius, p.x - canvasRadius);
        const normalX = Math.cos(angle);
        const normalY = Math.sin(angle);
        const relativeVelocity = p.velocityX * normalX + p.velocityY * normalY;
        p.velocityX -= (1 + restitution) * relativeVelocity * normalX;
        p.velocityY -= (1 + restitution) * relativeVelocity * normalY;

        // 벽 안쪽으로 위치 보정
        const overlap = distFromCenter + p.radius - canvasRadius;
        p.x -= normalX * overlap;
        p.y -= normalY * overlap;
      }
    });

    // 입자 간의 충돌 처리
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p1.radius + p2.radius) {
          // 충돌 정상 벡터
          const normalX = dx / dist;
          const normalY = dy / dist;

          // 상대 속도
          const relativeVelocityX = p2.velocityX - p1.velocityX;
          const relativeVelocityY = p2.velocityY - p1.velocityY;
          const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

          if (velocityAlongNormal > 0) continue; // 이미 멀어지는 경우

          const impulse = (-(1 + restitution) * velocityAlongNormal) / 2; // 2로 나누어 에너지 과잉 방지
          const impulseX = impulse * normalX;
          const impulseY = impulse * normalY;

          p1.velocityX -= impulseX;
          p1.velocityY -= impulseY;
          p2.velocityX += impulseX;
          p2.velocityY += impulseY;

          // 겹침 보정
          const overlap = (p1.radius + p2.radius - dist) / 2;
          p1.x -= normalX * overlap;
          p1.y -= normalY * overlap;
          p2.x += normalX * overlap;
          p2.y += normalY * overlap;
        }
      }
    }
  };

  const renderSimulation = () => {
    if (isSimulationReady) {
      const canvas = canvasRef.current;
      const redCanvas = redCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const redCtx = redCanvas.getContext('2d');
      const canvasRadius = canvas.width / 2;
      let frameIndex = 0;

      const animate = () => {
        // 파란색 입자들이 그려지는 메인 캔버스는 매 프레임마다 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 원형 경계선 그리기
        ctx.beginPath();
        ctx.arc(canvasRadius, canvasRadius, canvasRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        const frameData = simulationData[frameIndex];
        frameData.forEach((p, i) => {
          const targetCtx = i === 0 ? redCtx : ctx; // 첫 번째 입자는 redCtx, 나머지는 ctx 사용
          targetCtx.beginPath();
          targetCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          targetCtx.fillStyle = i === 0 ? 'red' : 'blue';
          targetCtx.fill();
          targetCtx.closePath();
        });

        frameIndex++;
        setProgress((frameIndex / simulationData.length) * 100);

        if (frameIndex < simulationData.length) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };

  useEffect(() => {
    if (isSimulationReady) {
      renderSimulation(); // 시뮬레이션이 준비되면 애니메이션 시작
    }
  }, [isSimulationReady]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '800px', margin: '20px auto' }}>
      <button 
        onClick={startSimulation} 
        disabled={isCalculating || isSimulationReady}
        style={{
          position: 'relative',
          zIndex: 3, // 버튼을 가장 위에 위치시킴
          marginBottom: '20px',
        }}
      >
        {isCalculating ? 'Calculating...' : 'Start Simulation'}
      </button>
      <div>Progress: {Math.round(progress)}%</div>
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />
      <canvas
        ref={redCanvasRef}
        width={800}
        height={800}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          pointerEvents: 'none', // 클릭 이벤트가 이 캔버스를 통과하도록 설정
        }}
      />
    </div>
  );
};

export default Canvas;
