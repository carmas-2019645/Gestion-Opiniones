import express from 'express'
import {validateJwt} from '../middlewares/validate-jwt.js'
import {createComment, updateComment, deleteComment} from './comment.controller.js'

const api = express.Router();

api.post('/createComment', [validateJwt], createComment)
api.put('/updateComment/:id', [validateJwt], updateComment)
api.delete('/deleteComment/:id',[validateJwt], deleteComment)

export default api