"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES, PLATFORM_HOME } from "@/lib/landing-content";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <main>
        <section className="relative bg-[#0A2540] py-16 text-white md:py-24">
          <img src="/assets/hero-2-_c-4ndvZ.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#0A2540]/80" />
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">Our Services</p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">Comprehensive Business Solutions</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
              From AI automation to strategic consultancy, we deliver intelligent, scalable solutions tailored to your business needs.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={service.href}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={service.image} alt={service.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold text-[#0A2540]">{service.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-xl bg-[#0A2540] px-6 py-10 text-center text-white sm:flex-row sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Need a Tailored Solution?</h2>
                <p className="mt-1 text-sm text-white/70">Get in touch with our team to discuss your business goals.</p>
              </div>
              <Link
                href={PLATFORM_HOME}
                className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
              >
                Explore the ABC Platform
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
