import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Trainers.css';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const data = await api.getTrainers();
      setTrainers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando entrenadores...</div>;
  if (error) return <div className="error">Error al cargar entrenadores: {error}</div>;

  return (
    <div className="trainers-page">
      <div className="trainers-hero">
        <h1>Nuestros Entrenadores</h1>
        <p className="subtitle">
          Conocé al equipo de profesionales que lidera el hockey en BDSC
        </p>
      </div>

      <div className="trainers-content">
        <div className="container">
          <div className="trainers-grid">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="trainer-card">
                <div className="trainer-image">
                  <img 
                    src={trainer.photoUrl || 'https://via.placeholder.com/400x400/1a4d2a/f5f0e8?text=Entrenador'} 
                    alt={trainer.name} 
                  />
                </div>
                <div className="trainer-info">
                  <h3>{trainer.name}</h3>
                  {trainer.specialty && (
                    <p className="specialty">{trainer.specialty}</p>
                  )}
                  {trainer.bio && (
                    <p className="bio">{trainer.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {trainers.length === 0 && (
            <p className="no-trainers">No hay entrenadores registrados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trainers;
