import * as React from 'react';
import Divider from '@mui/material/Divider';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import AboutHero from 'docs/src/components/about/AboutHero';
import OurValues from 'docs/src/components/about/OurValues';
import Team from 'docs/src/components/about/Team';
import HowToSupport from 'docs/src/components/about/HowToSupport';
import AboutEnd from 'docs/src/components/about/AboutEnd';
import Head from '@stoked-ui/docs/components/Head';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';

export default function About() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="About us - SUI"
        description="SUI is a 100% remote globally distributed team, supported by a community of thousands
        of developers all across the world."
        card="/static/social-previews/about-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <AboutHero />
        <Divider />
        <OurValues />
        <Divider />
        <Team />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
