export type MimeSubtype = `${string}-${string}`;
export type MimeType = `${string}/${string}`;
export type Ext = `.${string}`;
export type AcceptType =  { MimeType: Ext };

export interface IMimeType {
  get type(): MimeType;

  get subType(): MimeSubtype;

  get name(): string;

  get ext(): Ext;

  get description(): string;

  get embedded(): boolean;

  get accept(): AcceptType;

  get typeObj(): { type: MimeType };
}

export class MimeRegistry {
  static get exts() {
    return this._exts;
  }

  private static _exts: Record<Ext, IMimeType> = {};

  static names() {
    return this._names;
  }

  private static _names: Record<string, IMimeType> = {};

  static subtypes() {
    return this._subtypes;
  }

  private static _subtypes: Record<MimeSubtype, IMimeType> = {};

  static types() {
    return this._types;
  }

  private static _types: Record<MimeType, IMimeType> = {};

  static create(subType: string, name: string, ext: Ext, description: string, embedded: boolean = true, type: string = 'application'): IMimeType {
    const mimeType = {
      get type() {
        return `${type}/${this.subType}` as MimeType;
      },
      get subType() {
        return `${subType}-${name}` as MimeSubtype;
      },
      get subTypePrefix() {
        return subType;
      },
      get name() {
        return name;
      },
      get ext() {
        return ext;
      },
      get description() {
        return description;
      },
      get embedded() {
        return embedded;
      },
      get accept() {
        return {
          [this.type]: this.ext
        } as AcceptType;
      },
      get typeObj() {
        return { type: this.type };
      }
    }
    this.exts[ext] = mimeType;
    this.names[name] = mimeType;
    this.subtypes[mimeType.subType] = mimeType;
    this.types[mimeType.type] = mimeType;
    return mimeType;
  }
}

export function getExtension(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const lastIndex = pathname.lastIndexOf(".");
  if (lastIndex === -1) {
    return ""; // No extension found
  }
  return pathname.substring(lastIndex);
}
