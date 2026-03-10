import express from 'express';
import { getVirtualLibraryCategoryPage, getVirtualLibraryMenu } from '../controllers/virtualLibraryController.js';

const router = express.Router();

router.get('/menu', getVirtualLibraryMenu);
router.get('/:sectionSlug/:categorySlug', getVirtualLibraryCategoryPage);

export default router;
