import * as React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import kebabCase from 'lodash/kebabCase';
import { useTheme } from '@mui/system';
import { exactProp } from '@mui/utils';
import { CssVarsProvider as JoyCssVarsProvider, useColorScheme } from '@mui/joy/styles';
import { useTranslate, useUserLanguage } from '../i18n';
import { BrandingProvider } from '../branding';
import ComponentsApiContent from '../Component/ComponentsApiContent';
import HooksApiContent from '../components/HooksApiContent';
import { getTranslatedHeader as getComponentTranslatedHeader } from '../ApiPage/ApiPage';
import RichMarkdownElement from '../components/RichMarkdownElement';
import { pathnameToLanguage } from '../utils/helpers';
import AppLayoutDocs from '../App/AppLayoutDocs';
import { HEIGHT as AppFrameHeight } from '../App/AppFrame';
import { HEIGHT as TabsHeight } from '../Component/ComponentPageTabs';
import { getPropsToC } from '../ApiPage/sections/PropertiesSection';
import { getClassesToC } from '../ApiPage/sections/ClassesSection';
import Box from "@mui/material/Box";

function JoyModeObserver({ mode }) {
  const { setMode } = useColorScheme();
  React.useEffect(() => {
    setMode(mode);
  }, [mode, setMode]);
  return null;
}

JoyModeObserver.propTypes = {
  mode: PropTypes.oneOf(['light', 'dark']),
};

function getHookTranslatedHeader(t, header) {
  const translations = {
    demos: t('api-docs.demos'),
    import: t('api-docs.import'),
    'hook-name': t('api-docs.hookName'),
    parameters: t('api-docs.parameters'),
    'return-value': t('api-docs.returnValue'),
  };

  // TODO Drop runtime type-checking once we type-check this file
  if (!translations.hasOwnProperty(header)) {
    throw new TypeError(
      `Unable to translate header '${header}'. Did you mean one of '${Object.keys(
        translations,
      ).join("', '")}'`,
    );
  }

  return translations[header] || header;
}

export default function MarkdownDocsV2(props) {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState(router.query.docsTab ?? '');

  const { canonicalAs } = pathnameToLanguage(router.asPath);
  const {
    disableAd = false,
    disableToc = false,
    demos = {},
    docs,
    demoComponents,
    srcComponents,
    componentsApiDescriptions,
    componentsApiPageContents,
    hooksApiDescriptions,
    hooksApiPageContents,
  } = props;

  const userLanguage = useUserLanguage();
  const t = useTranslate();

  React.useEffect(() => {
    setActiveTab(router.query.docsTab ?? '');
  }, [router.query.docsTab]);

  const localizedDoc = docs[userLanguage] || docs.en;
  // Generate the TOC based on the tab
  const demosToc = localizedDoc.toc.filter((item) => item.text !== 'API');

  function createHookTocEntry(hookName, sectionName, hookProps = {}) {
    const hookPropToc: Array<any> = new Array();
    Object.keys(hookProps).forEach((propName) => {
      hookPropToc.push({
        text: propName,
        hash: `${hookName}-${sectionName}-${propName}`,
        children: [],
      });
    });

    return {
      text: getHookTranslatedHeader(t, sectionName),
      hash: `${hookName}-${sectionName}`,
      children: hookPropToc,
    };
  }

  const hooksToc: Array<any> = new Array();
  if (hooksApiPageContents) {
    Object.keys(hooksApiPageContents).forEach((key) => {
      const { name: hookName, parameters = {}, returnValue = {} } = hooksApiPageContents[key];

      const hookNameKebabCase = kebabCase(hookName);

      const hookToc = [
        createHookTocEntry(hookNameKebabCase, 'import'),
        createHookTocEntry(hookNameKebabCase, 'parameters', parameters),
        createHookTocEntry(hookNameKebabCase, 'return-value', returnValue),
      ].filter(Boolean);

      hooksToc.push({
        text: hookName,
        hash: hookNameKebabCase,
        children: hookToc,
      });
    });
  }

  function createComponentTocEntry(
    componentName,
    sectionName,
    options = { inheritance: false, themeDefaultProps: false },
  ) {
    return {
      text: getComponentTranslatedHeader(t, sectionName),
      hash: `${componentName}-${sectionName}`,
      children: [
        ...(options.inheritance
          ? [{ text: t('api-docs.inheritance'), hash: 'inheritance', children: [] }]
          : []),
        ...(options.themeDefaultProps
          ? [{ text: t('api-docs.themeDefaultProps'), hash: 'theme-default-props', children: [] }]
          : []),
      ],
    };
  }

  const componentsApiToc: Array<any> = new Array();

  if (componentsApiPageContents) {
    Object.keys(componentsApiPageContents).forEach((key) => {
      const { componentDescriptionToc = new Array() } = componentsApiDescriptions[key][userLanguage];
      const {
        name: componentName,
        inheritance,
        slots,
        themeDefaultProps,
        classes,
        props: componentProps,
      } = componentsApiPageContents[key];
      const componentNameKebabCase = kebabCase(componentName);

      const componentApiToc = [
        createComponentTocEntry(componentNameKebabCase, 'import'),
        ...componentDescriptionToc,
        getPropsToC({
          t,
          componentName: componentNameKebabCase,
          componentProps,
          inheritance,
          themeDefaultProps,
          hash: `${componentNameKebabCase}-props`,
        }),
        slots?.length > 0 && createComponentTocEntry(componentNameKebabCase, 'slots'),
        ...getClassesToC({
          t,
          componentName: componentNameKebabCase,
          componentClasses: classes,
          hash: `${componentNameKebabCase}-classes`,
        }),
      ].filter(Boolean);

      componentsApiToc.push({
        text: componentName,
        hash: componentNameKebabCase,
        children: componentApiToc,
      });
    });
  }

  const isJoy = canonicalAs.startsWith('/joy-ui/');
  const CssVarsProvider = isJoy ? JoyCssVarsProvider : React.Fragment;

  const Wrapper = isJoy ? BrandingProvider : React.Fragment;
  const wrapperProps = {
    ...(isJoy && { mode: theme.palette.mode }),
  };

  const commonElements: Array<any> = new Array();

  let i = 0;
  let done = false;

  // process the elements before the tabs component
  while (i < localizedDoc.rendered.length && !done) {
    const renderedMarkdownOrDemo = localizedDoc.rendered[i];
    if (renderedMarkdownOrDemo.component && renderedMarkdownOrDemo.component.indexOf('Tabs') >= 0) {
      done = true;
    }
    commonElements.push(
      <RichMarkdownElement
        key={`common-elements-${i}`}
        activeTab={activeTab}
        demoComponents={demoComponents}
        demos={demos}
        disableAd={disableAd}
        localizedDoc={localizedDoc}
        renderedMarkdownOrDemo={renderedMarkdownOrDemo}
        srcComponents={srcComponents}
        theme={theme}
        WrapperComponent={Wrapper}
        wrapperProps={wrapperProps}
      />,
    );
    i += 1;
  }

  let activeToc = demosToc;

  if (activeTab === 'hooks-api') {
    activeToc = hooksToc;
  }

  if (activeTab === 'components-api') {
    activeToc = componentsApiToc;
  }

  const hasTabs = localizedDoc.rendered.some((renderedMarkdownOrDemo) => {
    if (
      typeof renderedMarkdownOrDemo === 'object' &&
      renderedMarkdownOrDemo.component &&
      renderedMarkdownOrDemo.component === 'modules/components/ComponentPageTabs.js'
    ) {
      return true;
    }
    return false;
  });

  return (
    <AppLayoutDocs
      cardOptions={{
        description: localizedDoc.headers.cardDescription,
        title: localizedDoc.headers.cardTitle,
      }}
      description={localizedDoc.description}
      disableAd={disableAd}
      disableToc={disableToc}
      location={localizedDoc.location}
      title={localizedDoc.title}
      toc={activeToc}
      disableLayout
      hasTabs={hasTabs}
    >
      <Box
        sx={{
          '--MuiDocs-header-height': hasTabs
            ? `${AppFrameHeight + TabsHeight}px`
            : `${AppFrameHeight}px`,
        }}
      >
        <CssVarsProvider>
          {isJoy && <JoyModeObserver mode={theme.palette.mode} />}
          {commonElements}
          {activeTab === '' &&
            localizedDoc.rendered
              // for the "hook only" edge case, for example Base UI autocomplete
              .slice(
                i,
                localizedDoc.rendered.length - (localizedDoc.headers.components.length > 0 ? 1 : 0),
              )
              .map((renderedMarkdownOrDemo, index) => (
                <RichMarkdownElement
                  key={`demos-section-${index}`}
                  activeTab={activeTab}
                  demoComponents={demoComponents}
                  demos={demos}
                  disableAd={disableAd}
                  localizedDoc={localizedDoc}
                  renderedMarkdownOrDemo={renderedMarkdownOrDemo}
                  srcComponents={srcComponents}
                  theme={theme}
                  WrapperComponent={Wrapper}
                  wrapperProps={wrapperProps}
                />
              ))}
          {activeTab === 'components-api' && (
            <ComponentsApiContent
              descriptions={componentsApiDescriptions}
              pageContents={componentsApiPageContents}
            />
          )}
          {activeTab === 'hooks-api' && (
            <HooksApiContent
              descriptions={hooksApiDescriptions}
              pagesContents={hooksApiPageContents}
            />
          )}
        </CssVarsProvider>
      </Box>
    </AppLayoutDocs>
  );
}

MarkdownDocsV2.propTypes = {
  componentsApiDescriptions: PropTypes.object,
  componentsApiPageContents: PropTypes.object,
  demoComponents: PropTypes.object,
  demos: PropTypes.object,
  disableAd: PropTypes.bool,
  disableToc: PropTypes.bool,
  docs: PropTypes.object.isRequired,
  hooksApiDescriptions: PropTypes.object,
  hooksApiPageContents: PropTypes.object,
  srcComponents: PropTypes.object,
};

if (process.env.NODE_ENV !== 'production') {
  MarkdownDocsV2.propTypes = exactProp(MarkdownDocsV2.propTypes);
}
