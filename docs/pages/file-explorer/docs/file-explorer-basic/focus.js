import * as React from 'react';
import MarkdownDocs from '@stoked-ui/docs/Markdown/MarkdownDocs';
import * as pageProps from '../../../../data/file-explorer/docs/file-explorer-basic/focus/focus.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
