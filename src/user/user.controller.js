
import User from './user.model.js'
import { encrypt, checkPassword } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'
import bcrypt from 'bcrypt';

export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const register = async(req, res)=>{
    try{
        //Captura
        let data = req.body
        //Encriptar la contraseña
        data.password = await encrypt(data.password)
        data.role = "USER"
        //Guardar la información
        let user = new User(data)
        await user.save()
        //Nos enseña un mensaje de exito o que fallo
        return res.send({message: `Registered successfully, can be logged with username ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registering user', err: err})
    }
}

export const login = async (req, res) => {
    try {
        // Capturar datos del cuerpo de la solicitud
        let { username, email, password } = req.body;

        // Validar que se proporcionen tanto el nombre de usuario como el correo electrónico y la contraseña
        if (!username && !email) {
            return res.status(400).send({ message: 'Username or email is required' });
        }
        if (!password) {
            return res.status(400).send({ message: 'Password is required' });
        }

        // Buscar al usuario por nombre de usuario o correo electrónico
        let user;
        if (username) {
            user = await User.findOne({ username });
        } else {
            user = await User.findOne({ email });
        }

        // Verificar si se encontró al usuario y validar la contraseña
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            };
            // Generar el Token
            let token = await generateJwt(loggedUser);
            // Responder al usuario
            return res.send({
                message: `Welcome ${loggedUser.name}`,
                loggedUser,
                token
            });
        }

        // Si el usuario no se encontró o la contraseña es incorrecta, devolver un error
        return res.status(404).send({ message: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error to login' });
    }
};



export const editProfile = async (req, res) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { username, password, newPassword, newName } = req.body;

        // Validar que se proporcione al menos uno de los campos para editar
        if (!username && !newPassword && !newName) {
            return res.status(400).send({ message: 'At least one field to edit is required' });
        }

        // Encontrar al usuario por su ID
        const user = await User.findById(req.user.id);

        // Si se proporciona un nuevo nombre, actualizarlo
        if (newName) {
            user.name = newName;
        }

        // Si se proporciona un nuevo nombre de usuario, actualizarlo
        if (username) {
            user.username = username;
        }

        // Si se proporciona una nueva contraseña, validar la contraseña anterior y actualizarla
        if (newPassword) {
            if (!password) {
                return res.status(400).send({ message: 'Previous password is required to change password' });
            }
            // Verificar la contraseña anterior
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).send({ message: 'Previous password is incorrect' });
            }
            // Generar hash de la nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            // Actualizar la contraseña con el hash
            user.password = hashedNewPassword;
        }

        // Guardar los cambios en la base de datos
        await user.save();

        // Verificar si la contraseña se actualizó correctamente
        const passwordUpdated = newPassword ? true : false;

        return res.send({ message: 'Profile updated successfully', passwordUpdated });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating profile' });
    }
};
