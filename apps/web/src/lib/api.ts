import type { Photo } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";
// Origen de la API (sin el /graphql) para resolver las URLs relativas
// (/uploads/...) que devuelve el resolver de PhotoVariant. Si VITE_API_URL
// es una ruta relativa (producción consolidada: front y api en el mismo
// origen/proceso), no hay una URL absoluta de la que derivar el origen, así
// que usamos el del propio browser. En desarrollo (VITE_API_URL absoluta,
// apuntando a :4000 mientras el front corre en :5173) se sigue derivando
// del URL de la API, como antes.
const API_ORIGIN = API_URL.startsWith("/") ? window.location.origin : new URL(API_URL).origin;

function withAbsoluteVariantUrls(photo: Photo): Photo {
  return {
    ...photo,
    variants: photo.variants.map((variant) => ({
      ...variant,
      url: variant.url.startsWith("/") ? `${API_ORIGIN}${variant.url}` : variant.url,
    })),
  };
}

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

/**
 * Request GraphQL multipart (spec de graphql-multipart-request-spec) para
 * mutations que reciben un `Upload`. Yoga espera los campos `operations`,
 * `map` y un campo por archivo indexado numéricamente.
 */
async function graphqlUploadRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  file: File,
): Promise<T> {
  const form = new FormData();
  form.append("operations", JSON.stringify({ query, variables }));
  form.append("map", JSON.stringify({ "0": ["variables.file"] }));
  form.append("0", file);

  const res = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    body: form,
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

const PHOTO_FIELDS = `
  id
  caption
  description
  camera
  film
  aperture
  shutterSpeed
  tags
  createdAt
  variants {
    kind
    url
    width
    height
  }
`;

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

export interface MeResult {
  me: { id: string; username: string; email: string } | null;
}

export function me(): Promise<MeResult["me"]> {
  return graphqlRequest<MeResult>(
    `query Me {
      me {
        id
        username
        email
      }
    }`,
  ).then((data) => data.me);
}

export interface LogoutResult {
  logout: boolean;
}

export function logout(): Promise<boolean> {
  return graphqlRequest<LogoutResult>(
    `mutation Logout {
      logout
    }`,
  ).then((data) => data.logout);
}

export interface PhotosResult {
  photos: Photo[];
}

export function fetchPhotos(tag?: string | null): Promise<Photo[]> {
  return graphqlRequest<PhotosResult>(
    `query Photos($tag: String) {
      photos(tag: $tag) {
        ${PHOTO_FIELDS}
      }
    }`,
    { tag: tag ?? null },
  ).then((data) => data.photos.map(withAbsoluteVariantUrls));
}

export interface PhotoMetadata {
  caption?: string;
  description?: string;
  camera?: string;
  film?: string;
  aperture?: string;
  shutterSpeed?: string;
  tags?: string[];
}

interface UploadPhotoResult {
  uploadPhoto: Photo;
}

export function uploadPhoto(
  file: File,
  metadata: PhotoMetadata,
): Promise<Photo> {
  return graphqlUploadRequest<UploadPhotoResult>(
    `mutation UploadPhoto(
      $file: Upload!
      $caption: String
      $description: String
      $camera: String
      $film: String
      $aperture: String
      $shutterSpeed: String
      $tags: [String!]
    ) {
      uploadPhoto(
        file: $file
        caption: $caption
        description: $description
        camera: $camera
        film: $film
        aperture: $aperture
        shutterSpeed: $shutterSpeed
        tags: $tags
      ) {
        ${PHOTO_FIELDS}
      }
    }`,
    { file: null, ...metadata },
    file,
  ).then((data) => withAbsoluteVariantUrls(data.uploadPhoto));
}

interface UpdatePhotoResult {
  updatePhoto: Photo;
}

export function updatePhoto(
  id: string,
  input: PhotoMetadata,
): Promise<Photo> {
  return graphqlRequest<UpdatePhotoResult>(
    `mutation UpdatePhoto($id: ID!, $input: UpdatePhotoInput!) {
      updatePhoto(id: $id, input: $input) {
        ${PHOTO_FIELDS}
      }
    }`,
    { id, input },
  ).then((data) => withAbsoluteVariantUrls(data.updatePhoto));
}

interface DeletePhotoResult {
  deletePhoto: boolean;
}

export function deletePhoto(id: string): Promise<boolean> {
  return graphqlRequest<DeletePhotoResult>(
    `mutation DeletePhoto($id: ID!) {
      deletePhoto(id: $id)
    }`,
    { id },
  ).then((data) => data.deletePhoto);
}
