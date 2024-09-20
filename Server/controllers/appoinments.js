import { model } from 'mongoose';
import Appoinment from '../models/appoinment.js';
import User from  '../models/user.js';
import { sendEmail } from '../services/emailService.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export async function createAppoinment(req, res) {
    const { user_id } = req.user;
    const { date, description, animal, size, petName, appoinmentType } = req.body;

    if (!date) {
        return res.status(400).send({ msg: "La fecha de la cita es requerida." });
    }

    try {
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).send({ msg: "Formato de fecha inválido." });
        }

        if (appointmentDate < today) {
            return res.status(400).send({ msg: "La fecha de la cita no puede ser anterior a hoy." });
        }

        const existingAppoinment = await Appoinment.findOne({
            date: appointmentDate,
            active: { $ne: false },
        });

        if (existingAppoinment) {
            return res.status(400).send({ msg: "Ya existe una cita activa en la misma fecha y hora." });
        }

        const appoinment = new Appoinment({
            user: user_id,
            date: appointmentDate,
            animal,
            size,
            petName,
            appoinmentType,
            description,
            active: false,
        });

        const savedAppoinment = await appoinment.save();

        // Formatear la fecha en español
        const formattedDate = format(appointmentDate, "dd MMMM yyyy 'a las' HH:mm", { locale: es });

        // Enviar correo al administrador
        const emailContent = `
            <h1>Nueva Solicitud de cita</h1>
            <p><strong>Animal:</strong> ${animal}</p>
            <p><strong>Nombre de la Mascota:</strong> ${petName}</p>
            <p><strong>Tipo de Cita:</strong> ${appoinmentType}</p>
            <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
            <p><strong>Descripción:</strong> ${description}</p>
        `;

        await sendEmail({
            to: 'samuelondo1123@gmail.com', // Correo del administrador
            subject: 'Nueva Cita Solicitada',
            html: emailContent,
        });

        return res.status(200).send({ msg: "Cita agendada con éxito y correo enviado", cita: savedAppoinment });

    } catch (error) {
        console.error("Error al crear la cita:", error);
        res.status(500).send({ msg: "Error al agendar la cita", error: error.message });
    }
}


export async function getAppoinment(req, res) {
    const { id } = req.params;

    try {
        const response = await Appoinment.findById(id);

        if (!response) {
            return res.status(500).send({ msg: "No se ha encontrado la cita" });
        }
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({ msg: "Error al obtener la cita", error });
    }
}

export async function getAppoinments(req, res) {
    const { page = 1, limit = 10, active, isDone } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    let query = {};
    if (active !== undefined) {
        query.active = active === 'true';
    }
    if (isDone !== undefined) {
        query.isDone = isDone === 'true';
    }

    try {
        const appoinments = await Appoinment.paginate(query, options);
        res.status(200).send(appoinments);
    } catch (error) {
        res.status(500).send({ msg: "Error al obtener las citas", error });
    }
}

export async function updateAppoinment(req, res) {
    const { id } = req.params;
    const appoinmentData = req.body;

    try {
        const updatedAppoinment = await Appoinment.findByIdAndUpdate(
            id,
            appoinmentData,
            { new: true }
        );

        if (!updatedAppoinment) {
            return res.status(404).send({ msg: "Error al actualizar la cita" });
        }

        res.status(200).send({ msg: "Actualización correcta", cita: updatedAppoinment });

    } catch (error) {
        res.status(500).send({ msg: "Error al actualizar la cita" });
    }
}

export async function deleteAppoinment(req, res) {
    const { id } = req.params;

    try {
        const deletedAppoinment = await Appoinment.findByIdAndDelete(id);

        if (!deletedAppoinment) {
            return res.status(404).send({ msg: "Error al eliminar la cita" });
        }

        res.status(200).send({ msg: "Cita eliminada correctamente" });
    } catch (error) {
        res.status(500).send({ msg: "Error al eliminar la cita", error });
    }
}

export const acceptAppoinment = async (req, res) => {
    try {
        const { id } = req.params;

        // Actualizar la cita a aceptada
        const updatedAppoinment = await Appoinment.findByIdAndUpdate(
            id,
            {
                active: true,
                isDone: false,
            },
            { new: true }
        ).populate('user'); // Popula el campo 'user' para acceder al correo del usuario

        const user = await User.findById(updatedAppoinment.user);


        // Verificar si el correo del usuario está disponible
        if (!updatedAppoinment || !updatedAppoinment.user || !updatedAppoinment.user.email) {
            console.log("No se encontró el correo del usuario.");
            return res.status(400).json({ message: 'No se encontró el correo del usuario.' });
        }

        // Formatear la fecha en español y en formato de 24 horas
        const formattedDate = format(new Date(updatedAppoinment.date), "dd MMMM yyyy 'a las' HH:mm", { locale: es });

        // Preparar el contenido del correo (puedes personalizar el HTML del correo)
        const emailContent = `
            <h1>Cita Aceptada</h1>
            <p>Estimado/a ${user.firstname},</p>
            <p>Su cita ha sido aceptada. Nos vemos el día ${formattedDate} para la ${updatedAppoinment.appoinmentType} de su mascota ${updatedAppoinment.petName}.</p>
            <p>Gracias por elegirnos.</p>
        `;

        // Enviar el correo al usuario
        await sendEmail({
            to: updatedAppoinment.user.email, // Correo del usuario
            subject: 'Cita Aceptada',
            html: emailContent,
        });

        // Responder con éxito
        res.status(200).json({ message: 'Cita aceptada y correo enviado' });
    } catch (error) {
        console.log("Error al aceptar cita:", error);
        res.status(500).json({ message: 'Error al aceptar la cita' });
    }
};


export async function rejectAppoinment(req, res) {
    const { id } = req.params;

    try {
        // Buscar la cita junto con los detalles del usuario
        const appoinmentToDelete = await Appoinment.findById(id).populate('user');

        if (!appoinmentToDelete) {
            return res.status(404).send({ msg: "No se encontró la cita" });
        }

        // Formatear la fecha en español y en formato de 24 horas
        const formattedDate = format(new Date(appoinmentToDelete.date), "dd MMMM yyyy 'a las' HH:mm", { locale: es });

        // Preparar el contenido del correo
        const emailContent = `
            <h1>Cita Rechazada</h1>
            <p>Lamentamos informarle que su cita para el ${formattedDate} ha sido rechazada.</p>
        `;

        // Enviar el correo al usuario
        await sendEmail({
            to: appoinmentToDelete.user.email, // Correo del usuario
            subject: 'Cita Rechazada',
            html: emailContent,
        });

        // Eliminar la cita de la base de datos después de enviar el correo
        await Appoinment.findByIdAndDelete(id);

        res.status(200).send({ msg: "Cita rechazada con éxito, correo enviado y cita eliminada de la base de datos" });
    } catch (error) {
        res.status(500).send({ msg: "Error al rechazar la cita", error });
    }
}


export async function createAppoinmentByAdmin(req, res) {
    const { user_id } = req.user;
    const {
        date,
        description,
        animal,
        size,
        petName,
        appoinmentType
    } = req.body;

    try {
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Configura la hora de hoy a 00:00:00 para comparar solo fechas

        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).send({ msg: "Formato de fecha inválido." });
        }

        // Verifica si la fecha de la cita es anterior a la fecha actual
        if (appointmentDate < today) {
            return res.status(400).send({ msg: "La fecha de la cita no puede ser anterior a hoy." });
        }

        // Verificar si ya existe una cita en la misma fecha y hora para el mismo animal
        const existingAppoinment = await Appoinment.findOne({ date: appointmentDate, animal });
        if (existingAppoinment) {
            return res.status(400).send({ msg: "Ya existe una cita en esa fecha y hora." });
        }

        // Crear la nueva cita con active: true
        const appoinment = new Appoinment({
            user: user_id,
            date: appointmentDate,
            animal,
            size,
            petName,
            appoinmentType,
            description,
            active: true,
        });

        const savedAppoinment = await appoinment.save();
        return res.status(200).send({ msg: "Cita agendada con éxito", cita: savedAppoinment });

    } catch (error) {
        res.status(500).send({ msg: "Error al agendar la cita" });
    }
}