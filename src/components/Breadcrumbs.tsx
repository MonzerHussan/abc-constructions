"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
      <Link href="/" className="hover:text-surface-700">
        الرئيسية
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-surface-700">
              {item.label}
            </Link>
          ) : (
            <span className="text-surface-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
