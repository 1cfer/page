import React, { Suspense, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stage, useGLTF, Html } from '@react-three/drei';
import './Home.css';

/* ════════════════════════════════════════
   3D MODEL — rotación pura, sin interacción
════════════════════════════════════════ */
function TarsModel() {
  const { scene } = useGLTF('/tars_model.glb');
  const groupRef = useRef();
  
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.6;
  });

  return (
    <group ref={groupRef} position={[0.8, 0, 0]}>
      <primitive 
        object={scene} 
        scale={0.9} 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
      />
    </group>
  );
}

function CanvasFallback() {
  return (
    <Html center>
      <div className="canvas-loading">
        <div className="loading-ring" />
        <span>Cargando…</span>
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════
   SENSORES
════════════════════════════════════════ */
const DEVICE_ID = 'tarscasa';

const SENSOR_META = {
  temperature: { icon: '🌡️', label: 'Temperatura', unit: '°C', hud: 'TEMP' },
  humidity:    { icon: '💧', label: 'Humedad',     unit: '%',  hud: 'HUM'  },
  illuminance: { icon: '💡', label: 'Luz',         unit: 'lx', hud: 'LUX'  },
  noise:       { icon: '🔊', label: 'Ruido',       unit: 'dB', hud: 'dB'   },
};

function useTarsValues() {
  const [values, setValues] = useState({ 
    temperature: null, 
    humidity: null, 
    illuminance: null, 
    noise: null 
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token') || '';
    
    async function fetchValues() {
      try {
        const res = await fetch(`/v2/entities/${DEVICE_ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setValues({
          temperature: data.temperature?.value ?? null,
          humidity:    data.humidity?.value ?? null,
          illuminance: data.illuminance?.value ?? null,
          noise:       data.noise?.value ?? null,
        });
      } catch (e) {
        console.error('[TARS] fetch error:', e);
      }
    }

    fetchValues();
    const interval = setInterval(fetchValues, 10_000);
    return () => clearInterval(interval);
  }, []);

  return values;
}

/* ════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════ */
function Stat({ value, unit, label }) {
  return (
    <div className="hm-stat">
      <span className="hm-stat-val">{value}<em>{unit}</em></span>
      <span className="hm-stat-label">{label}</span>
    </div>
  );
}

function SensorCard({ icon, label, value, unit, status }) {
  const display = value !== null && value !== undefined
    ? (typeof value === 'number' ? value.toFixed(1) : value)
    : '—';
  
  return (
    <div className={`hm-sensor-card hm-sensor-card--${status}`}>
      <div className="hm-sensor-icon">{icon}</div>
      <div className="hm-sensor-body">
        <span className="hm-sensor-label">{label}</span>
        <span className="hm-sensor-value">{display}<em>{unit}</em></span>
      </div>
      <span className={`hm-sensor-dot hm-sensor-dot--${status}`} />
    </div>
  );
}

function HudStat({ label, value, unit, right }) {
  const display = value !== null && value !== undefined
    ? (typeof value === 'number' ? value.toFixed(1) : value)
    : '—';
  
  return (
    <div className={`hm-hud-stat${right ? ' hm-hud-stat--right' : ''}`}>
      <span className="hm-hud-label">{label}</span>
      <span className="hm-hud-val">{display}{unit && <em>{unit}</em>}</span>
    </div>
  );
}

const statusOf = (key, v) => {
  if (v === null) return 'ok';
  if (key === 'temperature' && (v < 18 || v > 26)) return 'warn';
  if (key === 'humidity'    && (v < 40 || v > 70)) return 'warn';
  if (key === 'illuminance' && v < 150)             return 'warn';
  if (key === 'noise'       && v > 55)              return 'warn';
  return 'ok';
};

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const vals = useTarsValues();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="hm-root">
      <div className="hm-bg" aria-hidden="true">
        <div className="hm-bg-grid" />
        <div className="hm-bg-blob hm-bg-blob--1" />
        <div className="hm-bg-blob hm-bg-blob--2" />
      </div>

      {/* ── HERO ── */}
      <section className="hm-hero">
        {/* LEFT */}
        <div className="hm-hero-left">
          <span className="hm-eyebrow">
            <span className="hm-eyebrow-dot" />
            Monitoreo Ambiental · Salud & Confort
          </span>

          <h1 className="hm-title">
            Espacios<br />
            <span className="hm-title-accent">saludables</span><br />
            para adultos mayores
          </h1>

          <p className="hm-sub">
            TARS monitorea en tiempo real temperatura, humedad, luminosidad y ruido. 
            Detecta automáticamente cuando las condiciones salen del rango óptimo y 
            envía alertas para garantizar el máximo confort térmico y bienestar.
          </p>

          {/* Live sensor cards */}
          <div className="hm-sensors-row">
            {Object.entries(SENSOR_META).map(([key, meta]) => (
              <SensorCard
                key={key}
                icon={meta.icon}
                label={meta.label}
                value={vals[key]}
                unit={meta.unit}
                status={statusOf(key, vals[key])}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="hm-stats">
            <Stat value="4"    unit=" var" label="Variables activas" />
            <div className="hm-stats-divider" />
            <Stat value="±0.1" unit="°C"  label="Precisión térmica" />
            <div className="hm-stats-divider" />
            <Stat value="10"   unit="s"   label="Intervalo actualización" />
          </div>

          {/* CTAs */}
          <div className="hm-cta-row">
            <button
              className="hm-btn hm-btn--primary hm-btn--lg"
              onClick={() => navigate('/dashboard')}
            >
              Ver Dashboard <span className="hm-btn-arrow">→</span>
            </button>
            <button
              className="hm-btn hm-btn--outline hm-btn--lg"
              onClick={() => navigate('/devices')}
            >
              Mis Dispositivos
            </button>
          </div>

          <div className="hm-live-badge">
            <span className="hm-live-dot" />
            TARS activo · En vivo ahora
          </div>
        </div>

        {/* RIGHT — 3D */}
        <div className="hm-hero-right">
          <div className="hm-canvas-shell">
            <span className="hm-corner hm-corner--tl" />
            <span className="hm-corner hm-corner--tr" />
            <span className="hm-corner hm-corner--bl" />
            <span className="hm-corner hm-corner--br" />

            <div className="hm-hud hm-hud--top">
              <span className="hm-hud-pill hm-hud-pill--green">
                <span className="hm-live-dot" /> TARS · ONLINE
              </span>
            </div>

            <div className="hm-hud hm-hud--bl">
              <HudStat label="TEMP" value={vals.temperature} unit="°C" />
              <HudStat label="HUM"  value={vals.humidity}    unit="%" />
            </div>

            <div className="hm-hud hm-hud--br">
              <HudStat label="LUX" value={vals.illuminance} unit="lx" right />
              <HudStat label="dB"  value={vals.noise} unit="" right />
            </div>

            <Canvas
              dpr={[1.5, 1.5]}
              camera={{ fov: 40, position: [-0.8, 2.6, 5] }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                pointerEvents: 'none',
              }}
              gl={{ antialias: true, powerPreference: 'low-power' }}
            >
              <Suspense fallback={<CanvasFallback />}>
                <group position={[0, 0, 0]}>
                  <Stage 
                    environment="city" 
                    intensity={0.65} 
                    contactShadow={{ blur: 2.5, opacity: 0.4 }} 
                    shadows 
                    center={false}
                  >
                    <TarsModel />
                  </Stage>
                </group>
              </Suspense>
            </Canvas>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="hm-features-section">
        <div className="hm-features-header">
          <p className="hm-section-label">Lo que monitoreamos</p>
          <h2 className="hm-features-title">Cuatro pilares del confort ambiental</h2>
        </div>

        <div className="hm-features-grid">
          {[
            {
              icon: '🌡️',
              title: 'Temperatura',
              desc: 'Medición continua con precisión ±0.1°C. Rango óptimo 18–26°C para máximo confort térmico en personas mayores.',
              metrics: ['Rango ideal: 18–26°C', 'Alerta si sale del rango'],
            },
            {
              icon: '💧',
              title: 'Humedad Relativa',
              desc: 'Sensor de humedad para prevenir problemas respiratorios y de piel. Mantén 40–60% para óptima salud.',
              metrics: ['Rango ideal: 40–60%', 'Previene sequedad'],
            },
            {
              icon: '💡',
              title: 'Iluminancia',
              desc: 'Detecta insuficiencia de luz que cause fatiga visual o riesgo de caídas. Esencial para seguridad.',
              metrics: ['Mínimo recomendado: 150 lx', 'Evita accidentes'],
            },
            {
              icon: '🔊',
              title: 'Nivel de Ruido',
              desc: 'Monitorea decibeles sostenidos. Ruido sobre 55dB eleva estrés y afecta calidad del sueño.',
              metrics: ['Alerta si > 55 dB', 'Mejora descanso'],
            },
          ].map((f) => (
            <div className="hm-feature-card" key={f.title}>
              <div className="hm-feature-icon">{f.icon}</div>
              <h3 className="hm-feature-title">{f.title}</h3>
              <p className="hm-feature-desc">{f.desc}</p>
              <div className="hm-feature-metrics">
                {f.metrics.map((m, i) => (
                  <span key={i} className="hm-feature-metric">✓ {m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="hm-how-section">
        <h2 className="hm-section-title">¿Cómo funciona TARS?</h2>
        <div className="hm-steps">
          {[
            { num: '01', title: 'Sensores IoT', desc: 'Detectan cambios en tiempo real con precisión de laboratorio.' },
            { num: '02', title: 'Nube Segura', desc: 'Datos encriptados y almacenados en servidor seguro. RGPD compliant.' },
            { num: '03', title: 'Alertas Inteligentes', desc: 'Notificaciones automáticas cuando algo sale de lo normal.' },
            { num: '04', title: 'Dashboard Intuitivo', desc: 'Visualiza toda la información de tu hogar en un solo lugar.' },
          ].map((step, i) => (
            <div className="hm-step" key={i}>
              <div className="hm-step-number">{step.num}</div>
              <div className="hm-step-content">
                <h4 className="hm-step-title">{step.title}</h4>
                <p className="hm-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="hm-benefits-section">
        <div className="hm-benefits-container">
          <div className="hm-benefits-content">
            <h2 className="hm-benefits-title">Beneficios para adultos mayores</h2>
            <ul className="hm-benefits-list">
              <li>✓ <strong>Prevención de enfermedades</strong> causadas por ambientes inadecuados</li>
              <li>✓ <strong>Mayor autonomía</strong> y confianza en el hogar</li>
              <li>✓ <strong>Monitoreo remoto</strong> que tranquiliza a la familia</li>
              <li>✓ <strong>Alertas tempranas</strong> de cambios peligrosos</li>
              <li>✓ <strong>Datos históricos</strong> para detectar patrones de salud</li>
              <li>✓ <strong>Integración simple</strong> sin complicaciones técnicas</li>
            </ul>
          </div>
          <div className="hm-benefits-visual">
            <div className="hm-benefits-card hm-benefits-card--1">
              <div className="hm-benefits-icon">🏠</div>
              <p>Hogar seguro</p>
            </div>
            <div className="hm-benefits-card hm-benefits-card--2">
              <div className="hm-benefits-icon">❤️</div>
              <p>Salud optimizada</p>
            </div>
            <div className="hm-benefits-card hm-benefits-card--3">
              <div className="hm-benefits-icon">📊</div>
              <p>Datos en vivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="hm-final-cta">
        <h2>Comienza a monitorear tu hogar hoy</h2>
        <p>Únete a cientos de familias que ya confían en TARS para el bienestar de sus seres queridos.</p>
        <button
          className="hm-btn hm-btn--primary hm-btn--xl"
          onClick={() => navigate('/devices')}
        >
          Activar TARS ahora <span className="hm-btn-arrow">→</span>
        </button>
      </section>
    </div>
  );
}