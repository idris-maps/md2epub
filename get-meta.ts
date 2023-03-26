import { isString, parseYaml, readArgs } from "./deps.ts";

const error = {
  noSource: "source folder is not defined",
};

const getSourceFolder = (args: Record<string, unknown>) => {
  const sourceFolder = isString(args.src) ? args.src : Deno.args[0];

  if (!sourceFolder) {
    throw error.noSource;
  }

  return sourceFolder;
};

interface Config {
  author: string;
  filename: string;
  language: string;
  publisher: string;
  source: string;
  title: string;
  verbose: boolean;
}

const readConfig = (data: Record<string, unknown>): Partial<Config> => ({
  author: isString(data.author) ? data.author : undefined,
  publisher: isString(data.publisher) ? data.publisher : undefined,
  title: isString(data.title) ? data.title : undefined,
  language: isString(data.language) ? data.language : undefined,
  source: isString(data.source) ? data.source : undefined,
  filename: isString(data.filename) ? data.filename : undefined,
  verbose: Boolean(data.verbose),
});

const readYaml = async (file: string) => {
  try {
    const content = await Deno.readTextFile(file);
    return parseYaml(content);
  } catch {
    return {};
  }
};

const readConfigFile = (
  args: Record<string, unknown>,
  sourceFolder: string,
): Promise<Partial<Config>> => {
  const configFile = isString(args.config)
    ? args.config
    : `${sourceFolder}/meta.yaml`;
  // @ts-ignore ?
  return readYaml(configFile);
};

const getConfig = async (
  args: Record<string, unknown>,
  id: string,
  sourceFolder: string,
): Promise<Config> => {
  const fromFile = await readConfigFile(args, sourceFolder);
  const fromArgs = readConfig(args);

  return {
    author: fromArgs.author || fromFile.author || "Unknown author",
    title: fromArgs.title || fromFile.title || "Unknown title",
    publisher: fromArgs.publisher || fromFile.publisher || "Unknown publisher",
    language: fromArgs.language || fromFile.language || "en-UK",
    source: fromArgs.source || fromFile.source || "Unknown source",
    filename: fromArgs.filename || fromFile.filename || id,
    verbose: Boolean(fromArgs.verbose) || Boolean(fromFile.verbose) || false,
  };
};

const createDestinationFolder = async (id: string) => {
  const folder = `tmp-${id}`;
  await Deno.mkdir(folder);
  return folder;
};

export const getMeta = async () => {
  const args = readArgs();
  const id = crypto.randomUUID();
  const sourceFolder = getSourceFolder(args);
  const config = await getConfig(args, id, sourceFolder);
  const destinationFolder = await createDestinationFolder(id);

  return {
    id,
    destinationFolder,
    sourceFolder,
    ...config,
  };
};
