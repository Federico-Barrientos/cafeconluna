import SchemaBuilder from "@pothos/core";
import type { GraphQLContext } from "../lib/context.js";

export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  Scalars: {
    Upload: { Input: File; Output: File };
  };
}>({});

builder.queryType({});
builder.mutationType({});
