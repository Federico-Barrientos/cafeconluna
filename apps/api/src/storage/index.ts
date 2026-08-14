import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../lib/env.js";

/**
 * Interfaz mínima de almacenamiento de archivos. La implementación de hoy
 * guarda en disco local; el día que haga falta migrar a un object storage
 * (S3, R2, etc.) alcanza con escribir otra implementación de esta interfaz.
 */
export interface FileStorage {
  uploadFile(key: string, data: Buffer): Promise<void>;
  getFileUrl(key: string): string;
  deleteFile(key: string): Promise<void>;
}

class LocalDiskStorage implements FileStorage {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async uploadFile(key: string, data: Buffer): Promise<void> {
    const filePath = path.join(this.rootDir, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
  }

  getFileUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.rootDir, key);
    await rm(filePath, { force: true });
  }
}

export const storage: FileStorage = new LocalDiskStorage(
  path.resolve(env.uploadsDir),
);
