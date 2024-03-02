import Publication  from './publication.model.js'
import User from '../user/user.model.js'
import Category from '../category/category.model.js'


export const createPublication = async (req, res) => {
    try {
        // Verifica
        const { title, categoryId, text, userId } = req.body;
        if (!title || !categoryId || !text || !userId) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        // Verificar si ya existe la publicacion
        const existingPublication = await Publication.findOne({ title });
        if (existingPublication) {
            return res.status(400).send({ message: 'A publication with the same title already exists' });
        }

        // Buscar el usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Buscar la categoría
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send({ message: 'Category not found' });
        }

        // Crear una nueva instancia
        const newPublication = new Publication({
            title,
            categoryId,
            text,
            userId
        });

        // Guarda la nueva publicacion
        const savedPublication = await newPublication.save();

        // Responder con un mensaje de éxito
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
        const userId = req.user._id; 

        // Verifica
        const existingPublication = await Publication.findById(publicationId);
        if (!existingPublication) {
            return res.status(404).send({ message: 'Publication not found' });
        }

        // Verifica si el usuario tiene permiso
        if (existingPublication.userId.toString() !== userId.toString()) {
            return res.status(403).send({ message: 'You are not authorized to update this publication' });
        }

        // Actualizamos los campos
        const { title, category, text } = req.body;
        if (title) existingPublication.title = title;
        if (category) existingPublication.category = category;
        if (text) existingPublication.text = text;

        // Guardar
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
        const userId = req.user._id; 

        // Buscar la publicación
        const publication = await Publication.findById(publicationId);

        // Verificar si la publicación existe
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Verifica si la publicacion es del usuario
        if (publication.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this publication' });
        }

        // Elimina si se cumple que el es el que puso la publicación
        await Publication.findByIdAndDelete(publicationId);

        return res.status(200).json({ message: 'Publication deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting publication' });
    }
};

