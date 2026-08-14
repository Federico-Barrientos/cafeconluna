const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";

interface GraphQLResponse<T> {
  data: T | null;
  errors?: { message: string }[];
}

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!json.data) {
    throw new Error("Respuesta vacía del servidor");
  }
  return json.data;
}

export interface LoginResult {
  login: { id: string; username: string; email: string };
}

export function login(username: string, password: string): Promise<LoginResult> {
  return graphqlRequest<LoginResult>(
    `mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        id
        username
        email
      }
    }`,
    { username, password },
  );
}
