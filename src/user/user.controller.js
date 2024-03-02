
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
        let { username, email, password } = req.body;

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
            // Generamos el token
            let token = await generateJwt(loggedUser);
            // Responde al usuario
            return res.send({
                message: `Welcome ${loggedUser.name}`,
                loggedUser,
                token
            });
        }

        // Aqui valida si las crendeciales sean verdaderas
        return res.status(404).send({ message: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error to login' });
    }
};



export const editProfile = async (req, res) => {
    try {
        // Obtiene la solucitud
        const { username, password, newPassword, newName } = req.body;

        // Valida mas de algun campo a actualizar
        if (!username && !newPassword && !newName) {
            return res.status(400).send({ message: 'At least one field to edit is required' });
        }

        // Encuentra el usuario por medio del ID
        const user = await User.findById(req.user.id);

        // Si se proporciona un nuevo nombre, actualizarlo
        if (newName) {
            user.name = newName;
        }

        // Aqui actualiza el usuario
        if (username) {
            user.username = username;
        }

        // Si se proporciona una nueva contraseña, validar la contraseña anterior y actualizarla
        if (newPassword) {
            if (!password) {
                return res.status(400).send({ message: 'Previous password is required to change password' });
            }
            // Verifica la contraseña anterior
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).send({ message: 'Previous password is incorrect' });
            }
            // Genera la nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            // Actualizar la contraseña
            user.password = hashedNewPassword;
        }

        // Guarda
        await user.save();

        // Verificar si la contraseña se actualizo
        const passwordUpdated = newPassword ? true : false;

        return res.send({ message: 'Profile updated successfully', passwordUpdated });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating profile' });
    }
};
