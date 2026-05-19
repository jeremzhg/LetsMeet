import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

type ImageEntity = "events" | "organizations" | "corporations";

type ImageMap = Record<ImageEntity, Record<string, string>>;

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const MAP_FILE = path.join(UPLOAD_ROOT, "image-map.json");

const emptyMap = (): ImageMap => ({
  events: {},
  organizations: {},
  corporations: {},
});

const ensureUploadRoot = async () => {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
};

const readMap = async (): Promise<ImageMap> => {
  await ensureUploadRoot();

  try {
    const raw = await fs.readFile(MAP_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ImageMap>;

    return {
      events: parsed.events || {},
      organizations: parsed.organizations || {},
      corporations: parsed.corporations || {},
    };
  } catch {
    return emptyMap();
  }
};

const writeMap = async (map: ImageMap) => {
  await ensureUploadRoot();
  await fs.writeFile(MAP_FILE, JSON.stringify(map, null, 2), "utf-8");
};

const toSafeFilename = (value: string) =>
  value.replace(/[^a-zA-Z0-9-_]/g, "_");

export const getEntityImagePath = async (
  entity: ImageEntity,
  entityID: string
): Promise<string | null> => {
  const map = await readMap();
  return map[entity][entityID] || null;
};

export const setEntityImageFromFilePath = async (
  entity: ImageEntity,
  entityID: string,
  filePath: string
): Promise<string> => {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("filePath is required");
  }

  const resolvedSourcePath = path.resolve(filePath);
  await fs.access(resolvedSourcePath);

  const ext = path.extname(resolvedSourcePath) || ".png";
  const entityDir = path.join(UPLOAD_ROOT, entity);
  await fs.mkdir(entityDir, { recursive: true });

  const filename = `${toSafeFilename(entityID)}-${Date.now()}${ext}`;
  const destinationPath = path.join(entityDir, filename);
  await fs.copyFile(resolvedSourcePath, destinationPath);

  const publicPath = `/uploads/${entity}/${filename}`;

  const map = await readMap();
  map[entity][entityID] = publicPath;
  await writeMap(map);

  return publicPath;
};

export const setEntityImageFromUpload = async (
  entity: ImageEntity,
  entityID: string,
  originalName: string,
  buffer: Buffer
): Promise<string> => {
  if (!buffer || buffer.length === 0) {
    throw new Error("uploaded file is empty");
  }

  const ext = path.extname(originalName || "") || ".png";
  const entityDir = path.join(UPLOAD_ROOT, entity);
  await fs.mkdir(entityDir, { recursive: true });

  const filename = `${toSafeFilename(entityID)}-${randomUUID()}${ext}`;
  const destinationPath = path.join(entityDir, filename);
  await fs.writeFile(destinationPath, buffer);

  const publicPath = `/uploads/${entity}/${filename}`;

  const map = await readMap();
  map[entity][entityID] = publicPath;
  await writeMap(map);

  return publicPath;
};
