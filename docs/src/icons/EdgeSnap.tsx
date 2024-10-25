import * as React from 'react';
import RootSvg, { RootSvgProps } from 'docs/src/icons/RootSvg';

function EdgeSnap(props: RootSvgProps) {
  return (<RootSvg
      xmlns="http://www.w3.org/2000/svg"
      width={24} height={24}
      viewBox="0 0 24 24"
      {...props}
    >
        <path
          d="M10 4H6V1H5v3H1v1h4v4H1v1h4v4H1v1h4v4H1v1h4v3h1v-3h4v3h1V1h-1zM6 5h4v4H6zm0 5h4v4H6zm0 9v-4h4v4zM17.8 6H12v4h5.8a2 2 0 0 1 0 4H12v4h5.8a6 6 0 0 0 0-12zM13 7h2v2h-2zm0 8h2v2h-2zm4.8 2H16v-2h1.8a3 3 0 0 0 0-6H16V7h1.8a5 5 0 0 1 0 10z"/>
        <path fill="col" d="M0 0h24v24H0z"/>
    </RootSvg>);
}

export default EdgeSnap;
