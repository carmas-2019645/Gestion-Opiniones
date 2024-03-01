import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';
import Category from '../category/category.model.js'

'use strict'


export const validateJwt = async(req, res, next)=>{
    try{
        //Obtener
        let secretKey = process.env.SECRET_KEY
        //obtener el token
        let { authorization } = req.headers
        //Verificar
        if(!authorization) return res.status(401).send({message: 'Unauthorized'})
        //Obtener el uid
        let { uid } = jwt.verify(authorization, secretKey)
        //Validar si existe
        let user = await User.findOne({_id: uid})
        if(!user) return res.status(404).send({message: 'User not found - Unauthorized'})
        req.user = user
        next()
    }catch(err){
        console.error(err)
        return res.status(401).send({message: 'Invalid Authorization'})
    }
}