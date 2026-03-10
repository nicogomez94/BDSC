import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './SiteContentPage.css';

const normalizeSectionKey = (value) => String(value || '').toUpperCase();
const sectionLabel = (sectionKey) => (sectionKey === 'RECURSOS' ? 'Recursos' : 'Coordinación');

const SiteContentPage = () => {
  const { sectionKeySlug, subdivisionSlug, pageSlug } = useParams();
  const sectionKey = normalizeSectionKey(sectionKeySlug);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.siteContent.getPage(sectionKey, subdivisionSlug, pageSlug);
        if (mounted) setPageData(data);
      } catch (err) {
        if (mounted) setError(err.message || 'No se pudo cargar la página.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPage();
    return () => {
      mounted = false;
    };
  }, [sectionKey, subdivisionSlug, pageSlug]);

  const sectionRoute = sectionKey === 'RECURSOS' ? '/recursos' : '/coordinacion';

  return (
    <div className="site-content-page">
      <header className="site-content-hero">
        <div className="container">
          <h1>{pageData?.page?.title || 'Página'}</h1>
          <p>{sectionLabel(sectionKey)}</p>
        </div>
      </header>

      <div className="container site-content-body">
        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && pageData && (
          <article className="site-content-card">
            <p className="site-content-breadcrumb">
              {pageData.subdivision.name} / {pageData.page.title}
            </p>
            {pageData.page.summary && <p className="site-content-summary">{pageData.page.summary}</p>}
            <div className="site-content-text">
              {pageData.page.content ? (
                <p>{pageData.page.content}</p>
              ) : (
                <p>Contenido en armado.</p>
              )}
            </div>

            {pageData.pages?.length > 0 && (
              <div className="site-content-links">
                {pageData.pages.map((page) => (
                  <Link
                    key={page.id}
                    to={`/contenido/${sectionKey.toLowerCase()}/${pageData.subdivision.slug}/${page.slug}`}
                    className={page.slug === pageData.page.slug ? 'active' : ''}
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            )}

            <Link to={sectionRoute} className="site-content-back">Volver a {sectionLabel(sectionKey)}</Link>
          </article>
        )}
      </div>
    </div>
  );
};

export default SiteContentPage;
