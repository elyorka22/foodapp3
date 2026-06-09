import { localBusinessJsonLd, organizationJsonLd } from '@/lib/seo';

type Props = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SiteJsonLd() {
  return <JsonLd data={[organizationJsonLd, localBusinessJsonLd]} />;
}
