import type { Metadata } from "next";
import { Space_Grotesk, Cairo } from "next/font/google";
import ThemeRegistry from "@/theme/ThemeRegistry";
import PortalLayout from "@/components/layout/PortalLayout";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "7X - UAE Postcode Digital Addressing System",
  description:
    "A unified platform to explore, manage and access postcode, buildings, units and addresses across the UAE.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${cairo.variable}`}
    >
      <body className={cairo.className}>
        <ThemeRegistry>
          <PortalLayout>{children}</PortalLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}

