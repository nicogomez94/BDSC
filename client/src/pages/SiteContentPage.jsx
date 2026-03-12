import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import AttendanceSystemPage from './AttendanceSystemPage';
import './SiteContentPage.css';

const normalizeSectionKey = (value) => String(value || '').toUpperCase();
const sectionLabel = (sectionKey) => (sectionKey === 'RECURSOS' ? 'Recursos' : 'Coordinación');
const getPagePath = (sectionKey, subdivisionSlug, pageSlug) => {
  if (sectionKey === 'COORDINACION' && subdivisionSlug === 'gestion-interna' && pageSlug === 'entrenadores') {
    return '/coordinacion/gestion-interna/coordinadores';
  }
  if (sectionKey === 'COORDINACION' && subdivisionSlug === 'gestion-interna' && pageSlug === 'preparadores-fisicos') {
    return '/coordinacion/gestion-interna/preparadores-fisicos';
  }
  if (sectionKey === 'COORDINACION' && subdivisionSlug === 'operacion' && pageSlug === 'asistencia') {
    return '/coordinacion/operacion/asistencia';
  }
  return `/contenido/${sectionKey.toLowerCase()}/${subdivisionSlug}/${pageSlug}`;
};
const getSubpagePath = (sectionKey, subdivisionSlug, pageSlug, subpageSlug) =>
  `${getPagePath(sectionKey, subdivisionSlug, pageSlug)}/${subpageSlug}`;

const SiteContentPage = () => {
  const { sectionKeySlug, subdivisionSlug, pageSlug, subpageSlug } = useParams();
  const sectionKey = normalizeSectionKey(sectionKeySlug);
  const isAttendanceSystemPage =
    sectionKey === 'COORDINACION' && subdivisionSlug === 'operacion' && pageSlug === 'asistencia' && !subpageSlug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageData, setPageData] = useState(null);

  if (isAttendanceSystemPage) {
    return <AttendanceSystemPage />;
  }

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      setLoading(true);
      setError('');
      try {
        const data = subpageSlug
          ? await api.siteContent.getSubpage(sectionKey, subdivisionSlug, pageSlug, subpageSlug)
          : await api.siteContent.getPage(sectionKey, subdivisionSlug, pageSlug);
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
  }, [sectionKey, subdivisionSlug, pageSlug, subpageSlug]);

  const sectionRoute = sectionKey === 'RECURSOS' ? '/recursos' : '/coordinacion';
  const activeTitle = pageData?.subpage?.title || pageData?.page?.title || 'Página';
  const activeSummary = pageData?.subpage?.summary ?? pageData?.page?.summary ?? '';
  const activeContent = pageData?.subpage?.content ?? pageData?.page?.content ?? '';

  return (
    <div className="site-content-page">
      <header className="site-content-hero">
        <div className="container">
          <h1>{activeTitle}</h1>
          <p>{sectionLabel(sectionKey)}</p>
        </div>
      </header>

      <div className="container site-content-body">
        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && pageData && (
          <article className="site-content-card">
            <p className="site-content-breadcrumb">
              {pageData.subdivision.name}
              {' / '}
              {pageData.page.title}
              {pageData.subpage ? ` / ${pageData.subpage.title}` : ''}
            </p>
            {activeSummary && <p className="site-content-summary">{activeSummary}</p>}
            <div className="site-content-text">
              {activeContent ? (
                <div dangerouslySetInnerHTML={{ __html: activeContent }} />
              ) : (
                <p>Contenido en armado.</p>
              )}
            </div>

            {pageData.pages?.length > 0 && (
              <div className="site-content-links">
                {pageData.pages.map((page) => (
                  <Link
                    key={page.id}
                    to={getPagePath(sectionKey, pageData.subdivision.slug, page.slug)}
                    className={page.slug === pageData.page.slug ? 'active' : ''}
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            )}

            {pageData.subpages?.length > 0 && (
              <div className="site-content-links">
                <Link
                  to={getPagePath(sectionKey, pageData.subdivision.slug, pageData.page.slug)}
                  className={!pageData.subpage ? 'active' : ''}
                >
                  {pageData.page.title}
                </Link>
                {pageData.subpages.map((subpage) => (
                  <Link
                    key={subpage.id}
                    to={getSubpagePath(sectionKey, pageData.subdivision.slug, pageData.page.slug, subpage.slug)}
                    className={subpage.slug === pageData.subpage?.slug ? 'active' : ''}
                  >
                    {subpage.title}
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
