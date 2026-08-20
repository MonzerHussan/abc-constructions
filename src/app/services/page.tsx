import type { Metadata } from "next";
import ServicesPage from "@/components/landing/ServicesPage";

export const metadata: Metadata = {
  title: "Our Services | Intelligent Projects UAE",
  description:
    "Explore Intelligent Projects' full range of services — AI solutions & automation, e-commerce, management and marketing consultancy, investment advisory, and commercial brokerage.",
};

export default function CompanyServicesPage() {
  return <ServicesPage />;
}
