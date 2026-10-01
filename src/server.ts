import { app } from './app.js';

// Usa el puerto configurado o 3000 si no se definio uno.
const port = Number(process.env.PORT) || 3000;

// Inicia el servidor para que pueda recibir peticiones HTTP.
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
