import Comment from './comment.model.js';
import Publication from '../publication/publication.model.js';
import User from '../user/user.model.js';

export const createComment = async (req, res) => {
    try {
        // Verificar los campos requeridos en el cuerpo de la solicitud
        const { publicationId, userId, text } = req.body;
        if (!publicationId || !userId || !text) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        // Buscar el usuario asociado al ID proporcionado
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Buscar la publicación asociada al ID proporcionado
        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).send({ message: 'Publication not found' });
        }

        // Crear una nueva instancia de comentario
        const newComment = new Comment({
            publicationId,
            userId,
            text,
        });

        // Guardar el nuevo comentario en la base de datos
        const savedComment = await newComment.save();

        // Responder con un mensaje de éxito, incluyendo el título de la publicación, el ID y el nombre del usuario
        return res.status(201).send({ 
            message: 'Comment added successfully', 
            comment: { 
                _id: savedComment._id,
                publicationTitle: publication.title, // Mostrar el título en lugar del ID
                userId: user._id, // Mostrar el ID del usuario
                userName: user.name, // Mostrar el nombre del usuario
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
        const userId = req.user._id; // Suponiendo que el usuario se encuentra en el token JWT

        // Verificar si el comentario existe
        const existingComment = await Comment.findById(commentId);
        if (!existingComment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // Verificar si el usuario tiene permiso para editar el comentario
        if (existingComment.userId.toString() !== userId.toString()) {
            return res.status(403).send({ message: 'You are not authorized to edit this comment' });
        }

        // Actualizar el comentario con los campos proporcionados en la solicitud
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
        
        // Verificar si req.user está definido y tiene la propiedad _id
        const userId = req.user && req.user._id;

        // Verificar si userId está definido
        if (!userId) {
            return res.status(403).send({ message: 'User not authenticated or missing user ID' });
        }

        // Buscar el comentario que se desea eliminar
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // Verificar si el usuario tiene permiso para eliminar el comentario
        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).send({ message: 'You are not authorized to delete this comment' });
        }

        // Eliminar el comentario de la base de datos
        await Comment.findByIdAndDelete(commentId);

        return res.status(200).send({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error deleting comment' });
    }
};