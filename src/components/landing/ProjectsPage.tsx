"use client";

import Link from "next/link";
import { ArrowRight, Boxes, Clock } from "lucide-react";
import { COMPANY_PROJECTS, PLATFORM_HOME, PLATFORM_PROJECTS } from "@/lib/landing-content";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

const STATUS_BADGE: Record<string, string> = {
  live: "Live",
  "coming-soon": "Coming Soon",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <main>
        <section className="relative bg-[#0A2540] py-16 text-white md:py-24">
          <img src="/assets/all-projects-D-dbCtak.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#0A2540]/80" />
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">Our Projects</p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">Explore Our Products</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
              A growing portfolio of digital products and platforms built by Intelligent Projects.
              ABC is live today — more experiences are on the way.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {COMPANY_PROJECTS.map((project) => {
                const comingSoon = project.status === "coming-soon";
                const content = (
                  <>
                    <div className="relative h-52 overflow-hidden">
                      <img src={project.image} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className={`absolute inset-0 ${comingSoon ? "bg-[#0A2540]/75" : "bg-gradient-to-t from-[#0A2540]/70 to-transparent"}`} />
                      <span
                        className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          comingSoon ? "bg-white/15 text-white" : "bg-amber-500 text-[#0A2540]"
                        }`}
                      >
                        {comingSoon ? <Clock className="h-3 w-3" /> : <Boxes className="h-3 w-3" />}
                        {STATUS_BADGE[project.status]}
                      </span>
                      <div className="absolute bottom-0 inset-x-0 p-5">
                        <h2 className="text-2xl font-extrabold text-white">{project.title}</h2>
                        <p className="text-sm font-semibold text-amber-400">{project.tagline}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-sm leading-relaxed text-slate-600">{project.description}</p>
                      {comingSoon ? (
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400">
                          Link coming soon
                        </span>
                      ) : (
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                          Open Platform
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </div>
                  </>
                );

                return comingSoon ? (
                  <div
                    key={project.slug}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    {content}
                  </div>
                ) : (
                  <Link
                    key={project.slug}
                    href={project.href}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-xl bg-[#0A2540] px-6 py-10 text-center text-white sm:flex-row sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Interested in the ABC Platform?</h2>
                <p className="mt-1 text-sm text-white/70">Create an account and explore marketplaces, tenders, and procurement tools.</p>
              </div>
              <Link
                href={PLATFORM_HOME}
                className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
              >
                Open ABC Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}