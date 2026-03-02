import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import DashboardOutlinedIcon    from '@mui/icons-material/DashboardOutlined';
import RouterOutlinedIcon       from '@mui/icons-material/RouterOutlined';
import MapOutlinedIcon          from '@mui/icons-material/MapOutlined';
import ShieldOutlinedIcon       from '@mui/icons-material/ShieldOutlined';
import BoltOutlinedIcon         from '@mui/icons-material/BoltOutlined';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';

const NAV_CARDS = [
  { icon: DashboardOutlinedIcon, label: 'Dashboard', desc: 'Health metrics & history at a glance.', path: '/dashboard', accent: '#22c55e' },
  { icon: MapOutlinedIcon,       label: 'Location',  desc: 'Real-time map of your IoT devices.',  path: '/map',       accent: '#3b82f6' },
  { icon: RouterOutlinedIcon,    label: 'Devices',   desc: 'Manage sensors and check status.',    path: '/devices',   accent: '#f59e0b' },
];

const FEATURES = [
  { icon: BoltOutlinedIcon,         title: 'Real-time streaming',  desc: 'Sensor data is collected and visualized with sub-second latency via the Orion Context Broker.' },
  { icon: ShieldOutlinedIcon,       title: 'Secure by design',     desc: 'OAuth2 authentication with Keyrock IDM ensures only authorized users access platform data.' },
  { icon: DevicesOtherOutlinedIcon, title: 'Multi-device support', desc: 'Monitor any number of heterogeneous IoT sensors — temperature, humidity, CO₂, noise, and more.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      {/* Subtle grid background */}
      <div className="home-bg" aria-hidden="true">
        <div className="home-bg-grid" />
        <div className="home-bg-glow" />
      </div>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-eyebrow">AgeVital+ IoT Platform</div>
        <h1 className="home-title">
          Smart monitoring<br />for healthy aging
        </h1>
        <p className="home-sub">
          AgeVital+ connects non-invasive sensors at home to collect real-time data on physical
          health and environment. Anomalies are detected automatically, enabling proactive care.
        </p>
        <div className="home-cta-row">
          <button className="home-btn home-btn--primary" onClick={() => navigate('/dashboard')}>
            Open Dashboard <span className="home-arrow">→</span>
          </button>
          <button className="home-btn home-btn--ghost" onClick={() => navigate('/devices')}>
            View Devices
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="home-stats-row">
        {[
          { val: 'Real-time', sub: 'Data streaming'  },
          { val: '24 / 7',   sub: 'Monitoring'       },
          { val: 'IoT',      sub: 'Sensor network'   },
          { val: 'OAuth2',   sub: 'Secure access'    },
        ].map(({ val, sub }) => (
          <div key={val} className="home-stat">
            <span className="home-stat-val">{val}</span>
            <span className="home-stat-sub">{sub}</span>
          </div>
        ))}
      </section>

      {/* ── Quick Access ── */}
      <section className="home-section">
        <p className="home-section-label">Quick access</p>
        <div className="home-nav-cards">
          {NAV_CARDS.map(({ icon: Icon, label, desc, path, accent }, i) => (
            <button
              key={label}
              className="home-nav-card"
              style={{ '--accent': accent, animationDelay: `${i * 70}ms` }}
              onClick={() => navigate(path)}
            >
              <div className="home-nav-icon">
                <Icon style={{ fontSize: 20, color: accent }} />
              </div>
              <div className="home-nav-body">
                <span className="home-nav-label">{label}</span>
                <span className="home-nav-desc">{desc}</span>
              </div>
              <span className="home-nav-arrow" style={{ color: accent }}>→</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-section home-section--wide">
        <p className="home-section-label">Platform capabilities</p>
        <div className="home-features">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="home-feature" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="home-feature-icon">
                <Icon style={{ fontSize: 18, color: '#22c55e' }} />
              </div>
              <h3 className="home-feature-title">{title}</h3>
              <p className="home-feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}