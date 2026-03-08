import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const DEVICE_ID = 'tarscasa';

const SENSOR_META = {
  temperature: { icon: '🌡️', label: 'Temperatura', unit: '°C', range: '18-26°C', desc: 'Confort térmico óptimo' },
  humidity:    { icon: '💧', label: 'Humedad',     unit: '%',  range: '40-60%', desc: 'Salud respiratoria' },
  illuminance: { icon: '💡', label: 'Luz',         unit: 'lx', range: '150+',   desc: 'Seguridad visual' },
  noise:       { icon: '🔊', label: 'Ruido',       unit: 'dB', range: '<55dB',  desc: 'Calidad del sueño' },
};

function useTarsValues() {
  const [values, setValues] = useState({ temperature: null, humidity: null, illuminance: null, noise: null });

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

const statusOf = (key, v) => {
  if (v === null) return 'ok';
  if (key === 'temperature' && (v < 18 || v > 26)) return 'warn';
  if (key === 'humidity'    && (v < 40 || v > 70)) return 'warn';
  if (key === 'illuminance' && v < 150)             return 'warn';
  if (key === 'noise'       && v > 55)              return 'warn';
  return 'ok';
};

function SensorCard({ icon, label, value, unit, status, range, desc }) {
  const display = value !== null && value !== undefined
    ? (typeof value === 'number' ? value.toFixed(1) : value)
    : '—';

  return (
    <div className={`home-sensor-card home-sensor-card--${status}`}>
      <div className="home-sensor-icon">{icon}</div>
      <div className="home-sensor-body">
        <span className="home-sensor-label">{label}</span>
        <span className="home-sensor-value">{display}<em>{unit}</em></span>
        <span className="home-sensor-range">{range}</span>
        <span className="home-sensor-desc">{desc}</span>
      </div>
      <span className={`home-sensor-dot home-sensor-dot--${status}`} />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const vals = useTarsValues();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-root">
      {/* Background decorativo */}
      <div className="home-bg" aria-hidden="true">
        <div className="home-bg-grid" />
        <div className="home-bg-blob home-bg-blob--1" />
        <div className="home-bg-blob home-bg-blob--2" />
      </div>

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="home-container">
          <div className="home-hero-content">
            <span className="home-eyebrow">
              <span className="home-eyebrow-dot" />
              Monitoreo en Tiempo Real
            </span>

            <h1 className="home-title">
              Optimiza el confort<br />
              <span className="home-title-accent">de tus espacios</span>
            </h1>

            <p className="home-subtitle">
              TARS monitorea temperatura, humedad, luz y ruido en tiempo real.
              Obtén insights sobre la salud y el confort de tu ambiente.
              Datos precisos, decisiones inteligentes.
            </p>

            {/* Sensores en vivo */}
            <div className="home-sensors-grid">
              {Object.entries(SENSOR_META).map(([key, meta]) => (
                <SensorCard
                  key={key}
                  icon={meta.icon}
                  label={meta.label}
                  value={vals[key]}
                  unit={meta.unit}
                  status={statusOf(key, vals[key])}
                  range={meta.range}
                  desc={meta.desc}
                />
              ))}
            </div>

            {/* Stats rápidas */}
            <div className="home-stats">
              <div className="home-stat-item">
                <div className="home-stat-number">4</div>
                <div className="home-stat-label">Variables Monitoreadas</div>
              </div>
              <div className="home-stat-divider" />
              <div className="home-stat-item">
                <div className="home-stat-number">±0.1°C</div>
                <div className="home-stat-label">Precisión Térmica</div>
              </div>
              <div className="home-stat-divider" />
              <div className="home-stat-item">
                <div className="home-stat-number">10s</div>
                <div className="home-stat-label">Actualización</div>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="home-cta-row">
              <button
                className="home-btn home-btn--primary"
                onClick={() => navigate('/dashboard')}
              >
                <span>Ver Dashboard</span>
                <span className="home-btn-arrow">→</span>
              </button>
              <button
                className="home-btn home-btn--secondary"
                onClick={() => navigate('/devices')}
              >
                <span>Gestionar Sensores</span>
              </button>
            </div>

            <div className="home-live-badge">
              <span className="home-live-dot" />
              TARS activo • Actualizando en vivo
            </div>
          </div>

          {/* Highlight visual */}
          <div className="home-hero-highlight">
            <div className="home-highlight-card">
              <div className="home-highlight-content">
                <div className="home-highlight-title">Panel de Control</div>
                <p className="home-highlight-text">
                  Accede a gráficos detallados, históricos completos y análisis en profundidad de cada variable ambiental.
                </p>
                <div className="home-highlight-features">
                  <span className="home-feature-tag">📊 Gráficos interactivos</span>
                  <span className="home-feature-tag">⏱️ Históricos ilimitados</span>
                  <span className="home-feature-tag">🔔 Alertas automáticas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="home-features">
        <div className="home-container">
          <div className="home-section-header">
            <h2>¿Por qué monitorear tu ambiente?</h2>
            <p>Datos precisos para tomar mejores decisiones</p>
          </div>

          <div className="home-features-grid">
            {[
              {
                icon: '🌡️',
                title: 'Control Térmico Preciso',
                desc: 'Temperatura ideal (18–26°C) mejora productividad, concentración y descanso. Nuestros sensores miden con precisión ±0.1°C.',
                benefits: ['Confort óptimo', 'Ahorro energético', 'Mejor salud'],
              },
              {
                icon: '💧',
                title: 'Humedad Equilibrada',
                desc: 'Entre 40–60% previene problemas respiratorios, alergias y sequedad de piel. Ambiente más saludable garantizado.',
                benefits: ['Salud respiratoria', 'Prevención de alergias', 'Comodidad'],
              },
              {
                icon: '💡',
                title: 'Iluminación Inteligente',
                desc: 'Luz insuficiente (<150 lux) causa fatiga visual y riesgos. Mantén niveles óptimos para seguridad y bienestar.',
                benefits: ['Menos fatiga visual', 'Mayor seguridad', 'Ritmo circadiano'],
              },
              {
                icon: '🔊',
                title: 'Tranquilidad Acústica',
                desc: 'Ruido sostenido >55dB deteriora sueño, concentración y salud mental. Monitorea y controla tu ambiente sonoro.',
                benefits: ['Mejor sueño', 'Menos estrés', 'Más concentración'],
              },
            ].map((feature, i) => (
              <div key={i} className="home-feature-card">
                <div className="home-feature-icon">{feature.icon}</div>
                <h3 className="home-feature-title">{feature.title}</h3>
                <p className="home-feature-desc">{feature.desc}</p>
                <div className="home-feature-benefits">
                  {feature.benefits.map((b, j) => (
                    <span key={j} className="home-feature-benefit">✓ {b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-how">
        <div className="home-container">
          <div className="home-section-header">
            <h2>Cómo funciona TARS</h2>
            <p>De los sensores a tus decisiones</p>
          </div>

          <div className="home-steps">
            {[
              { num: '01', title: 'Captura en Vivo', desc: 'Sensores IoT miden temperatura, humedad, luz y ruido 24/7 sin interrupciones.' },
              { num: '02', title: 'Procesamiento Seguro', desc: 'Datos encriptados y almacenados en la nube. Tu privacidad siempre protegida.' },
              { num: '03', title: 'Análisis Inteligente', desc: 'Algoritmos detectan patrones, tendencias y anomalías en tiempo real.' },
              { num: '04', title: 'Decisiones Informadas', desc: 'Visualizaciones claras y alertas automáticas para actuar rápido.' },
            ].map((step, i) => (
              <div key={i} className="home-step">
                <div className="home-step-number">{step.num}</div>
                <div className="home-step-content">
                  <h3 className="home-step-title">{step.title}</h3>
                  <p className="home-step-desc">{step.desc}</p>
                </div>
                {i < 3 && <div className="home-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="home-usecases">
        <div className="home-container">
          <div className="home-section-header">
            <h2>Para todos los espacios</h2>
            <p>Hogares, oficinas, comercios, industria y más</p>
          </div>

          <div className="home-usecases-grid">
            {[
              { emoji: '🏠', title: 'Hogar', subtitle: 'Bienestar familiar', desc: 'Optimiza tu hogar para mayor salud y confort diario.' },
              { emoji: '💼', title: 'Oficina', subtitle: 'Productividad', desc: 'Ambiente ideal aumenta concentración y rendimiento.' },
              { emoji: '🏭', title: 'Industria', subtitle: 'Calidad', desc: 'Control preciso para procesos y almacenamiento.' },
              { emoji: '🏥', title: 'Salud', subtitle: 'Seguridad', desc: 'Ambientes críticos requieren monitoreo constante.' },
              { emoji: '🏪', title: 'Comercio', subtitle: 'Experiencia', desc: 'Cliente confortable = mayor satisfacción.' },
              { emoji: '🌱', title: 'Agricultura', subtitle: 'Optimización', desc: 'Condiciones ideales para cultivos y almacén.' },
            ].map((usecase, i) => (
              <div key={i} className="home-usecase-card">
                <div className="home-usecase-emoji">{usecase.emoji}</div>
                <h3 className="home-usecase-title">{usecase.title}</h3>
                <p className="home-usecase-subtitle">{usecase.subtitle}</p>
                <p className="home-usecase-desc">{usecase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="home-final-cta">
        <div className="home-container">
          <div className="home-cta-content">
            <h2>Comienza a monitorear ahora</h2>
            <p>Acceso instantáneo a datos en tiempo real de tu ambiente</p>
            <div className="home-cta-buttons">
              <button
                className="home-btn home-btn--primary home-btn--lg"
                onClick={() => navigate('/dashboard')}
              >
                Ir al Dashboard
              </button>
              <button
                className="home-btn home-btn--outline home-btn--lg"
                onClick={() => navigate('/devices')}
              >
                Ver Sensores
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="home-footer">
        <div className="home-container">
          <p>© 2024 AgeVital+. Monitoreo ambiental inteligente.</p>
        </div>
      </footer>
    </div>
  );
}