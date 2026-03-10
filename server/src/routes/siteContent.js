import express from 'express';
import { getSiteContentBySection, getSitePage } from '../controllers/siteContentController.js';

const router = express.Router();

router.get('/:sectionKey', getSiteContentBySection);
router.get('/:sectionKey/:subdivisionSlug/:pageSlug', getSitePage);

export default router;
