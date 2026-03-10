import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './VirtualLibraryCategory.css';

const VirtualLibraryCategory = () => {
  const { sectionSlug, categorySlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.library.getCategoryPage(sectionSlug, categorySlug);
        if (mounted) setPageData(data);
      } catch (err) {
        if (mounted) setError(err.message || 'No se pudo cargar la biblioteca virtual.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPage();

    return () => {
      mounted = false;
    };
  }, [sectionSlug, categorySlug]);

  return (
    <div className="virtual-library-page">
      <header className="virtual-library-hero">
        <div className="container">
          <h1>Biblioteca virtual</h1>
          {pageData && (
            <p>
              {pageData.section.name} - {pageData.category.name}
            </p>
          )}
        </div>
      </header>

      <div className="container virtual-library-body">
        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && pageData && (
          <>
            {pageData.categories?.length > 0 && (
              <nav className="virtual-library-categories" aria-label="Categorías de biblioteca virtual">
                {pageData.categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/biblioteca-virtual/${pageData.section.slug}/${category.slug}`}
                    className={category.slug === pageData.category.slug ? 'active' : ''}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            )}

            {pageData.category.videos?.length > 0 ? (
              <div className="virtual-library-grid">
                {pageData.category.videos.map((video) => (
                  <article key={video.id} className="virtual-library-card">
                    <h3>{video.title}</h3>
                    <a href={video.url} target="_blank" rel="noreferrer">
                      Ver video
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <p>No hay videos cargados en esta categoría.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VirtualLibraryCategory;
