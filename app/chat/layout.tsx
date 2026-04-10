import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Rooms",
  description:
    "Connect with others who get it. Real talk, real support, zero judgment.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
