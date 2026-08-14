import type { User as UserModel } from "@prisma/client";
import { builder } from "../builder.js";

export const UserRef = builder.objectRef<UserModel>("User");

UserRef.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    username: t.exposeString("username"),
  }),
});
