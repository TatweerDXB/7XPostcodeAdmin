import type { Metadata } from "next";
import ThemeRegistry from "@/theme/ThemeRegistry";
import PortalLayout from "@/components/layout/PortalLayout";
import "@/styles/globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400;1,600&family=Cairo:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeRegistry>
          <PortalLayout>{children}</PortalLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}

