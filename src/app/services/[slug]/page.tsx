import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES } from "@/lib/landing-content";
import ServiceDetail from "@/components/landing/ServiceDetail";

export const dynamicParams = true;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const service = SERVICES.find((s) => s.slug === slug);
    if (!service) return { title: "Service Not Found | Intelligent Projects UAE" };
    return {
      title: `${service.title} | Intelligent Projects UAE`,
      description: service.description,
    };
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <div className="min-h-screen bg-white">
      <ServiceDetail service={service} />
    </div>
  );
}
