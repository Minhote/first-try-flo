"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchemaPatch = exports.validateSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const movieSchema = zod_1.default.object({
    title: zod_1.default.string({
        invalid_type_error: "Title must be a string",
        required_error: "Title is required",
    }),
    year: zod_1.default.number().int().min(1900).max(2024),
    director: zod_1.default.string(),
    duration: zod_1.default.number().int().positive(),
    poster: zod_1.default.string().url({ message: "Poster must be a valid url" }),
    genre: zod_1.default
        .enum([
        "Drama",
        "Action",
        "Crime",
        "Adventure",
        "Sci-Fi",
        "Romance",
        "Animation",
        "Comedy",
        "Biography",
        "Fantasy",
    ], {
        required_error: "Genre must be a array of any of these genres: Drama, Action,Crime,Adventure,Sci-Fi,Romance,Animation,Comedy,Biography,Fantasy",
    })
        .array(),
    rate: zod_1.default.number().min(0).max(10).default(5),
});
function validateSchema(obj) {
    return movieSchema.safeParse(obj);
}
exports.validateSchema = validateSchema;
function validateSchemaPatch(obj) {
    //Partial viene de TS vuelve todos las propiedades del objeto optionales, cosa que si le enviamos la propiedad la comprueba y actualiza la "Movie" de ser el caso si no lo deja como tal y manejamos el error, tambien ignora 'propiedades random' que puedan enviar
    return movieSchema.partial().safeParse(obj);
}
exports.validateSchemaPatch = validateSchemaPatch;
