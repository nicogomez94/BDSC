import express from 'express';
import { getAllTrainers, getTrainerBySlug } from '../controllers/trainerController.js';

const router = express.Router();

router.get('/', getAllTrainers);
router.get('/:slug', getTrainerBySlug);

export default router;
