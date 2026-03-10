import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { SITE_SECTION_KEYS } from '../config/siteContentDefaults';

const SECTION_OPTIONS = [
  { key: SITE_SECTION_KEYS.COORDINACION, label: 'Coordinación' },
  { key: SITE_SECTION_KEYS.RECURSOS, label: 'Recursos' },
];

const emptySubdivisionForm = {
  sectionKey: SITE_SECTION_KEYS.COORDINACION,
  name: '',
  description: '',
  sortOrder: 0,
};

const emptyPageForm = {
  subdivisionId: '',
  title: '',
  summary: '',
  content: '',
  sortOrder: 0,
};

const AdminSiteContentTab = ({ data, onReload, withLoad }) => {
  const [subdivisionForm, setSubdivisionForm] = useState(emptySubdivisionForm);
  const [pageForm, setPageForm] = useState(emptyPageForm);

  const groupedData = useMemo(
    () =>
      SECTION_OPTIONS.map((section) => ({
        ...section,
        subdivisions: data.filter((item) => item.sectionKey === section.key),
      })),
    [data]
  );

  const handleCreateSubdivision = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createSiteSubdivision(subdivisionForm);
      setSubdivisionForm(emptySubdivisionForm);
      await onReload();
    });
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createSitePage({
        ...pageForm,
        subdivisionId: Number(pageForm.subdivisionId),
      });
      setPageForm(emptyPageForm);
      await onReload();
    });
  };

  return (
    <div className="tab-content">
      <h2>Menú principal: Coordinación y Recursos</h2>

      <div className="virtual-library-admin-grid">
        <form className="admin-form" onSubmit={handleCreateSubdivision}>
          <h3>Crear subdivisión</h3>
          <div className="form-group">
            <label>Sección</label>
            <select
              value={subdivisionForm.sectionKey}
              onChange={(e) => setSubdivisionForm((current) => ({ ...current, sectionKey: e.target.value }))}
              required
            >
              {SECTION_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Nombre de subdivisión</label>
            <input
              value={subdivisionForm.name}
              onChange={(e) => setSubdivisionForm((current) => ({ ...current, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={subdivisionForm.description}
              onChange={(e) => setSubdivisionForm((current) => ({ ...current, description: e.target.value }))}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={subdivisionForm.sortOrder}
              onChange={(e) => setSubdivisionForm((current) => ({ ...current, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <button type="submit" className="btn-primary">Crear subdivisión</button>
        </form>

        <form className="admin-form" onSubmit={handleCreatePage}>
          <h3>Crear página</h3>
          <div className="form-group">
            <label>Subdivisión</label>
            <select
              value={pageForm.subdivisionId}
              onChange={(e) => setPageForm((current) => ({ ...current, subdivisionId: e.target.value }))}
              required
            >
              <option value="">Seleccionar</option>
              {data.map((subdivision) => (
                <option key={subdivision.id} value={subdivision.id}>
                  {subdivision.sectionKey === SITE_SECTION_KEYS.COORDINACION ? 'Coordinación' : 'Recursos'} - {subdivision.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Título de página</label>
            <input
              value={pageForm.title}
              onChange={(e) => setPageForm((current) => ({ ...current, title: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Resumen</label>
            <input
              value={pageForm.summary}
              onChange={(e) => setPageForm((current) => ({ ...current, summary: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Contenido</label>
            <textarea
              value={pageForm.content}
              onChange={(e) => setPageForm((current) => ({ ...current, content: e.target.value }))}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={pageForm.sortOrder}
              onChange={(e) => setPageForm((current) => ({ ...current, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <button type="submit" className="btn-primary">Crear página</button>
        </form>
      </div>

      <div className="sections-list">
        {groupedData.map((section) => (
          <div className="section-card" key={section.key}>
            <h3>{section.label}</h3>
            {section.subdivisions.length === 0 && <p>Sin subdivisiones cargadas.</p>}

            {section.subdivisions.map((subdivision) => (
              <div className="virtual-library-category-item" key={subdivision.id}>
                <div className="section-header">
                  <h4>{subdivision.name}</h4>
                  <div className="row-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const name = prompt('Nombre de subdivisión', subdivision.name);
                        if (!name) return;
                        const description = prompt('Descripción', subdivision.description || '') || '';
                        const sortOrder = prompt('Orden', subdivision.sortOrder);
                        withLoad(async () => {
                          await api.admin.updateSiteSubdivision(subdivision.id, {
                            name,
                            description,
                            sortOrder: Number(sortOrder) || 0,
                          });
                          await onReload();
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => {
                        if (!confirm('¿Eliminar subdivisión y todas sus páginas?')) return;
                        withLoad(async () => {
                          await api.admin.deleteSiteSubdivision(subdivision.id);
                          await onReload();
                        });
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                {subdivision.description && <p>{subdivision.description}</p>}

                {subdivision.pages?.length > 0 ? (
                  <ul className="virtual-library-videos">
                    {subdivision.pages.map((page) => (
                      <li key={page.id}>
                        <span>{page.title}</span>
                        <div className="row-actions">
                          <button
                            className="btn-secondary btn-small"
                            onClick={() => {
                              const title = prompt('Título', page.title);
                              if (!title) return;
                              const summary = prompt('Resumen', page.summary || '') || '';
                              const content = prompt('Contenido', page.content || '') || '';
                              const sortOrder = prompt('Orden', page.sortOrder);
                              withLoad(async () => {
                                await api.admin.updateSitePage(page.id, {
                                  title,
                                  summary,
                                  content,
                                  sortOrder: Number(sortOrder) || 0,
                                });
                                await onReload();
                              });
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn-danger btn-small"
                            onClick={() => {
                              if (!confirm('¿Eliminar página?')) return;
                              withLoad(async () => {
                                await api.admin.deleteSitePage(page.id);
                                await onReload();
                              });
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Sin páginas en esta subdivisión.</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSiteContentTab;
