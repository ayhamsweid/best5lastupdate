import { headers } from 'next/headers';
import Script from 'next/script';
const GA_MEASUREMENT_ID = 'G-ESX7XLJTBP';
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
    <html lang={lang} dir={dirForLang(lang)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var k='best5-theme';var s=localStorage.getItem(k);var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();"
          }}
        />
      </head>
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
