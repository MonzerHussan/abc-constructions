"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SERVICES, PROJECT_CATEGORIES, VALUES, PLATFORM_PROJECTS } from "@/lib/landing-content";

export function ServicesSection() {
  return (
    <section id="services" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Our Services</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#0A2540] md:text-4xl">Comprehensive Business Solutions</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            From AI automation to strategic consultancy, we deliver intelligent solutions tailored to your business needs.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={service.image} alt={service.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0A2540]">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyUsSection() {
  return (
    <section className="relative bg-[#0A2540] py-16 text-white md:py-24">
      <img src="/assets/values-bg-GlMxe3UP.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-[#0A2540]/70" />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">Why Choose Intelligent Projects?</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Building Tomorrow, Together</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
              We combine technology, strategy, and insight to deliver intelligent solutions that drive real results.
              Our multidisciplinary team ensures every client receives customized, impactful, and future-ready solutions.
            </p>
            <Link
              href={PLATFORM_PROJECTS}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
            >
              View Our Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value} className="rounded-xl border border-white/15 bg-white/5 p-5 text-center backdrop-blur-sm">
                <CheckCircle2 className="mx-auto h-7 w-7 text-amber-400" />
                <p className="mt-2 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Our Projects</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#0A2540] md:text-4xl">Explore Our Portfolio</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            Discover the projects we have delivered, and the ones we are bringing to life across the region.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECT_CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative h-56 overflow-hidden rounded-xl shadow-sm"
            >
              <img src={cat.image} alt={cat.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/85 via-[#0A2540]/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5">
                <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400">
                  Open on ABC
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
          <Link
            href={PLATFORM_PROJECTS}
            className="group relative flex h-56 flex-col items-center justify-center rounded-xl bg-amber-500 text-center shadow-sm transition-colors hover:bg-amber-400"
          >
            <p className="text-2xl font-extrabold text-[#0A2540]">View All Projects</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A2540]">
              on ABC Platform
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}