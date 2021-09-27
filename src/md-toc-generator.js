#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const toc = require("markdown-toc/index.js")

const resolveArgument = (argv, name, hasValue = false) => {
	const argumentIndex = argv.findIndex(element => element === `--${name}`)
	if (argumentIndex === -1) return false
	if (!hasValue) return true

	return argv.filter((value, index) => index > argumentIndex)
}

const processToCInPath = (filePath, isCI, isPlaceholderRequired) => {
	if (!filePath.match(/\.md$/) || !fs.existsSync(filePath)) {
		throw new Error(
			`\nNo markdown file provided or file doesn't exist. Usage: '${path.basename(
				__filename,
			)} --paths <MARKDOWN_FILE>'.\n`,
		)
	}

	const markdownContent = fs.readFileSync(filePath).toString()
	if (!markdownContent.match(/\[\/\/]: # .?BEGIN_TOC.?/) || !markdownContent.match(/\[\/\/]: # .?END_TOC.?/)) {
		if (isPlaceholderRequired) {
			throw new Error(`No placeholder for ToC found. Add the following snippet to '${filePath}'

[//]: # "BEGIN_TOC"
...
[//]: # "END_TOC"
`)
		} else {
			process.stdout.write(`Skipping '${filePath}' because no placeholder was found.\n`)
			return
		}
	}

	const options = {
		firsth1: false,
		bullets: "1.",
	}
	process.stdout.write(`\nThe markdown file '${filePath}' will be processed for ToC generation!\n`)
	const generatedToC = toc(markdownContent, options).content.replace(/ {2}/g, " ".repeat(4))

	if (!markdownContent.includes(generatedToC)) {
		if (isCI) {
			throw new Error(
				`Expected ToC to be up to date. Please run 'yarn toc-update --paths ${filePath}' locally and commit the changes.\n`,
			)
		}

		process.stdout.write(`Updating the ToC for you….\n`)

		fs.writeFileSync(
			filePath,
			markdownContent.replace(
				/\[\/\/]: # .?BEGIN_TOC.?[\s\S]+?\[\/\/]: # .?END_TOC.?/,
				`[//]: # "BEGIN_TOC"\n\n${generatedToC}\n\n[//]: # "END_TOC"`,
			),
		)
	} else {
		process.stdout.write(`✨  ToC in '${filePath}' is up to date.\n`)
	}
}

exports.mdTOCGenerator = argv => {
	const isCI = resolveArgument(argv, "ci")
	const isPlaceholderRequired = resolveArgument(argv, "placeholder-required")
	let paths = resolveArgument(argv, "paths", true)

	if (!paths) {
		paths = ["README.md"]
		process.stdout.write(`No markdown file was provided. Defaulting to root 'README.md'.\n`)
	}

	paths.forEach(filePath => {
		processToCInPath(filePath, isCI, isPlaceholderRequired)
	})
}
