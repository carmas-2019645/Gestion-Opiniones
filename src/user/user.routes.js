import express from 'express'
import { validateJwt} from '../middlewares/validate-jwt.js';
import {test, register,  login,  editProfile} from './user.controller.js';

const api = express.Router();
api.get('/test', [validateJwt], test)
api.post('/register', register)
api.post('/login', login)
api.put('/editProfile/:id', [validateJwt], editProfile) 

export default api