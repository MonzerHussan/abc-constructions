import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPANY_PROJECTS } from "@/lib/landing-content";
import ProjectDetail from "@/components/landing/ProjectDetail";

export const dynamicParams = true;

export function generateStaticParams() {
  return COMPANY_PROJECTS.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const project = COMPANY_PROJECTS.find((p) => p.slug === slug);
    if (!project) return { title: "Project Not Found | Intelligent Projects UAE" };
    return {
      title: `${project.title} | Intelligent Projects UAE`,
      description: project.description,
    };
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = COMPANY_PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-white">
      <ProjectDetail project={project} />
    </div>
  );
}
