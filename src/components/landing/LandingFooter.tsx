"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import {
  PHONE,
  EMAIL,
  WHATSAPP,
  PLATFORM_HOME,
  PLATFORM_REGISTER,
  PLATFORM_PROJECTS,
  QUICK_LINKS,
  FOOTER_SERVICES,
  LEGAL_LINKS,
  SOCIAL_LINKS,
} from "@/lib/landing-content";

export default function LandingFooter() {
  return (
    <footer className="bg-[#0A2540] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/assets/ip-logo-new-DYkw7ula.png" alt="Intelligent Projects" className="h-10 w-auto object-contain" />
            </div>
            <p className="mt-3 text-sm font-semibold text-white">Turn Ideas into Intelligent Realities</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Empowering businesses with smart, scalable, and sustainable solutions.
            </p>
            <Link
              href={PLATFORM_REGISTER}
              className="mt-4 inline-flex rounded-md bg-amber-500 px-5 py-2.5 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
            >
              Get Started on ABC
            </Link>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Services</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_SERVICES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Legal</h4>
            <ul className="mt-4 space-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mt-8 text-sm font-bold uppercase tracking-wider text-white">Contact Us</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a href={PHONE} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <Phone className="h-3.5 w-3.5 text-amber-400" /> +971 50 424 1653
                </a>
              </li>
              <li>
                <a href={EMAIL} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <Mail className="h-3.5 w-3.5 text-amber-400" /> info@intelligentprojects.co
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-3.5 w-3.5 text-amber-400" /> Ajman Free Zone
              </li>
            </ul>
            <h4 className="mt-8 text-sm font-bold uppercase tracking-wider text-white">Follow Us</h4>
            <ul className="mt-4 flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row">
          <p>© 2026 Intelligent Projects. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href={PLATFORM_HOME} className="hover:text-white transition-colors">
              Back to ABC Platform
            </Link>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}