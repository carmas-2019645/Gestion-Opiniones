import Comment from './comment.model.js';
import Publication from '../publication/publication.model.js';
import User from '../user/user.model.js';

export const createComment = async (req, res) => {
    try {
        // Verifica
        const { publicationId, userId, text } = req.body;
        if (!publicationId || !userId || !text) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        // Buscar el usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Busca la publicacion
        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).send({ message: 'Publication not found' });
        }

        // Crear la nueva instancia
        const newComment = new Comment({
            publicationId,
            userId,
            text,
        });

        // Guardar
        const savedComment = await newComment.save();

        // Responder con un mensaje de éxito
        return res.status(201).send({ 
            message: 'Comment added successfully', 
            comment: { 
                _id: savedComment._id,
                publicationTitle: publication.title, 
                userId: user._id, 
                userName: user.name, 
                text: savedComment.text,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error when adding the comment to the database' });
    }
};


export const updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id; 

        // Verificar
        const existingComment = await Comment.findById(commentId);
        if (!existingComment) {
            return res.status(404).send({ message: 'Comment not found' });
        }
        // Verificar si el usuario tiene
        if (existingComment.userId.toString() !== userId.toString()) {
            return res.status(403).send({ message: 'You are not authorized to edit this comment' });
        }

        // Actualizar el comentario
        const { text } = req.body;
        if (text) {
            existingComment.text = text;
        }

        // Guardar los cambios
        await existingComment.save();

        return res.send({ message: 'Comment updated successfully', comment: existingComment });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating comment' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        
        // Verificar
        const userId = req.user && req.user._id;

        // Verificar si el fue que ingreso el comentario
        if (!userId) {
            return res.status(403).send({ message: 'User not authenticated or missing user ID' });
        }

        // Buscar el comentario
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // Verificar si el usuario tiene permiso
        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).send({ message: 'You are not authorized to delete this comment' });
        }

        // Elimina el comentario de la base de datos
        await Comment.findByIdAndDelete(commentId);

        return res.status(200).send({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error deleting comment' });
    }
};