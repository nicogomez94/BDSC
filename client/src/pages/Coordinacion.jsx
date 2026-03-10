import SiteSectionLanding from '../components/SiteSectionLanding';
import { SITE_SECTION_DEFAULTS, SITE_SECTION_KEYS } from '../config/siteContentDefaults';
import './SectionLanding.css';

const Coordinacion = () => {
  return (
    <SiteSectionLanding
      sectionKey={SITE_SECTION_KEYS.COORDINACION}
      title="Coordinación"
      intro="Centro operativo del sistema. Cada frente de trabajo queda organizado en sub-secciones para simplificar gestión, seguimiento y crecimiento."
      fallbackData={SITE_SECTION_DEFAULTS[SITE_SECTION_KEYS.COORDINACION]}
    />
  );
};

export default Coordinacion;
