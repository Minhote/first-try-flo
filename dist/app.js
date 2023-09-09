"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const cors_1 = __importDefault(require("cors"));
const movies_json_1 = __importDefault(require("./movies.json"));
const movies_1 = require("./schemas/movies");
const PORT = process.env.PORT ?? 3000;
const app = (0, express_1.default)();
// Solucion a CORS Y CORS-PREFLIGHT con la dependencia cors
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const ALLOWED_ORIGINS = [
            "http://localhost:8080",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:5173",
            "http://ellocoqueama.com",
        ];
        if (!origin) {
            return callback(null, true);
        }
        else if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
}));
// Metodos normales: GET,HEAD,POST
// Metodos complejos: PUT.PATCH,DELETE  estos necesitan una una propiedad en el header del request llamado 'options' (CORS-PREFLIGHT)
app.disable("x-powered-by");
// Middleware General
app.use((req, res, next) => {
    console.log("Soy el Middleware de bienvenida para todas las rutas");
    next();
});
// Middleware de POST
app.use("/movies", (req, res, next) => {
    if (req.method === "POST") {
        //Lógica de mutación del BODY del request
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const id = node_crypto_1.default.randomUUID();
                const modifiedData = { ...data, id };
                const result = (0, movies_1.validateSchema)(data);
                if (result.success) {
                    // Un middleware puede mutar el request no es tarea del el 'retornar' nada
                    req.body = modifiedData;
                }
                else {
                    req.body = "Not Valid";
                }
                next();
            }
            catch (error) {
                res
                    .status(400)
                    .json({ error: "El cuerpo de la solicitud no es JSON válido" });
            }
        });
    }
    next();
});
app.use(express_1.default.json());
// Métodos GET
app.get("/", (req, res) => {
    res.json({ mesage: "Hola mundo desde un JSON" });
});
// Esta manera para solo permitirle a ciertos origebes el cruce de datos
// const ALLOWED_ORIGINS = [
//   "http://localhost:8080",
//   "http://localhost:5500",
//   "http://127.0.0.1:5500",
//   "http://localhost:5173",
//   "http://ellocoqueama.com",
// ];
// Obtener todas las películas
app.get("/movies", (req, res) => {
    /* Método manual sin dependencia CORS
    // Permitir cruce de datos con todos los orígenes
    // res.header("Access-Control-Allow-Origin", "*");
  
    // Esta manera para solo permitirle a ciertos origebes el cruce de datos
    // 1 ---> El Request envia en su cabecera una propiedad origin la cual contiene la url que pide los datos
    const origin = req.header("origin");
    // 2 ---> A menos que la url que pida los datos sea la misma en la que esta establecida el servidor pues no envia esa propiedad en la request por lo tanto fijamos el CORS a nuestra url que ya conocemos bien
    if (!origin) {
      res.header("Access-Control-Allow-Origin", "http:localhost:3000");
    }
    // 3 ---> Si no es ese el caso entonces nos aseguramos de que la url que contiene la propiedad origin sea una de las permiticdas en la constabte ALLOWED_ORIGINS y permitiendo el cruce de datos , caso contrario se seguira mostrando el error de CORS
    else {
      if (ALLOWED_ORIGINS.includes(origin)) {
        res.header("Access-Control-Allow-Origin", `${origin}`);
      }
    }
    */
    //Obtener películas por género
    // Todas la lógica que quiera implimenar con las 'querys' debera ser el "la url raíz más cercana"
    const { genre } = req.query;
    if (genre) {
        const g = genre.toString();
        const filteredByGenre = movies_json_1.default.filter((el) => {
            return el.genre.some((el) => el.toLowerCase() === g.toLowerCase());
        });
        return res.json(filteredByGenre);
        // Probando
    }
    return res.json(movies_json_1.default);
});
// Obtener película por id
app.get("/movies/:id", (req, res) => {
    const { id } = req.params;
    const movie = movies_json_1.default.find((el) => el.id === id);
    if (movie) {
        return res.json(movie);
    }
    res.status(404).json({ message: "Movie not found" });
});
// Métodos POST
app.post("/movies", (req, res) => {
    // Manualmente
    // const isValid = cumpleConTipo(req.body, {
    //   id: "",
    //   title: "",
    //   year: 0,
    //   director: "",
    //   duration: 0,
    //   poster: "",
    //   genre: ["", ""],
    //   rate: 0,
    // });
    // console.log(isValid);
    // if (isValid) {
    //   return res.status(201).json(req.body);
    // } else {
    //   return res
    //     .status(404)
    //     .end("Datos no válidos o incompletos, verifícelos por favor");
    // }
    // Con ZOD
    if (req.body === "Not Valid") {
        return res.status(400).json({ message: "Data input is not valid" });
    }
    else {
        //En esta parte deberiamos agregar a una base de datos
        return res.status(200).json(req.body);
    }
});
// Métodos PATCH
app.patch("/movies/:id", (req, res) => {
    const { id } = req.params;
    const movieIndexToUpdate = movies_json_1.default.findIndex((movie) => movie.id === id);
    if (movieIndexToUpdate > 0) {
        return res.status(404).json({ message: "ID inexistent in DB" });
    }
    const result = (0, movies_1.validateSchemaPatch)(req.body);
    if (result.success) {
        const updatedMovie = {
            ...movies_json_1.default[movieIndexToUpdate],
            ...result.data,
        };
        // console.log(`
        // Pelicula antes de actualizar: ${JSON.stringify(
        //   moviesJSON[movieIndexToUpdate]
        // )}
        // Película actualizada: ${JSON.stringify(updatedMovie)}
        // `);
        return res
            .status(202)
            .json({ message: "Movie updated succesfully", movie: updatedMovie });
    }
    else {
        return res.status(404).json(result.error.issues);
    }
});
// Métodos DELETE
app.delete("/movies/:id", (req, res) => {
    /* Método manual sin independencia cors
    // Permisión para el cruce de datos que explicamos previamente
    const origin = req.header("origin");
    if (!origin) {
      res.header("Access-Control-Allow-Origin", "http:localhost:3000");
    } else {
      if (ALLOWED_ORIGINS.includes(origin)) {
        res.header("Access-Control-Allow-Origin", `${origin}`);
      }
    }
    */
    const { id } = req.params;
    console.log(id);
    const movieIndex = movies_json_1.default.findIndex((el) => el.id === id);
    console.log(movieIndex);
    if (movieIndex < 0) {
        return res
            .status(404)
            .json({ message: "You are trying to eliminate a inexistent movie" });
    }
    movies_json_1.default.splice(movieIndex, 1);
    res.status(200).json({ message: "Movie Deleted" });
});
/* Método manual sin dependencia CORS
// Configurar las options
app.options("/movies/:id", (req: Request, res: Response) => {
  const origin = req.header("origin");
  if (!origin) {
    res.header("Access-Control-Allow-Origin", "http:localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE");
  } else {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.header("Access-Control-Allow-Origin", `${origin}`);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE"
      );
    }
  }

  res.send(200);
});
*/
app.listen(PORT, () => {
    console.log(`Estoy escuchando el servidor en http://localhost:${PORT}`);
});
