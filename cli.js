#!/usr/bin/env node
const meow = require('meow');
const converter = require('./converter');

const cli = meow(
  `
	Usage
	  $ arvis-plist-converter [info.plist file]

	Examples
	  $ arvis-plist-converter info.plist
`,
  {
    flags: {}
  }
);

converter(cli.input[0], cli.flags);
