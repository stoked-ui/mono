import * as React from 'react';
import Divider from '@mui/material/Divider';
import Head from '@stoked-ui/docs/Layouts/Head';
import AppHeader from '@stoked-ui/docs/Layouts/AppHeader';
import AppFooter from '@stoked-ui/docs/Layouts/AppFooter';
import TemplateHero from 'docs/src/components/productTemplate/TemplateHero';
import ValueProposition from 'docs/src/components/home/ValueProposition';
import TemplateDemo from 'docs/src/components/productTemplate/TemplateDemo';
import Testimonials from 'docs/src/components/home/Testimonials';
import HeroEnd from '@stoked-ui/docs/components/HeroEnd';
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';
import References, { TEMPLATES_CUSTOMERS } from 'docs/src/components/home/References';
import AppHeaderBanner from '@stoked-ui/docs/banner/AppHeaderBanner';

export default function Templates() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Fully built Stoked UI templates - SUI"
        description="A collection of 4.5 average rating templates, selected and curated by SUI's team of maintainers to get your projects up and running today."
        card="/static/social-previews/templates-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <TemplateHero />
        <References companies={TEMPLATES_CUSTOMERS} />
        <Divider />
        <ValueProposition />
        <Divider />
        <TemplateDemo />
        <Divider />
        <Testimonials />
        <Divider />
        <HeroEnd />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
