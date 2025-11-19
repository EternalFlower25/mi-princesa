import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Crown } from 'lucide-react';

export default function PrincessCarousel() {
  const [particles, setParticles] = useState([]);
  const [imagePositions, setImagePositions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // CONFIGURA TU MÚSICA Y FOTOS AQUÍ
  const musicFile = "/music/Miniñabonita.mp3";
  const images = [
    "/images/1.jpeg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
  ];

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.6 + 0.3
    }));
    setParticles(newParticles);

    setTimeout(() => {
      if (audioRef.current && musicFile) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Click en play para iniciar música");
        });
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const positions = images.map(() => ({
        x: Math.random() * 70 + 15,
        y: Math.random() * 70 + 15,
        z: Math.random() * 400 - 200,
        targetZ: Math.random() * 400 - 200,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        rotation: (Math.random() - 0.5) * 30,
        rotationSpeed: (Math.random() - 0.5) * 0.3
      }));
      setImagePositions(positions);
    }
  }, [images.length]);

  useEffect(() => {
    const depthInterval = setInterval(() => {
      setImagePositions(prev => prev.map(pos => ({
        ...pos,
        targetZ: Math.random() * 400 - 200
      })));
    }, 5000);
    return () => clearInterval(depthInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImagePositions(prev => prev.map(pos => {
        let newX = pos.x + pos.speedX;
        let newY = pos.y + pos.speedY;
        
        if (newX < 10 || newX > 90) pos.speedX *= -1;
        if (newY < 10 || newY > 90) pos.speedY *= -1;
        
        newX = Math.max(10, Math.min(90, newX));
        newY = Math.max(10, Math.min(90, newY));
        
        let newZ = pos.z;
        const zDiff = pos.targetZ - pos.z;
        newZ += zDiff * 0.02;
        
        let newRotation = pos.rotation + pos.rotationSpeed;
        if (Math.abs(newRotation) > 20) {
          pos.rotationSpeed *= -1;
          newRotation = Math.max(-20, Math.min(20, newRotation));
        }
        
        return {
          ...pos,
          x: newX,
          y: newY,
          z: newZ,
          rotation: newRotation
        };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [imagePositions.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setParticles(prev => prev.map(p => {
        let newX = p.x + p.speedX;
        let newY = p.y + p.speedY;
        
        if (newX < 0 || newX > 100) p.speedX *= -1;
        if (newY < 0 || newY > 100) p.speedY *= -1;
        
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));
        
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(
          (newX / 100) * canvas.width,
          (newY / 100) * canvas.height,
          p.size,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        return { ...p, x: newX, y: newY };
      }));
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 20%, rgba(251, 207, 232, 0.9) 40%, rgba(244, 114, 182, 0.7) 100%)'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
      
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        perspective: '1000px'
      }}>
        {/* Imágenes flotantes */}
        {images.map((img, index) => {
          const pos = imagePositions[index];
          if (!pos) return null;
          
          const scale = (pos.z + 200) / 400;
          const opacity = scale * 0.7 + 0.3;
          const blur = (1 - scale) * 2;
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) translateZ(${pos.z}px) rotate(${pos.rotation}deg) scale(${scale})`,
                transformStyle: 'preserve-3d',
                zIndex: Math.round(pos.z + 200),
                opacity: opacity,
                filter: `blur(${blur}px)`,
                transition: 'all 1s ease-out'
              }}
            >
              <div style={{
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                border: '4px solid #f9a8d4',
                width: '160px',
                height: '160px'
              }}>
                <img
                  src={img}
                  alt={`Foto ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.error(`Error cargando imagen: ${img}`);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Corona y texto centrados */}
        <div style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <Crown 
            size={120} 
            style={{
              margin: '0 auto 24px',
              color: '#ec4899',
              filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))'
            }}
            fill="currentColor"
            strokeWidth={1.5}
          />
          
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#db2777',
            marginBottom: '12px',
            filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04))',
            fontFamily: 'cursive'
          }}>
            Para Mi Princesa Karumy
          </h1>
          <p style={{
            color: '#ec4899',
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
            fontWeight: '600'
          }}>
            Feliz dia de la princesa mi amochito :3
          </p>
          <p style={{
            color: '#ec4899',
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
            fontWeight: '600'
          }}>
            Por ser la princesa mas bella del mundo
          </p>
          <p style={{
            color: '#ec4899',
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
            fontWeight: '600'
          }}>
            Y por todo el amor que te tengo amochito, gracias por estar conmigo amor
          </p>
          <p style={{
            color: '#ec4899',
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
            fontWeight: '600'
          }}>
            Eres y serás siempre mi princesita pechocha :3
          </p>
          <p style={{
            color: '#ec4899',
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
            fontWeight: '600'
          }}>
            Cada día contigo es un sueño hecho realidad mi amor
          </p>
          <p style={{
            color: '#ec4899',
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
            fontWeight: '600'
          }}>
            No existe nadie más perfecta para mí que tú mi princesita hermosa :3
          </p>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#db2777',
            marginBottom: '12px',
            filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04))',
            fontFamily: 'cursive'
          }}>
            Te amo :3
          </h2>
        </div>
      </div>

      {/* Audio */}
      <audio ref={audioRef} src={musicFile} loop />
      
      {/* Botón de música */}
      <button
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          top: '32px',
          right: '32px',
          zIndex: 10000,
          backgroundColor: '#ec4899',
          color: 'white',
          padding: '16px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#db2777';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ec4899';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        title={isPlaying ? "Pausar música" : "Reproducir música"}
      >
        {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
      </button>
    </div>
  );
}