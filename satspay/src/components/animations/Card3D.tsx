import React, { useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  glowEffect?: boolean;
}

const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  intensity = 'medium',
  glowEffect = false,
}) => {
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY;
    const rotateY = (centerX - x) / centerX;
    
    const intensityMultiplier = {
      subtle: 5,
      medium: 10,
      strong: 15,
    }[intensity];
    
    setTransform(
      `perspective(1000px) rotateX(${rotateX * intensityMultiplier}deg) rotateY(${rotateY * intensityMultiplier}deg) translateZ(10px)`
    );
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
  };

  const glowClasses = glowEffect ? 'animate-glow' : '';
  
  return (
    <div
      className={`
        transition-transform duration-200 ease-out transform-gpu
        ${glowClasses}
        ${className}
      `}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default Card3D;