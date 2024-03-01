import express from 'express'
import { validateJwt} from '../middlewares/validate-jwt.js';
import {createPublication, updatePublication, deletePublication} from './publication.controller.js';

const api = express.Router();
api.post('/createPublication', createPublication)
api.put('/updatePublication/:id', [validateJwt], updatePublication)
api.delete('/deletePublication/:id', [validateJwt], deletePublication)

export default api