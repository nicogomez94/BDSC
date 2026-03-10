import SiteSectionLanding from '../components/SiteSectionLanding';
import { SITE_SECTION_DEFAULTS, SITE_SECTION_KEYS } from '../config/siteContentDefaults';
import './SectionLanding.css';

const Recursos = () => {
  return (
    <SiteSectionLanding
      sectionKey={SITE_SECTION_KEYS.RECURSOS}
      title="Recursos"
      intro="Biblioteca de referencia para entrenadores y coordinación. La estructura está lista para incorporar documentación y materiales por etapas."
      fallbackData={SITE_SECTION_DEFAULTS[SITE_SECTION_KEYS.RECURSOS]}
    />
  );
};

export default Recursos;
