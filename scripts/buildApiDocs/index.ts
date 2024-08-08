import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ProjectSettings, buildApi } from '@stoked-ui/internal-api-docs-builder';
import { fileExplorerSettings } from './fileExplorerSettings';

const projectSettings: ProjectSettings[] = [
  fileExplorerSettings,
];

type CommandOptions = { grep?: string };

async function run(argv: yargs.ArgumentsCamelCase<CommandOptions>) {
  const grep = argv.grep == null ? null : new RegExp(argv.grep);
  return buildApi(projectSettings, grep);
}

yargs(hideBin(process.argv))
  .command({
    command: '$0',
    describe: 'Generates API documentation for the SUI packages.',
    builder: (command) => {
      return command.option('grep', {
        description:
          'Only generate files for component filenames matching the pattern. The string is treated as a RegExp.',
        type: 'string',
      });
    },
    handler: run,
  })
  .help()
  .strict(true)
  .version(false)
  .parse();
