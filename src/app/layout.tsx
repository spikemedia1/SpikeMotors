import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Epilogue, Inter, JetBrains_Mono } from "next/font/google";
import { allowIndexing, site } from "@/data/config";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--nf-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Inter({
  variable: "--nf-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--nf-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const logo = Epilogue({
  variable: "--nf-logo",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  alternates: { canonical: "/" },
  robots: allowIndexing ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Antes da pintura: decide se a Ignição aparece (já ligou na sessão, hash direto ou reduced-motion). */
const preIgnition = `(function(){try{var d=document.documentElement;var s=false;try{s=sessionStorage.getItem('spike-ignited')==='1'}catch(e){}var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var h=location.hash.length>1;if(s||r||h){d.setAttribute('data-skip-ignition','')}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} ${logo.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preIgnition }} />
      </head>
      <body>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
        <div aria-hidden className="vignette" />
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
