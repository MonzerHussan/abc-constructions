"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import {
  PLATFORM_HOME,
  PLATFORM_LOGIN,
  PLATFORM_REGISTER,
  PLATFORM_PROJECTS,
  PLATFORM_MARKETPLACE,
  WHATSAPP,
} from "@/lib/landing-content";

const NAV_SERVICES = [
  { label: "AI Solutions & Automation", href: PLATFORM_HOME },
  { label: "E-commerce Solutions", href: PLATFORM_MARKETPLACE },
  { label: "Commercial Brokerage", href: PLATFORM_HOME },
  { label: "Investment Advisory", href: PLATFORM_HOME },
  { label: "Management Consultancy", href: PLATFORM_HOME },
  { label: "Marketing Consultancy", href: PLATFORM_HOME },
];

const NAV_PROJECTS = [
  { label: "All Projects", href: PLATFORM_PROJECTS },
  { label: "Completed", href: PLATFORM_PROJECTS },
  { label: "Coming Soon", href: PLATFORM_PROJECTS },
  { label: "Under Progress", href: PLATFORM_PROJECTS },
  { label: "Ideas", href: PLATFORM_PROJECTS },
];

export default function LandingHeader() {
  const [open, setOpen] = useState<null | "services" | "projects" | "mobile">(null);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A2540]/95 backdrop-blur border-b border-white/10">
      <div className="hidden border-b border-white/10 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-white/70">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-amber-400" />
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              WhatsApp: +971 50 424 1653
            </a>
          </span>
          <div className="flex items-center gap-3">
            <Link href={PLATFORM_LOGIN} className="hover:text-white transition-colors">Login</Link>
            <span className="text-white/30">|</span>
            <Link href={PLATFORM_REGISTER} className="hover:text-white transition-colors">Create Account</Link>
            <span className="text-white/30">|</span>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Enquire Now</a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href={PLATFORM_HOME} className="flex items-center gap-2.5">
          <img src="/assets/ip-logo-header-DAMZfvjA.png" alt="Intelligent Projects" className="h-9 w-auto object-contain" />
          <div className="leading-tight">
            <span className="block text-sm font-bold text-white">Intelligent Projects</span>
            <span className="block text-[10px] uppercase tracking-widest text-amber-400">Turn Ideas Into Intelligent Realities</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavItem href={PLATFORM_HOME} label="Home" />
          <NavDropdown
            open={open === "services"}
            onOpen={() => setOpen(open === "services" ? null : "services")}
            label="Services"
            items={NAV_SERVICES}
          />
          <NavDropdown
            open={open === "projects"}
            onOpen={() => setOpen(open === "projects" ? null : "projects")}
            label="Projects"
            items={NAV_PROJECTS}
          />
          <NavItem href={PLATFORM_PROJECTS} label="Partners" />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            WhatsApp
          </a>
          <Link
            href={PLATFORM_LOGIN}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#0A2540] hover:bg-amber-400 transition-colors"
          >
            Enquire Now
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-white hover:bg-white/10 transition-colors lg:hidden"
          aria-label="Menu"
          onClick={() => setOpen(open === "mobile" ? null : "mobile")}
        >
          {open === "mobile" ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open === "mobile" && (
        <div className="border-t border-white/10 bg-[#0A2540] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            <MobileLink href={PLATFORM_HOME} label="Home" onNavigate={() => setOpen(null)} />
            <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-white/50">Services</p>
            {NAV_SERVICES.map((s) => (
              <MobileLink key={s.label} href={s.href} label={s.label} onNavigate={() => setOpen(null)} />
            ))}
            <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-white/50">Projects</p>
            {NAV_PROJECTS.map((p) => (
              <MobileLink key={p.label} href={p.href} label={p.label} onNavigate={() => setOpen(null)} />
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Link href={PLATFORM_LOGIN} onClick={() => setOpen(null)} className="rounded-md border border-white/20 px-4 py-2 text-center text-sm font-medium text-white">
                Login
              </Link>
              <Link href={PLATFORM_REGISTER} onClick={() => setOpen(null)} className="rounded-md bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-[#0A2540]">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors">
      {label}
    </Link>
  );
}

function NavDropdown({
  open,
  onOpen,
  label,
  items,
}: {
  open: boolean;
  onOpen: () => void;
  label: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onOpen}>
      <button type="button" onClick={onOpen} className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors">
        {label}
        <span className="ml-1 inline-block text-[10px]">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-1">
          <div className="w-60 rounded-md border border-slate-200 bg-white py-1.5 shadow-xl">
            {items.map((item) => (
              <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0A2540]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link href={href} onClick={onNavigate} className="rounded-md px-2 py-2 text-sm font-medium text-white/85 hover:bg-white/10 transition-colors">
      {label}
    </Link>
  );
}