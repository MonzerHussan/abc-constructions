"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { SERVICES, PLATFORM_HOME, PLATFORM_SERVICES, PHONE } from "@/lib/landing-content";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

type Service = (typeof SERVICES)[number];

export default function ServiceDetail({ service }: { service: Service }) {
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <LandingHeader />

      <main>
        <section className="relative bg-[#0A2540] py-16 text-white md:py-24">
          <img src={service.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#0A2540]/80" />
          <div className="relative mx-auto max-w-7xl px-4">
            <Link
              href={PLATFORM_SERVICES}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Services
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">Our Services</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-extrabold md:text-5xl">{service.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">{service.description}</p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-extrabold text-[#0A2540]">What&apos;s Included</h2>
                <ul className="mt-6 space-y-4">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                      <span className="text-sm leading-relaxed text-slate-700 md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={PLATFORM_HOME}
                    className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
                  >
                    Get Started on ABC
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={PHONE}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-[#0A2540] hover:bg-slate-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Contact Us
                  </a>
                </div>
              </div>
              <div className="relative h-72 overflow-hidden rounded-xl shadow-sm lg:h-auto">
                <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
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
                <h2 className="mt-1 text-2xl font-extrabold text-[#0A2540] md:text-3xl">Other Services</h2>
              </div>
              <Link href={PLATFORM_SERVICES} className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-500">
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((s) => (
                <Link
                  key={s.slug}
                  href={s.href}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={s.image} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#0A2540]">{s.title}</h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
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
