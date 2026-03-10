import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const toSectionPath = (sectionKey) => String(sectionKey || '').toLowerCase();

const getPagePath = (sectionKey, subdivisionSlug, pageSlug) => {
  if (sectionKey === 'COORDINACION' && subdivisionSlug === 'gestion-interna' && pageSlug === 'entrenadores') {
    return '/coordinacion/gestion-interna/coordinadores';
  }
  if (sectionKey === 'COORDINACION' && subdivisionSlug === 'gestion-interna' && pageSlug === 'preparadores-fisicos') {
    return '/coordinacion/gestion-interna/preparadores-fisicos';
  }

  return `/contenido/${toSectionPath(sectionKey)}/${subdivisionSlug}/${pageSlug}`;
};

const SiteSectionLanding = ({ sectionKey, title, intro, fallbackData = [] }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.siteContent.getBySection(sectionKey);
        if (mounted) setData(Array.isArray(response) ? response : []);
      } catch (err) {
        if (mounted) {
          setError(err.message || 'No se pudo cargar el contenido.');
          setData([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [sectionKey]);

  const groups = useMemo(() => (data.length > 0 ? data : fallbackData), [data, fallbackData]);

  return (
    <div className="section-landing">
      <header className="section-landing-hero">
        <div className="container">
          <h1>{title}</h1>
          <p>{intro}</p>

          <nav className="section-top-nav" aria-label={`Subsecciones de ${title.toLowerCase()}`}>
            {groups.map((group) => (
              <a key={group.id} href={`#${group.slug}`} className="section-chip">
                {group.name}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="container">
        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}

        {groups.map((group) => (
          <section key={group.id} id={group.slug} className="section-block">
            <h2 className="section-block-title">{group.name}</h2>
            <p>{group.description || 'Sin descripción.'}</p>

            <div className="section-item-grid">
              {(group.pages || []).map((page) => (
                <article key={page.id} className="section-item-card">
                  <h3 className="section-item-title">{page.title}</h3>
                  {page.summary && <p className="section-item-summary">{page.summary}</p>}
                  <Link to={getPagePath(sectionKey, group.slug, page.slug)} className="section-item-action">
                    Abrir página
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SiteSectionLanding;
