"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/lib/LanguageContext";

const ProjectMapInner = dynamic(() => import("@/components/ProjectMapInner"), { ssr: false });

export interface ProjectMarker {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  status: string;
}

interface ProjectMapProps {
  projects: ProjectMarker[];
  height?: string;
}

export default function ProjectMap({ projects, height = "400px" }: ProjectMapProps) {
  const { language } = useLanguage();

  if (projects.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm">
        {language === "ar" ? "لا توجد مشاريع على الخريطة" : language === "en" ? "No projects on the map" : "نقشے پر کوئی منصوبہ نہیں"}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <ProjectMapInner projects={projects} />
    </div>
  );
}
