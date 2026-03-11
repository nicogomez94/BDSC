import express from 'express';
import {
  getSiteContentBySection,
  getSitePage,
  getPublicAttendanceDivisions,
  getPublicAttendanceMatrix,
} from '../controllers/siteContentController.js';

const router = express.Router();

router.get('/attendance/divisions/list', getPublicAttendanceDivisions);
router.get('/attendance/matrix/list', getPublicAttendanceMatrix);
router.get('/:sectionKey', getSiteContentBySection);
router.get('/:sectionKey/:subdivisionSlug/:pageSlug', getSitePage);

export default router;
