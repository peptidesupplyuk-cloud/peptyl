import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "Peptyl";
const BASE_URL = "https://peptyl.co.uk";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

const HREFLANG_DOMAINS = [
  { lang: "en", url: "https://peptyl.co.uk" },
  { lang: "de", url: "https://peptyl.de" },
  { lang: "fr", url: "https://peptyl.fr" },
  { lang: "x-default", url: "https://peptyl.co.uk" },
];

const SEO = ({ title, description, path, type = "website", jsonLd }: SEOProps) => {
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={url} />

      {/* hreflang alternate links */}
      {HREFLANG_DOMAINS.map(({ lang, url: domainUrl }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={`${domainUrl}${path}`} />
      ))}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="640" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
