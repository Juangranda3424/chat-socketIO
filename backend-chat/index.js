const express = require("express");
const { createServer } = require("http");
const realTimeServer = require("./realTimeServer");
const cookieParser = require("cookie-parser");
const router = require('./src/routes/router');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

app.set("port", process.env.PORT || 3000);
app.use(router);
app.use(express.json());

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));

// Usar las rutas
app.use(cookieParser());
app.use('/api/v1', router);

httpServer.listen(app.get("port"), () => {
  console.log("La aplicación esta corriendo en el puerto ", app.get("port"));
});

realTimeServer(httpServer);
