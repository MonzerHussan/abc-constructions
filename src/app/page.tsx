import type { Metadata } from "next";
import LandingFrame from "@/components/landing/LandingFrame";

export const metadata: Metadata = {
  title:
    "Intelligent Projects UAE | AI Solutions, Digital Transformation & Business Consultancy in Dubai",
  description:
    "Leading UAE business consultancy providing AI automation, e-commerce development, commercial brokerage, investment advisory, and digital transformation services across Dubai, GCC, and Middle East.",
};

export default function LandingPage() {
  return <LandingFrame />;
}