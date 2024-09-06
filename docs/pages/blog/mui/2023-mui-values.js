import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './2023-mui-values.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
