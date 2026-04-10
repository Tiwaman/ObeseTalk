import type { Metadata } from "next";
import LandingHub from "./landing-hub";

export const metadata: Metadata = {
  title: "A place built with love",
  description: "Explore tools and spaces for people who deserve better.",
};

export default function Page() {
  return <LandingHub />;
}
