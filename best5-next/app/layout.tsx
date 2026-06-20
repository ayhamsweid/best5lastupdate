import { headers } from 'next/headers';
import Script from 'next/script';
import './globals.css';
import { JsonLd } from '@/components/json-ld';
import { defaultLang, dirForLang, isLang } from '@/lib/i18n';
import { organizationSchema } from '@/lib/schema';

const GA_MEASUREMENT_ID = 'G-ESX7XLJTBP';

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
