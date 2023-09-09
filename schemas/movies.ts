import z from "zod";

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Title must be a string",
    required_error: "Title is required",
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({ message: "Poster must be a valid url" }),
  genre: z
    .enum(
      [
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
      ],
      {
        required_error:
          "Genre must be a array of any of these genres: Drama, Action,Crime,Adventure,Sci-Fi,Romance,Animation,Comedy,Biography,Fantasy",
      }
    )
    .array(),
  rate: z.number().min(0).max(10).default(5),
});

export function validateSchema(obj: Object) {
  return movieSchema.safeParse(obj);
}

export function validateSchemaPatch(obj: Object) {
  //Partial viene de TS vuelve todos las propiedades del objeto optionales, cosa que si le enviamos la propiedad la comprueba y actualiza la "Movie" de ser el caso si no lo deja como tal y manejamos el error, tambien ignora 'propiedades random' que puedan enviar
  return movieSchema.partial().safeParse(obj);
}
