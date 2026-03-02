import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project }) => {
  return (
    <Link to={`/project/${project.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
         <img src={project.image} alt={project.name} />
      </div>
      <div className={styles.info}>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className={styles.footer}>
          <span style={{ color: project.color }}>Ver Dashboard →</span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;