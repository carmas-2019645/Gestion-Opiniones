import express from 'express'
import {validateJwt} from '../middlewares/validate-jwt.js';
import {addCategory} from './category.controller.js'

const api = express.Router();

api.post('/addCategory',  [validateJwt], addCategory)


export default api