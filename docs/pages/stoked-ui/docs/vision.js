import * as React from 'react';
import MarkdownDocs from '@stoked-ui/docs/Markdown/MarkdownDocs';
import * as pageProps from 'docs/data/stoked-ui/vision/vision.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
