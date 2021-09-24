const util = require("util")
const writeFile = util.promisify(require("fs").writeFile)
const { mdTOCGenerator } = require("../src/md-toc-generator")

let stdout
process.stdout.write = s => {
	stdout += s
}

describe("md-toc-generator", () => {
	beforeEach(() => {
		stdout = ""
	})

	it("should fail if no markdown files exist", () => {
		try {
			mdTOCGenerator(["--paths", `${__dirname}/examples/should-fail-if-no-markdown-files-exist`])
		} catch (e) {
			expect(e.message).toContain("No markdown file provided or file doesn't exist.")
		}
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

	it("should fail if no placeholder found", () => {
		try {
			mdTOCGenerator(["--paths", `${__dirname}/examples/should-fail-if-no-placeholder-found/test.md`])
		} catch (e) {
			expect(e.message)
				.toBe(`No placeholder for ToC found. Add the following snippet to '${__dirname}/examples/should-fail-if-no-placeholder-found/test.md'

[//]: # "BEGIN_TOC"
...
[//]: # "END_TOC"\n`)
		}
	})

	it("should fail in CI mode if ToC is not up to date", async () => {
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

		try {
			mdTOCGenerator(["--ci", "--paths", inputMarkdown])
		} catch (e) {
			expect(e.message).toBe(
				`Expected ToC to be up to date. Please run 'yarn toc-update --paths ${inputMarkdown}' locally and commit the changes.\n`,
			)
		}
	})
})
