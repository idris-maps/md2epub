import { isString, parseYaml, readArgs } from "./deps.ts";

const error = {
  noSource: [
    "source folder is not defined",
    "",
    "example:",
    "  --src=<FOLDER_WITH_MD_FILED>",
  ].join("\n"),
  unreadableConfig: (d: string) => `could not read config file ${d}`,
};

const getSourceFolder = (args: Record<string, unknown>) => {
  const sourceFolder = isString(args.src) ? args.src : undefined;

  if (!sourceFolder) {
    throw new Error(error.noSource);
  }

  return sourceFolder;
};

interface Config {
  author: string;
  publisher: string;
  title: string;
  language: string;
  source: string;
  filename: string;
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

const readConfigFile = async (
  args: Record<string, unknown>,
): Promise<Partial<Config>> => {
  if (isString(args.config)) {
    try {
      const configContent = await Deno.readTextFile(args.config);
      // @ts-ignore ?
      const data: Record<string, unknown> = parseYaml(configContent);
      return readConfig(data);
    } catch (err) {
      throw new Error(error.unreadableConfig(args.config), err);
    }
  }
  return {};
};

const getConfig = async (
  args: Record<string, unknown>,
  id: string,
): Promise<Config> => {
  const fromFile = await readConfigFile(args);
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
  const sourceFolder = await getSourceFolder(args);
  const config = await getConfig(args, id);
  const destinationFolder = await createDestinationFolder(id);

  return {
    id,
    destinationFolder,
    sourceFolder,
    ...config,
  };
};
