import React from 'react';
import styles from './TarsHero.module.css';

const TarsHero = ({ product }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.badge}>Producto Estrella</span>
        <h1>{product.name}</h1>
        <p className={styles.tagline}>{product.tagline}</p>
        <p className={styles.description}>{product.description}</p>
        <button className={styles.mainBtn}>Explorar Prototipo</button>
      </div>
      <div className={styles.imagePlaceholder}>
        {/* Aquí irá la foto elegante de Tars */}
        <img src="/assets/tars-render.png" alt="Tars Prototipo" />
      </div>
    </section>
  );
};

export default TarsHero;