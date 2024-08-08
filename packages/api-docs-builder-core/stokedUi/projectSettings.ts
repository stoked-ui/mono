import path from 'path';
import { LANGUAGES } from 'docs/config';
import { ProjectSettings } from '@stoked-ui/internal-api-docs-builder';
import findApiPages from '@stoked-ui/internal-api-docs-builder/utils/findApiPages';
import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_isGlobalState as isGlobalState,
} from '@mui/utils';
import { getStokedUiComponentInfo } from './getStokedUiComponentInfo';

export const projectSettings: ProjectSettings = {
  output: {
    apiManifestPath: path.join(process.cwd(), 'docs/data/stoked-ui/pagesApi.js'),
  },
  typeScriptProjects: [
    {
      name: 'material',
      rootPath: path.join(process.cwd(), 'packages/sui-file-explorer'),
      entryPointPath: [
        'src/index.d.ts',
        'src/PigmentStack/PigmentStack.tsx',
        'src/PigmentContainer/PigmentContainer.tsx',
        'src/PigmentHidden/PigmentHidden.tsx',
        'src/PigmentGrid/PigmentGrid.tsx',
      ],
    },
  ],
  getApiPages: () => findApiPages('docs/pages/stoked-ui/api'),
  getComponentInfo: getStokedUiComponentInfo,
  translationLanguages: LANGUAGES,
  skipComponent(filename: string) {
    return (
      filename.match(
        /(ThemeProvider|CssVarsProvider|DefaultPropsProvider|InitColorSchemeScript|Grid2)/,
      ) !== null
    );
  },
  translationPagesDirectory: 'docs/translations/api-docs',
  generateClassName: generateUtilityClass,
  isGlobalClassName: isGlobalState,
  // #default-branch-switch
  baseApiUrl: 'https://next.mui.com',
};
