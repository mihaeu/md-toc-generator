const util = require("util")
const exec = util.promisify(require("child_process").exec)
const writeFile = util.promisify(require("fs").writeFile)

describe("md-toc-generator", () => {
	it("should fail if no markdown files exist", async () => {
		try {
			await exec(
				`${__dirname}/../bin/md-toc-generator --paths ${__dirname}/examples/should-fail-if-no-markdown-files-exist`,
			)
		} catch (e) {
			expect(e.code).toBe(1)
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
		const { stdout, stderr } = await exec(`${__dirname}/../bin/md-toc-generator --paths ${inputMarkdown}`)
		expect(stdout).toMatch(
			/The markdown file '.*\/tests\/examples\/should-use-paths-argument\/test.md' will be processed for ToC generation!/,
		)
		expect(stderr).toBe("")
	})

	it("should use README.md without paths argument", async () => {
		const { stdout, stderr } = await exec(
			`cd ${__dirname}/examples/should-use-README.md-without-paths-argument && ${__dirname}/../bin/md-toc-generator`,
		)
		expect(stdout).toBe(`No markdown file was provided. Defaulting to root 'README.md'.

The markdown file 'README.md' will be processed for ToC generation!
✨  ToC in 'README.md' is up to date.\n`)
		expect(stderr).toBe("")
	})

	it("should fail if no placeholder found", async () => {
		try {
			await exec(
				`${__dirname}/../bin/md-toc-generator --paths ${__dirname}/examples/should-fail-if-no-placeholder-found/test.md`,
			)
		} catch (e) {
			expect(e.code).toBe(1)
			expect(e.message)
				.toContain(`No placeholder for ToC found. Add the following snippet to '${__dirname}/examples/should-fail-if-no-placeholder-found/test.md'

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
			await exec(`${__dirname}/../bin/md-toc-generator --paths ${inputMarkdown}`)
		} catch (e) {
			expect(e.code).toBe(1)
			expect(e.message).toBe(
				`Expected ToC to be up to date. Please run 'yarn toc-update --paths ${inputMarkdown}' locally and commit the changes.\n`,
			)
		}
	})
})
