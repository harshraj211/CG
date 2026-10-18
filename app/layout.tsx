import type { Metadata } from "next";
import { ProgressProvider } from "@/hooks/progress";
import "./globals.css";
import "./cognitive.css";
export const metadata: Metadata = {
  title: "Exceller Prep · Capgemini 2027",
  description:
    "Independent Capgemini Exceller preparation: learn, practice, code and rehearse staged assessments.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
