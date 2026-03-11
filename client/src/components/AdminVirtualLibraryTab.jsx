import { useState } from 'react';
import { api } from '../services/api';

const emptySectionForm = { name: '', sortOrder: 0 };
const emptyCategoryForm = { sectionId: '', name: '', sortOrder: 0 };
const emptyVideoForm = { categoryId: '', title: '', url: '', sortOrder: 0 };

const AdminVirtualLibraryTab = ({ sections, onReload, withLoad }) => {
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [modalType, setModalType] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  const closeModal = () => {
    setModalType(null);
    setEditingSection(null);
    setEditingCategory(null);
    setEditingVideo(null);
  };

  const openCreateSectionModal = () => {
    setSectionForm(emptySectionForm);
    setEditingSection(null);
    setModalType('create-section');
  };

  const openEditSectionModal = (section) => {
    setSectionForm({
      name: section.name || '',
      sortOrder: Number(section.sortOrder) || 0,
    });
    setEditingSection(section);
    setModalType('edit-section');
  };

  const openCreateCategoryModal = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategory(null);
    setModalType('create-category');
  };

  const openEditCategoryModal = (category) => {
    setCategoryForm({
      sectionId: String(category.sectionId || ''),
      name: category.name || '',
      sortOrder: Number(category.sortOrder) || 0,
    });
    setEditingCategory(category);
    setModalType('edit-category');
  };

  const openCreateVideoModal = () => {
    setVideoForm(emptyVideoForm);
    setEditingVideo(null);
    setModalType('create-video');
  };

  const openEditVideoModal = (video) => {
    setVideoForm({
      categoryId: String(video.categoryId || ''),
      title: video.title || '',
      url: video.url || '',
      sortOrder: Number(video.sortOrder) || 0,
    });
    setEditingVideo(video);
    setModalType('edit-video');
  };

  const handleSubmitSection = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      if (editingSection) {
        await api.admin.updateVirtualLibrarySection(editingSection.id, {
          name: sectionForm.name,
          sortOrder: Number(sectionForm.sortOrder) || 0,
        });
      } else {
        await api.admin.createVirtualLibrarySection(sectionForm);
      }
      setSectionForm(emptySectionForm);
      closeModal();
      await onReload();
    });
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      if (editingCategory) {
        await api.admin.updateVirtualLibraryCategory(editingCategory.id, {
          name: categoryForm.name,
          sortOrder: Number(categoryForm.sortOrder) || 0,
        });
      } else {
        await api.admin.createVirtualLibraryCategory({
          ...categoryForm,
          sectionId: Number(categoryForm.sectionId),
        });
      }
      setCategoryForm(emptyCategoryForm);
      closeModal();
      await onReload();
    });
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      if (editingVideo) {
        await api.admin.updateVirtualLibraryVideo(editingVideo.id, {
          title: videoForm.title,
          url: videoForm.url,
          sortOrder: Number(videoForm.sortOrder) || 0,
        });
      } else {
        await api.admin.createVirtualLibraryVideo({
          ...videoForm,
          categoryId: Number(videoForm.categoryId),
        });
      }
      setVideoForm(emptyVideoForm);
      closeModal();
      await onReload();
    });
  };

  const allCategories = sections.flatMap((section) =>
    (section.categories || []).map((category) => ({
      ...category,
      sectionName: section.name,
    }))
  );

  const modalTitleByType = {
    'create-section': 'Crear subdivisión',
    'edit-section': 'Editar subdivisión',
    'create-category': 'Crear categoría',
    'edit-category': 'Editar categoría',
    'create-video': 'Cargar video',
    'edit-video': 'Editar video',
  };

  const renderModalBody = () => {
    if (modalType === 'create-section' || modalType === 'edit-section') {
      return (
        <form className="admin-form" onSubmit={handleSubmitSection}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={sectionForm.name}
              onChange={(e) => setSectionForm((current) => ({ ...current, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={sectionForm.sortOrder}
              onChange={(e) => setSectionForm((current) => ({ ...current, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editingSection ? 'Guardar cambios' : 'Crear subdivisión'}
          </button>
        </form>
      );
    }

    if (modalType === 'create-category' || modalType === 'edit-category') {
      return (
        <form className="admin-form" onSubmit={handleSubmitCategory}>
          {!editingCategory && (
            <div className="form-group">
              <label>Subdivisión</label>
              <select
                value={categoryForm.sectionId}
                onChange={(e) => setCategoryForm((current) => ({ ...current, sectionId: e.target.value }))}
                required
              >
                <option value="">Seleccionar</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Nombre categoría</label>
            <input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((current) => ({ ...current, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={categoryForm.sortOrder}
              onChange={(e) => setCategoryForm((current) => ({ ...current, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </form>
      );
    }

    if (modalType === 'create-video' || modalType === 'edit-video') {
      return (
        <form className="admin-form" onSubmit={handleSubmitVideo}>
          {!editingVideo && (
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={videoForm.categoryId}
                onChange={(e) => setVideoForm((current) => ({ ...current, categoryId: e.target.value }))}
                required
              >
                <option value="">Seleccionar</option>
                {allCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.sectionName} - {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Título</label>
            <input
              value={videoForm.title}
              onChange={(e) => setVideoForm((current) => ({ ...current, title: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Link</label>
            <input
              type="url"
              value={videoForm.url}
              onChange={(e) => setVideoForm((current) => ({ ...current, url: e.target.value }))}
              placeholder="https://..."
              required
            />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={videoForm.sortOrder}
              onChange={(e) => setVideoForm((current) => ({ ...current, sortOrder: Number(e.target.value) }))}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editingVideo ? 'Guardar cambios' : 'Agregar video'}
          </button>
        </form>
      );
    }

    return null;
  };

  return (
    <div className="tab-content">
      <h2>Biblioteca virtual</h2>

      <div className="tab-actions">
        <button type="button" className="btn-primary" onClick={openCreateSectionModal}>Crear subdivisión</button>
        <button type="button" className="btn-primary" onClick={openCreateCategoryModal}>Crear categoría</button>
        <button type="button" className="btn-primary" onClick={openCreateVideoModal}>Agregar video</button>
      </div>

      <div className="sections-list">
        {sections.length === 0 && <p>No hay subdivisiones cargadas.</p>}
        {sections.map((section) => (
          <div className="section-card" key={section.id}>
            <div className="section-header">
              <h3>{section.name}</h3>
              <div className="row-actions">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => openEditSectionModal(section)}
                >
                  Editar
                </button>
                <button
                  className="btn-danger"
                  type="button"
                  onClick={() => {
                    if (!confirm('¿Eliminar subdivisión, categorías y videos?')) return;
                    withLoad(async () => {
                      await api.admin.deleteVirtualLibrarySection(section.id);
                      await onReload();
                    });
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>

            {section.categories?.length > 0 ? (
              <div className="virtual-library-category-list">
                {section.categories.map((category) => (
                  <div className="virtual-library-category-item" key={category.id}>
                    <div className="section-header">
                      <h4>{category.name}</h4>
                      <div className="row-actions">
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => openEditCategoryModal(category)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          type="button"
                          onClick={() => {
                            if (!confirm('¿Eliminar categoría y videos?')) return;
                            withLoad(async () => {
                              await api.admin.deleteVirtualLibraryCategory(category.id);
                              await onReload();
                            });
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    {category.videos?.length > 0 ? (
                      <ul className="virtual-library-videos">
                        {category.videos.map((video) => (
                          <li key={video.id}>
                            <a href={video.url} target="_blank" rel="noreferrer">
                              {video.title}
                            </a>
                            <div className="row-actions">
                              <button
                                className="btn-secondary btn-small"
                                type="button"
                                onClick={() => openEditVideoModal(video)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn-danger btn-small"
                                type="button"
                                onClick={() => {
                                  if (!confirm('¿Eliminar video?')) return;
                                  withLoad(async () => {
                                    await api.admin.deleteVirtualLibraryVideo(video.id);
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
                      <p>Sin videos en esta categoría.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Sin categorías en esta subdivisión.</p>
            )}
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

export default AdminVirtualLibraryTab;
