import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Unsolicited Advice Jar",
  description:
    "A place to drop every ridiculous thing someone said to you about your body. You're not alone.",
};

export default function JarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
