import { builder } from "./builder.js";
import "./types/upload.js";
import "./types/user.js";
import "./types/photo.js";
import "./resolvers/query.js";
import "./resolvers/mutation.js";

export const schema = builder.toSchema();
