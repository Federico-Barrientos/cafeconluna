import { builder } from "../builder.js";

// Yoga parsea automáticamente los requests multipart/form-data (spec de
// GraphQL multipart requests) y entrega cada archivo como un `File` nativo.
// Este scalar solo declara el tipo en el schema; el parseo real lo hace Yoga.
builder.scalarType("Upload", {
  parseValue: (value) => value as File,
  serialize: () => {
    throw new Error("El scalar Upload no se puede serializar");
  },
});
