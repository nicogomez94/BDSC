import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Trainers.css';

const DEFAULT_TRAINER_IMAGE = '/default-trainer.svg';

const PhysicalTrainers = () => {
  const [physicalTrainers, setPhysicalTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPhysicalTrainers();
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.trainer-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [physicalTrainers]);

  const loadPhysicalTrainers = async () => {
    try {
      const data = await api.getTrainers();
      setPhysicalTrainers(data.filter((trainer) => trainer.type === 'PREPARADOR_FISICO'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando preparadores físicos...</div>;
  if (error) return <div className="error">Error al cargar preparadores físicos: {error}</div>;

  return (
    <div className="trainers-page">
      <div className="trainers-hero">
        <h1>Nuestros Preparadores Físicos</h1>
        <p className="subtitle">
          Conocé al equipo que lidera la preparación física del hockey en BDSC
        </p>
      </div>

      <div className="trainers-content">
        <div className="container">
          <div className="trainers-grid">
            {physicalTrainers.map((trainer) => (
              <div key={trainer.id} className="trainer-card">
                <div className="trainer-image">
                  <img
                    src={trainer.photoUrl || DEFAULT_TRAINER_IMAGE}
                    alt={trainer.name}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_TRAINER_IMAGE;
                    }}
                  />
                </div>
                <div className="trainer-info">
                  <h3>{trainer.name}</h3>
                  {trainer.specialty && <p className="specialty">{trainer.specialty}</p>}
                  {trainer.bio && <p className="bio">{trainer.bio}</p>}
                </div>
              </div>
            ))}
          </div>

          {physicalTrainers.length === 0 && (
            <p className="no-trainers">No hay preparadores físicos registrados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhysicalTrainers;
