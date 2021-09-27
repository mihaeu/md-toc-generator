const util = require("util")
const writeFile = util.promisify(require("fs").writeFile)
const readFile = util.promisify(require("fs").readFile)
const { mdTOCGenerator } = require("../src/md-toc-generator")

let stdout
process.stdout.write = s => {
	stdout += s
}

describe("md-toc-generator", () => {
	beforeEach(() => {
		stdout = ""
	})

	it("should generate a toc for proper markdown input", async () => {
		const inputMarkdown = `${__dirname}/examples/should-generate-a-toc-for-proper-markdown-input/README.md`
		await writeFile(
			inputMarkdown,
			`# test

[//]: # "BEGIN_TOC"

[//]: # "END_TOC"

# h1
## h2
### h3
#### h4
##### h5`,
		)

		mdTOCGenerator(["--paths", inputMarkdown])
		expect(stdout).toBe(
			`\nThe markdown file '${inputMarkdown}' will be processed for ToC generation!\nUpdating the ToC for you….\n`,
		)
		expect((await readFile(inputMarkdown)).toString()).toBe(`# test

[//]: # "BEGIN_TOC"

1. [h1](#h1)
1. [h2](#h2)
    1. [h3](#h3)
        1. [h4](#h4)
            1. [h5](#h5)

[//]: # "END_TOC"

# h1
## h2
### h3
#### h4
##### h5`)
	})

	it("should fail if no markdown files exist", () => {
		expect(
			mdTOCGenerator.bind(null, ["--paths", `${__dirname}/examples/should-fail-if-no-markdown-files-exist`]),
		).toThrow("No markdown file provided or file doesn't exist.")
	})

	it("should use paths argument", async () => {
		const inputMarkdown = `${__dirname}/examples/should-use-paths-argument/test.md`
		await writeFile(
			inputMarkdown,
			`
# test

[//]: # "BEGIN_TOC"

[//]: # "END_TOC"

## Missing headline
`,
		)

		mdTOCGenerator(["--paths", inputMarkdown])
		expect(stdout).toBe(
			`\nThe markdown file '${inputMarkdown}' will be processed for ToC generation!\nUpdating the ToC for you….\n`,
		)
	})

	it("should use README.md without paths argument", async () => {
		process.chdir(`${__dirname}/examples/should-use-README.md-without-paths-argument`)
		mdTOCGenerator([])
		expect(stdout).toBe(`No markdown file was provided. Defaulting to root 'README.md'.

The markdown file 'README.md' will be processed for ToC generation!
✨  ToC in 'README.md' is up to date.\n`)
	})

	it("should fail if no placeholder found and --require-placeholder set", () => {
		const inputMarkdown = `${__dirname}/examples/should-fail-if-no-placeholder-found-and-placeholder-required-set/test.md`
		expect(mdTOCGenerator.bind(null, ["--placeholder-required", "--paths", inputMarkdown]))
			.toThrow(`No placeholder for ToC found. Add the following snippet to '${inputMarkdown}'

[//]: # "BEGIN_TOC"
...
[//]: # "END_TOC"\n`)
	})

	it("should not fail if no placeholder found", () => {
		const inputMarkdown = `${__dirname}/examples/should-not-fail-if-no-placeholder-found/test.md`
		mdTOCGenerator(["--paths", inputMarkdown])
		expect(stdout).toBe(`Skipping '${inputMarkdown}' because no placeholder was found.
`)
	})

	it("should fail in CI mode if ToC is not up to date", async () => {
		const inputMarkdown = `${__dirname}/examples/should-fail-in-ci-mode-if-toc-is-not-up-to-date/test.md`
		expect(mdTOCGenerator.bind(null, ["--ci", "--paths", inputMarkdown])).toThrow(
			`Expected ToC to be up to date. Please run 'yarn toc-update --paths ${inputMarkdown}' locally and commit the changes.\n`,
		)
	})
})
