import { useState } from 'react';
import { api } from '../services/api';

const emptySectionForm = { name: '', sortOrder: 0 };
const emptyCategoryForm = { sectionId: '', name: '', sortOrder: 0 };
const emptyVideoForm = { categoryId: '', title: '', url: '', sortOrder: 0 };

const AdminVirtualLibraryTab = ({ sections, onReload, withLoad }) => {
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);

  const handleCreateSection = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createVirtualLibrarySection(sectionForm);
      setSectionForm(emptySectionForm);
      await onReload();
    });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createVirtualLibraryCategory({
        ...categoryForm,
        sectionId: Number(categoryForm.sectionId),
      });
      setCategoryForm(emptyCategoryForm);
      await onReload();
    });
  };

  const handleCreateVideo = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createVirtualLibraryVideo({
        ...videoForm,
        categoryId: Number(videoForm.categoryId),
      });
      setVideoForm(emptyVideoForm);
      await onReload();
    });
  };

  const allCategories = sections.flatMap((section) =>
    (section.categories || []).map((category) => ({
      ...category,
      sectionName: section.name,
    }))
  );

  return (
    <div className="tab-content">
      <h2>Biblioteca virtual</h2>

      <div className="virtual-library-admin-grid">
        <form className="admin-form" onSubmit={handleCreateSection}>
          <h3>Crear subdivisión</h3>
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
          <button type="submit" className="btn-primary">Crear subdivisión</button>
        </form>

        <form className="admin-form" onSubmit={handleCreateCategory}>
          <h3>Crear categoría</h3>
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
          <button type="submit" className="btn-primary">Crear categoría</button>
        </form>

        <form className="admin-form" onSubmit={handleCreateVideo}>
          <h3>Cargar video (link)</h3>
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
          <button type="submit" className="btn-primary">Agregar video</button>
        </form>
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
                  onClick={() => {
                    const name = prompt('Nombre de subdivisión', section.name);
                    if (!name) return;
                    const sortOrder = prompt('Orden', section.sortOrder);
                    withLoad(async () => {
                      await api.admin.updateVirtualLibrarySection(section.id, { name, sortOrder: Number(sortOrder) || 0 });
                      await onReload();
                    });
                  }}
                >
                  Editar
                </button>
                <button
                  className="btn-danger"
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
                          onClick={() => {
                            const name = prompt('Nombre de categoría', category.name);
                            if (!name) return;
                            const sortOrder = prompt('Orden', category.sortOrder);
                            withLoad(async () => {
                              await api.admin.updateVirtualLibraryCategory(category.id, {
                                name,
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
                                onClick={() => {
                                  const title = prompt('Título del video', video.title);
                                  if (!title) return;
                                  const url = prompt('Link del video', video.url);
                                  if (!url) return;
                                  const sortOrder = prompt('Orden', video.sortOrder);
                                  withLoad(async () => {
                                    await api.admin.updateVirtualLibraryVideo(video.id, {
                                      title,
                                      url,
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
    </div>
  );
};

export default AdminVirtualLibraryTab;
