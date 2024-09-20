import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { API_VERSION } from './constants.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicialización de Express
const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const client = new MercadoPagoConfig({
     accessToken: 'APP_USR-378117052698226-091914-e97df1011f0c115c53e2139ee36d8ca7-1993006945' 
});

app.post(`/api/${API_VERSION}/create_preference`, async(req, res) => {
    console.log('Request received');
    try {
        // console.log('Request body:', req.body);

        const items = req.body.items.map(item => ({
            title: item.title,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            currency_id: "COP",
        }));

        // Cuerpo de la preferencia
        const body = {
            items: items,
            back_urls: {
                success: "https://www.youtube.com/watch?v=7oXfKZDZ_0c",
                failure: "https://www.youtube.com/watch?v=D3enxLZosHg",
                pending: "https://www.youtube.com/watch?v=Igu4hGD0Mgw",
            },
            auto_return: "approved",
            shipments: {
                cost: 0,  // Costo de envío
                mode: 'not_specified' // Puedes cambiar el modo según la integración
            }
        };

        // console.log('Preference body:', body);

        const preference = new Preference(client);
        const result = await preference.create({ body });

        console.log('Preference result:', result);

        res.json({
            id: result.id,
            preference: result
        })
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({
            error: "Error al crear la preferencia :(",
        });
    }
});


// Rutas
import authRoutes from './router/auth.js';
import userRoutes from './router/user.js';
import productRoutes from './router/product.js';
import appoinmentRoutes from './router/appoinment.js';
import cartRoutes from './router/cart.js';
import checkoutRoutes from './router/checkout.js';
// import preferenceRoutes from './router/preference.js';

// Configuración body parser


// Configuración carpeta de estáticos
app.use(express.static("uploads"));

// Configure Header HTTP - CORS


// Configurar rutas
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, productRoutes);
app.use(`/api/${API_VERSION}`, appoinmentRoutes);
app.use(`/api/${API_VERSION}`, cartRoutes);
app.use(`/api/${API_VERSION}`, checkoutRoutes);
// app.use(`/api/${API_VERSION}`, preferenceRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Exportar app como default para ES Modules
export default app;