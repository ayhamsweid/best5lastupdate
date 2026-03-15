import { headers } from 'next/headers';
import './globals.css';
import { JsonLd } from '@/components/json-ld';
import { defaultLang, dirForLang, isLang } from '@/lib/i18n';
import { organizationSchema } from '@/lib/schema';

export const metadata = {
  metadataBase: new URL('https://best5.com.tr')
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get('x-pathname') || `/${defaultLang}`;
  const segment = pathname.split('/')[1];
  const lang = isLang(segment) ? segment : defaultLang;

  return (
    <html lang={lang} dir={dirForLang(lang)}>
      <body>
        <JsonLd data={organizationSchema()} />
        {children}
      </body>
    </html>
  );
}
