import "@/styles/globals.css";
import "@/styles/tokens.css";
import React from "react";

export const metadata = {
  title: "AU Impact",
  description: "Volunteering, fundraising, and student life at AU.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">{children}</body>
    </html>
  );
}
