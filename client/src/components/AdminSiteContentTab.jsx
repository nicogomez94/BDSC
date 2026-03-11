import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { SITE_SECTION_KEYS } from '../config/siteContentDefaults';
import RichTextEditor from './RichTextEditor';

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
  const [modalType, setModalType] = useState(null);
  const [editingSubdivision, setEditingSubdivision] = useState(null);
  const [editingPage, setEditingPage] = useState(null);

  const groupedData = useMemo(
    () =>
      SECTION_OPTIONS.map((section) => ({
        ...section,
        subdivisions: data.filter((item) => item.sectionKey === section.key),
      })),
    [data]
  );

  const closeModal = () => {
    setModalType(null);
    setEditingSubdivision(null);
    setEditingPage(null);
  };

  const openCreateSubdivisionModal = () => {
    setSubdivisionForm(emptySubdivisionForm);
    setEditingSubdivision(null);
    setModalType('create-subdivision');
  };

  const openEditSubdivisionModal = (subdivision) => {
    if (subdivision?.isReadOnly) return;
    setSubdivisionForm({
      sectionKey: subdivision.sectionKey || SITE_SECTION_KEYS.COORDINACION,
      name: subdivision.name || '',
      description: subdivision.description || '',
      sortOrder: Number(subdivision.sortOrder) || 0,
    });
    setEditingSubdivision(subdivision);
    setModalType('edit-subdivision');
  };

  const openCreatePageModal = () => {
    setPageForm(emptyPageForm);
    setEditingPage(null);
    setModalType('create-page');
  };

  const openEditPageModal = (page, subdivisionId) => {
    if (page?.isReadOnly || page?.isSystemPage) return;
    setPageForm({
      subdivisionId: String(subdivisionId || ''),
      title: page.title || '',
      summary: page.summary || '',
      content: page.content || '',
      sortOrder: Number(page.sortOrder) || 0,
    });
    setEditingPage(page);
    setModalType('edit-page');
  };

  const handleSubmitSubdivision = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      if (editingSubdivision) {
        await api.admin.updateSiteSubdivision(editingSubdivision.id, {
          name: subdivisionForm.name,
          description: subdivisionForm.description || '',
          sortOrder: Number(subdivisionForm.sortOrder) || 0,
        });
      } else {
        await api.admin.createSiteSubdivision(subdivisionForm);
      }
      setSubdivisionForm(emptySubdivisionForm);
      closeModal();
      await onReload();
    });
  };

  const handleSubmitPage = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      if (editingPage) {
        await api.admin.updateSitePage(editingPage.id, {
          title: pageForm.title,
          summary: pageForm.summary || '',
          content: pageForm.content || '',
          sortOrder: Number(pageForm.sortOrder) || 0,
        });
      } else {
        await api.admin.createSitePage({
          ...pageForm,
          subdivisionId: Number(pageForm.subdivisionId),
        });
      }
      setPageForm(emptyPageForm);
      closeModal();
      await onReload();
    });
  };

  const handleUploadPageImage = async (file) => {
    if (!file) throw new Error('Seleccioná una imagen.');
    return api.admin.uploadSiteContentImage(file);
  };

  const modalTitleByType = {
    'create-subdivision': 'Crear subdivisión',
    'edit-subdivision': 'Editar subdivisión',
    'create-page': 'Crear página',
    'edit-page': 'Editar página',
  };

  const renderModalBody = () => {
    if (modalType === 'create-subdivision' || modalType === 'edit-subdivision') {
      return (
        <form className="admin-form" onSubmit={handleSubmitSubdivision}>
          {!editingSubdivision && (
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
          )}
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
          <button type="submit" className="btn-primary">
            {editingSubdivision ? 'Guardar cambios' : 'Crear subdivisión'}
          </button>
        </form>
      );
    }

    if (modalType === 'create-page' || modalType === 'edit-page') {
      return (
        <form className="admin-form" onSubmit={handleSubmitPage}>
          {!editingPage && (
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
          )}
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
            <RichTextEditor
              value={pageForm.content}
              onChange={(content) => setPageForm((current) => ({ ...current, content }))}
              onUploadImage={handleUploadPageImage}
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
          <button type="submit" className="btn-primary">
            {editingPage ? 'Guardar cambios' : 'Crear página'}
          </button>
        </form>
      );
    }

    return null;
  };

  return (
    <div className="tab-content site-content-admin">
      <h2>Menú principal: Coordinación y Recursos</h2>

      <div className="tab-actions">
        <button type="button" className="btn-primary" onClick={openCreateSubdivisionModal}>Crear subdivisión</button>
        <button type="button" className="btn-primary" onClick={openCreatePageModal}>Crear página</button>
      </div>

      <div className="sections-list">
        {groupedData.map((section) => (
          <div className="section-card" key={section.key}>
            <h3>{section.label}</h3>
            {section.subdivisions.length === 0 && <p>Sin subdivisiones cargadas.</p>}

            {section.subdivisions.map((subdivision) => (
              <div className="virtual-library-category-item" key={subdivision.id}>
                <div className="section-header">
                  <h4>
                    {subdivision.name}
                    {subdivision.isReadOnly && <span className="system-badge">Sistema</span>}
                  </h4>
                  <div className="row-actions">
                    {!subdivision.isReadOnly && (
                      <>
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => openEditSubdivisionModal(subdivision)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          type="button"
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
                      </>
                    )}
                  </div>
                </div>
                {subdivision.description && <p>{subdivision.description}</p>}

                {subdivision.pages?.length > 0 ? (
                  <ul className="virtual-library-videos">
                    {subdivision.pages.map((page) => (
                      <li key={page.id}>
                        <span>
                          {page.title}
                          {(page.isSystemPage || page.isReadOnly) && <span className="system-badge">Sistema</span>}
                        </span>
                        <div className="row-actions">
                          {!page.isReadOnly && !page.isSystemPage && (
                            <>
                              <button
                                className="btn-secondary btn-small"
                                type="button"
                                onClick={() => openEditPageModal(page, subdivision.id)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn-danger btn-small"
                                type="button"
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
                            </>
                          )}
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

      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-copy">
                <h3>{modalTitleByType[modalType]}</h3>
                <p>Completá los datos para continuar.</p>
              </div>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Cerrar modal">
                x
              </button>
            </div>
            <div className="modal-body">{renderModalBody()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSiteContentTab;
