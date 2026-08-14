import type { Metadata } from "next";
import ProjectsPage from "@/components/landing/ProjectsPage";

export const metadata: Metadata = {
  title: "Our Projects | Intelligent Projects UAE",
  description:
    "Explore the digital products and platforms built by Intelligent Projects — including the ABC business & tenders platform, with more projects coming soon.",
};

export default function CompanyProjectsPage() {
  return <ProjectsPage />;
}