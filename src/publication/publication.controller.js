import Publication  from './publication.model.js'
import User from '../user/user.model.js'
import Category from '../category/category.model.js'
import mongoose from 'mongoose';


export const createPublication = async (req, res) => {
    try {
        // Verificar los campos requeridos en el cuerpo de la solicitud
        const { title, categoryId, text, userId } = req.body;
        if (!title || !categoryId || !text || !userId) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        // Verificar si ya existe una publicación con el mismo título
        const existingPublication = await Publication.findOne({ title });
        if (existingPublication) {
            return res.status(400).send({ message: 'A publication with the same title already exists' });
        }

        // Buscar el usuario asociado al ID proporcionado
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Buscar la categoría asociada al ID proporcionado
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send({ message: 'Category not found' });
        }

        // Crear una nueva instancia de la publicación
        const newPublication = new Publication({
            title,
            categoryId,
            text,
            userId
        });

        // Guardar la nueva publicación en la base de datos
        const savedPublication = await newPublication.save();

        // Responder con un mensaje de éxito, incluyendo el nombre de usuario y el nombre de la categoría
        return res.status(201).send({ 
            message: 'Publication added successfully', 
            publication: { 
                _id: savedPublication._id,
                title: savedPublication.title,
                text: savedPublication.text,
                userName: user.username,
                categoryName: category.name
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error when adding the publication to the database' });
    }
};

export const updatePublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user._id; // Se asume que el usuario se encuentra en el token JWT

        // Verificar si la publicación existe
        const existingPublication = await Publication.findById(publicationId);
        if (!existingPublication) {
            return res.status(404).send({ message: 'Publication not found' });
        }

        // Verificar si el usuario tiene permiso para actualizar la publicación
        if (existingPublication.userId.toString() !== userId.toString()) {
            return res.status(403).send({ message: 'You are not authorized to update this publication' });
        }

        // Actualizar la publicación con los campos proporcionados en la solicitud
        const { title, category, text } = req.body;
        if (title) existingPublication.title = title;
        if (category) existingPublication.category = category;
        if (text) existingPublication.text = text;

        // Guardar los cambios
        await existingPublication.save();

        return res.send({ message: 'Publication updated successfully', publication: existingPublication });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating publication' });
    }
};

export const deletePublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user._id; // Se asume que el usuario se encuentra en el token JWT

        // Buscar la publicación en la base de datos
        const publication = await Publication.findById(publicationId);

        // Verificar si la publicación existe
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Verificar si el usuario es el propietario de la publicación
        if (publication.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this publication' });
        }

        // Eliminar la publicación de la base de datos
        await Publication.findByIdAndDelete(publicationId);

        return res.status(200).json({ message: 'Publication deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting publication' });
    }
};

