import { pathToFileURL } from "node:url";

export async function loadModule(filePath: string) {
  if (filePath.endsWith('.js')) {
    return require(filePath);
  }
  return await import(pathToFileURL(filePath).href);
}
