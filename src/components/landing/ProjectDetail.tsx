"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, Boxes, Clock, CheckCircle2 } from "lucide-react";
import { COMPANY_PROJECTS, PLATFORM_PROJECTS } from "@/lib/landing-content";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

type Project = (typeof COMPANY_PROJECTS)[number];

export default function ProjectDetail({ project }: { project: Project }) {
  const others = COMPANY_PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);
  const comingSoon = project.status === "coming-soon";

  return (
    <>
      <LandingHeader />

      <main>
        <section className="relative bg-[#0A2540] py-16 text-white md:py-24">
          <img src={project.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#0A2540]/80" />
          <div className="relative mx-auto max-w-7xl px-4">
            <Link
              href={PLATFORM_PROJECTS}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Projects
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">Our Projects</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-extrabold md:text-5xl">{project.title}</h1>
            <p className="mt-2 text-lg font-semibold text-amber-400">{project.tagline}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">{project.description}</p>
            <span
              className={`mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                comingSoon ? "bg-white/15 text-white" : "bg-amber-500 text-[#0A2540]"
              }`}
            >
              {comingSoon ? <Clock className="h-3 w-3" /> : <Boxes className="h-3 w-3" />}
              {comingSoon ? "Coming Soon" : "Live"}
            </span>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-extrabold text-[#0A2540]">About This Project</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">{project.description}</p>
                <div className="mt-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A2540]">Details</h3>
                  <ul className="mt-4 space-y-3">
                    {project.details.map((d) => (
                      <li key={d.label} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <span className="text-sm text-slate-700 md:text-base">
                          <span className="font-semibold text-[#0A2540]">{d.label}:</span> {d.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {comingSoon ? (
                    <Link
                      href={PLATFORM_PROJECTS}
                      className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
                    >
                      View Other Projects
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href={project.href}
                      className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
                    >
                      Open Platform
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="relative h-72 overflow-hidden rounded-xl shadow-sm lg:h-auto">
                <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/40 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Explore More</p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#0A2540] md:text-3xl">Other Projects</h2>
              </div>
              <Link href={PLATFORM_PROJECTS} className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-500">
                View All Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={comingSoon ? PLATFORM_PROJECTS : p.href}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#0A2540]">{p.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-amber-600">{p.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
