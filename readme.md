# md2epub

Convert a folder with markdown files to an
[epub](https://en.wikipedia.org/wiki/EPUB) book.

## Install

Requires [deno](https://deno.land/manual@v1.29.1/getting_started/installation)

```
deno install -n md2epub --allow-read --allow-write https://deno.land/x/md2epub@v0.0.1/mod.ts
```

## Usage

```
md2epub <FOLDER>
```

will convert all markdown files in `<FOLDER>` to an epub. Subfolders will become
sections. Pages will be in alphabetic order, name the files accordingly.

Example folder structure:

```
book
├── 1. First part
│   ├── 01-intro.md
│   └── 02-begin.md
├── 2. Second part
│   ├── 01-some-chapter.md
│   └── 02-the-end.md
└── meta.yaml
```

Command:

```
md2epub book
```

### Metadata

Metadata is set with a `<FOLDER>/meta.yaml` file with the following keys:

- author (string, default `Unkown author`)
- filename (string, default a UUID)
- language (string, default `en-UK`)
- publisher (string, default `Unknown publisher`)
- source (string, default `Unkown source`)
- title (string, default `Unknown title`)

Example:

```yaml
author: Some author name
filename: my-book
language: en-US
publisher: Books Inc.
source: https://bo.oks
title: My book
```
