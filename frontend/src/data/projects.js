// src/data/projects.js

export const projects = [
  {
    id: "moreha",
    name: "Moreha",
    description: "Monitoreo de variables ambientales en entornos hospitalarios inteligentes.",
    image: "/assets/moreha-preview.jpg", // Asegúrate de tener estas imágenes luego
    color: "#4285F4", // Azul Google
    devices: ["tars", "tars2"], // Los IDs que usas en Orion
  },
  {
    id: "infraestructura-verde",
    name: "Infraestructuras Verdes",
    description: "Análisis de resiliencia y biodiversidad en muros verdes universitarios.",
    image: "/assets/green-preview.jpg",
    color: "#34A853", // Verde Google
    devices: ["sensor-plant-1", "sensor-plant-2"], 
  }
];

export const heroProduct = {
  id: "tars",
  name: "TARS Prototype",
  tagline: "El futuro del monitoreo modular",
  description: "Diseñado para la máxima eficiencia y precisión, Tars es un nodo IoT versátil capaz de adaptarse a múltiples entornos con cero configuración.",
  features: ["Batería de larga duración", "Precisión industrial", "Conexión mDNS"]
};