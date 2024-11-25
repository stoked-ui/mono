/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import { namedId } from "@stoked-ui/media-selector";
import { FileState, SaveOptions } from "./TimelineFile.types";
import LocalDb, { FileLoadRequest, FileSaveRequest } from "../LocalDb/LocalDb";
import { IMimeType, MimeType, MimeRegistry } from "./MimeType";
import {
  WebFileInitializer,
  Constructor,
  IBaseDecodedFile,
  IWebFile,
  IWebFileProps, saveFileApi, saveFileHack, IWebData
} from "./WebFile.types";
import { createStaticFiles } from "./test";

const PropsDelimiter = '---STOKED_UI_PROPS_END---';
const FilesTableDelimiter = '---STOKED_UI_FILES_TABLE_END---'

export const SUIWebFileRefs: IMimeType = MimeRegistry.create('stoked-ui', 'webfile', '.suwr', 'Stoked UI - Editor Project File w/ Url Refs', false);
export const SUIWebFile: IMimeType = MimeRegistry.create('stoked-ui', 'webfile', '.suw', 'Stoked UI - Editor Project File', true);

export default abstract class WebFile implements IWebFile {

  id: string;

  name: string;

  description?: string;

  author?: string;

  size?: number;

  url?: string;

  created: number;

  lastModified?: number;

  constructor(props: IWebFileProps) {
    this.id = props.id ?? namedId('webfile');
    this.name = props.name ?? 'new file';
    this.description = props.description;
    this.author = props.author;
    this.created = props.created ?? Date.now();
    this.lastModified = props.lastModified;
    this.url = props.url;
    this._version = !props.version ? 1 : props.version;
    console.info(`WebFile: ${this.id} - ${this.name}`);
    this.state = FileState.CONSTRUCTED;
  }

  protected _version: number = 0;

  get version(): number {
    return this._version;
  }


  mimeTypes: IMimeType[] = [
    SUIWebFile,                 // embedded
    SUIWebFileRefs              // w/ url refs
  ];

  // last saved checksum
  protected lastChecksum: null | string = null;

  protected latestChecksum: null | string = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initializer: WebFileInitializer = (fileParams, files) => {
    return Promise.resolve();
  };

  async getSaveRequest(embedded: boolean = !this.fileUrlsValid ): Promise<FileSaveRequest | false> {
    const dirty = await this.isDirty();
    if (!dirty) {
      return false;
    }
    let mime = this.mimeTypes[0];
    if (!embedded) {
      mime = this.mimeTypes[1];
    }
    return {
      id: this.id,
      version: this.version + 1,
      blob: await this.createBlob(),
      meta: this.fileProps,
      mime,
      embedded
    }
  }

  get metaData(): IWebData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      author: this.author,
      created: this.created,
      lastModified: this.lastModified,
      url: this.url,
      version: this.version,
      mimeType: this.getMimeType().type
    };
  }

  getMimeType(embedded: boolean = true) {
    if (!embedded && !this.fileUrlsValid) {
      embedded = true;
    }
    return this.mimeTypes[embedded ? 0 : 1];
  }

  get fileProps(): IWebData {
    return this.metaData as IWebData ;
  }

  get fileParams(): IBaseDecodedFile[] {
    return [];
  }

  getSaveApiOptions(optionProps: SaveOptions): SaveFilePickerOptions {
    if (!optionProps.suggestedName) {
      if (!optionProps.suggestedExt) {
        optionProps.suggestedExt = this.getMimeType().ext as FileExtension;
      }
      optionProps.suggestedName = `${this.name}${optionProps.suggestedExt}`
    }
    const { id, types, suggestedName } = optionProps;

    return {
      id: id ?? this.id,
      suggestedName,
      excludeAcceptAllOption: false,
      types: types || this.types,
      startIn: id ? undefined : 'documents'
    }
  }

  async save(silent: boolean = false): Promise<void> {
    const isDirty = await this.isDirty()
    if (!isDirty) {
      return;
    }

    try {
      const fileData = await this.getSaveRequest();
      if (!fileData) {
        console.info(`${this.name} has not changed. Save cancelled.`);
        return;
      }

      await LocalDb.saveFile(fileData);
      this._version += 1;
      this.lastChecksum = await this.checksum();


    if (!silent) {
      const saveOptions = this.getSaveApiOptions({ });
      const options = { ...saveOptions, fileBlob: fileData.blob };
      if ('showSaveFilePicker' in window) {
        await saveFileApi(options);
      } else {
        await saveFileHack(options);
      }
    }
    } catch (ex) {
      console.error(ex);
      throw new Error(ex as string);
    }
  }

  // Function to create a combined file with JSON data and attached files
  async createBlob(embedded: boolean = true): Promise<Blob> {
    try {
      const fileProps = this.fileProps;
      const propsString = JSON.stringify({ ...fileProps });
      const fileParams = this.fileParams;
      const fileParamsString = JSON.stringify(fileParams);

      if (!embedded && !this.fileUrlsValid) {
        embedded = true;
      }

      const instance = this; // Capture the `this` context
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          try {
            // Encode and enqueue fileProps
            controller.enqueue(encoder.encode(propsString));

            if (embedded) {
              controller.enqueue(encoder.encode(PropsDelimiter));
              controller.enqueue(encoder.encode(fileParamsString));
              controller.enqueue(encoder.encode(FilesTableDelimiter));

              // Get additional data streams and process them
              const additionalStreams = instance.getDataStreams(); // Use captured instance
              console.info('additionalStreams', additionalStreams);
              for await (const readableStream of additionalStreams) {
                const reader = readableStream.getReader();
                let chunk: ReadableStreamReadResult<Uint8Array>;

                while (!(chunk = await reader.read()).done) {
                  controller.enqueue(chunk.value);
                }
              }
            }

            controller.close();
          } catch (err) {
            console.error("Stream error:", err);
            controller.error(err);
          }
        },
      });

      const response = new Response(stream);

      // Convert the Response stream to a blob
      return new Blob([await response.blob()], this.getMimeType().typeObj);
    } catch (ex) {
      console.error("Error in createBlob:", ex);
      throw new Error((ex as Error)?.message || "Unknown error");
    }
  }

  static async readBlob(blob: Blob , searchDb: boolean = false): Promise<{
    props: IWebFileProps;
    fileParams: IBaseDecodedFile[];
    files: File[];
  }> {
    const reader = blob.stream().getReader();
    const decoder = new TextDecoder();

    // Helper function to read a portion of the stream until a delimiter
    async function readUntilDelimiter(delimiter: string): Promise<string> {
      let done = false;
      let text = "";
      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done: readerDone } = await reader.read();
        if (value) {
          text += decoder.decode(value, { stream: true });
          const delimiterIndex = text.indexOf(delimiter);
          if (delimiterIndex !== -1) {
            // Slice up to the delimiter and return
            const result = text.slice(0, delimiterIndex);
            text = text.slice(delimiterIndex + delimiter.length);
            reader.releaseLock();
            return result;
          }
        }
        done = readerDone;
      }
      return text;
    }

    // Read the JSON props
    const propsString = await readUntilDelimiter(PropsDelimiter);
    const props: IWebData = JSON.parse(`${propsString}`);

    const mimeType = MimeRegistry.types[props.mimeType];
    if (!mimeType.embedded) {
      return { props, fileParams: [], files: [] };
    }

    if (searchDb) {
      const loadRequest: FileLoadRequest = {
        id: props.id,
        type: props.mimeType,
        version: props.version,
      }

      // attempt to load it from idb instead of fetching from the webs
      const dbBlob = await LocalDb.loadId(loadRequest);
      if (dbBlob !== null) {
        return this.readBlob(dbBlob.blob, false);
      }
    }

    // Read the JSON file parameters
    const fileParamsString = await readUntilDelimiter( FilesTableDelimiter);
    const fileParams: IBaseDecodedFile[] = JSON.parse(`${fileParamsString}`);

    // Read and parse file data based on fileParams
    const files: File[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const { name, size, type } of fileParams) {
      const chunks: Uint8Array[] = [];
      let remainingSize = size;

      while (remainingSize > 0) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await reader.read();
        if (done) {
          throw new Error("Unexpected end of stream while reading file data");
        }
        const chunk = value.subarray(0, Math.min(remainingSize, value.length));
        chunks.push(chunk);
        remainingSize -= chunk.length;
      }

      // Create a File object from the chunks
      const fileData = new Blob(chunks, { type });
      files.push(new File([fileData], name, { type }));
    }

    return { props, fileParams, files };
  }

  protected get fileUrls(): string[] {
    return [];
  }

  protected get fileUrlsValid(): boolean {
    return true;
  }


  protected abstract getDataStreams(): AsyncIterable<ReadableStream<Uint8Array>>;

  protected get files(): File[] {
    return createStaticFiles();
  }


  get types() {
    return this.mimeTypes.map((mime) => {
      return {
        accept: mime.accept,
        description: mime.description,
      }
    });
  };

  async hashString(canonicalString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async checksum(): Promise<string> {
    return 'default';
  }

  async isDirty(): Promise<boolean> {
    const checksum = await this.checksum();
    if (this.lastChecksum === checksum || checksum === 'default') {
      return false;
    }
    return true;
  }

  abstract initialize(files?: File[]): Promise<void>;

  static async fromUrl<FileType extends WebFile>(url: string): Promise<FileType> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${url}`);
    }
    try {
      const contentType = response.headers.get("content-type") as MimeType;
      console.info(`Load: ${url} Content-Type: ${contentType}`);
      const blob = await response.blob()

      return this.fromBlob<FileType>(blob );
    } catch (ex) {
      throw new Error(`Error loading file from url: ${url}`);
    }
  }

  static async fromBlob<
    FileType extends WebFile
  >(
    blob: Blob,
  ): Promise<FileType>
  {
    try {
      const FileConstructor: Constructor<FileType> = WebFile as unknown as Constructor<FileType>;
      const { props, files } = await WebFile.readBlob(blob, true);
      const projectFile = new FileConstructor(props);
      await projectFile.initialize(files);
      return projectFile;
    } catch (ex) {
      throw new Error(`Error loading file from blob: ${blob}`);
    }
  }

  static fileState: Record<string, FileState> = {};


  state: FileState = FileState.NONE;
}
