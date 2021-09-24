# md-toc-generator

> Creates and updates tables of content in your markdown files.

[//]: # "BEGIN_TOC"

1. [Usage](#usage)
1. [License](#license)

[//]: # "END_TOC"

## Usage

Install the package globally or as a local dependency:

```bash
# npm install md-toc-generator
# npm install --global md-toc-generator
# yarn global add md-toc-generator
yarn add md-toc-generator
```

Add a placeholder to files that you want to create ToC for:

```md
[//]: # "BEGIN_TOC"
[//]: # "END_TOC"
```

Then call the script:

```bash
# adds/updates ToC README.md in current directory
md-toc-generator

# adds/updates ToC wherever you point it to
md-toc-generator --paths <PATH_TO_MD_FILE>
```

If you want to lint your markdown files to see if the ToC is up to date, but without changing anything, use the `--ci` flag (example usage in the [GitHub actions](https://github.com/mihaeu/md-toc-generator/actions) of this project).

```bash
md-toc-generator --ci
```

## License

See [`LICENSE`](LICENSE) file.
