import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const RESOURCES = ["config", "zone", "slide", "menu", "menuitem", "footerlink", "ad"] as const;
type Resource = (typeof RESOURCES)[number];

function isResource(v: unknown): v is Resource {
  return typeof v === "string" && (RESOURCES as readonly string[]).includes(v);
}

// GET /api/admin/homepage?resource=config|zone|slide|menu|menuitem|footerlink|ad
export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  if (!isResource(resource)) {
    return NextResponse.json({ error: "resource is required" }, { status: 400 });
  }

  switch (resource) {
    case "config":
      return NextResponse.json(await prisma.homepageConfig.findMany({ orderBy: { key: "asc" } }));
    case "zone":
      return NextResponse.json(await prisma.homepageZone.findMany({ orderBy: [{ location: "asc" }, { order: "asc" }] }));
    case "slide":
      return NextResponse.json(await prisma.homepageSlide.findMany({ orderBy: { order: "asc" } }));
    case "menu": {
      const menus = await prisma.headerMenu.findMany({
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      });
      return NextResponse.json(menus);
    }
    case "menuitem":
      return NextResponse.json(await prisma.headerMenuItem.findMany({ orderBy: { order: "asc" } }));
    case "footerlink":
      return NextResponse.json(await prisma.footerLink.findMany({ orderBy: { order: "asc" } }));
    case "ad":
      return NextResponse.json(await prisma.homepageAd.findMany({ orderBy: { order: "asc" } }));
  }
}

// POST /api/admin/homepage?resource=...  (create new record)
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  if (!isResource(resource)) return NextResponse.json({ error: "resource is required" }, { status: 400 });

  const body = await req.json();

  try {
    switch (resource) {
      case "config": {
        const { key, logoUrl, ctaLabel, ctaHref, heroTitle, heroSubtitle, heroDescription, footerText, showLanguage, showLogin, showRegister } = body;
        const row = await prisma.homepageConfig.create({
          data: {
            key: key || "main",
            logoUrl: logoUrl ?? null,
            ctaLabel: ctaLabel ?? undefined,
            ctaHref: ctaHref ?? null,
            heroTitle: heroTitle ?? undefined,
            heroSubtitle: heroSubtitle ?? undefined,
            heroDescription: heroDescription ?? undefined,
            footerText: footerText ?? undefined,
            showLanguage: showLanguage ?? true,
            showLogin: showLogin ?? true,
            showRegister: showRegister ?? true,
          },
        });
        return NextResponse.json(row);
      }
      case "zone": {
        const b = body as {
          location?: string;
          contentType?: string;
          title?: unknown;
          body?: unknown;
          mediaUrl?: string;
          link?: string;
          order?: number;
        };
        const { location, contentType, title, body: zoneBody, mediaUrl, link, order } = b;
        if (!location) return NextResponse.json({ error: "location required" }, { status: 400 });
        const row = await prisma.homepageZone.create({
          data: {
            location,
            contentType: contentType || "TEXT",
            title: title ?? undefined,
            body: zoneBody ?? undefined,
            mediaUrl: mediaUrl ?? null,
            link: link ?? null,
            order: order ?? 0,
          },
        });
        return NextResponse.json(row);
      }
      case "slide": {
        const { title, subtitle, imageUrl, link, order } = body;
        if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
        const row = await prisma.homepageSlide.create({
          data: { title: title ?? undefined, subtitle: subtitle ?? undefined, imageUrl, link: link ?? null, order: order ?? 0 },
        });
        return NextResponse.json(row);
      }
      case "menu": {
        const { key, label, order } = body;
        if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
        const row = await prisma.headerMenu.create({ data: { key, label: label ?? undefined, order: order ?? 0 } });
        return NextResponse.json(row);
      }
      case "menuitem": {
        const { menuId, label, href, order } = body;
        if (!menuId || !href) return NextResponse.json({ error: "menuId and href required" }, { status: 400 });
        const row = await prisma.headerMenuItem.create({ data: { menuId, label: label ?? undefined, href, order: order ?? 0 } });
        return NextResponse.json(row);
      }
      case "footerlink": {
        const { label, href, order } = body;
        if (!href) return NextResponse.json({ error: "href required" }, { status: 400 });
        const row = await prisma.footerLink.create({ data: { label: label ?? undefined, href, order: order ?? 0 } });
        return NextResponse.json(row);
      }
      case "ad": {
        const { title, imageUrl, link, order } = body;
        const row = await prisma.homepageAd.create({
          data: { title: title ?? undefined, imageUrl: imageUrl ?? null, link: link ?? null, order: order ?? 0 },
        });
        return NextResponse.json(row);
      }
    }
  } catch (e) {
    console.error(`POST admin homepage ${resource} failed`, e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// PATCH /api/admin/homepage?resource=...&id=...  (update)
export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const id = url.searchParams.get("id");
  if (!isResource(resource) || !id) return NextResponse.json({ error: "resource and id required" }, { status: 400 });

  const body = await req.json();
  const clean = JSON.parse(JSON.stringify(body));

  try {
    switch (resource) {
      case "config":
        return NextResponse.json(await prisma.homepageConfig.update({ where: { id }, data: clean }));
      case "zone":
        return NextResponse.json(await prisma.homepageZone.update({ where: { id }, data: clean }));
      case "slide":
        return NextResponse.json(await prisma.homepageSlide.update({ where: { id }, data: clean }));
      case "menu":
        return NextResponse.json(await prisma.headerMenu.update({ where: { id }, data: clean }));
      case "menuitem":
        return NextResponse.json(await prisma.headerMenuItem.update({ where: { id }, data: clean }));
      case "footerlink":
        return NextResponse.json(await prisma.footerLink.update({ where: { id }, data: clean }));
      case "ad":
        return NextResponse.json(await prisma.homepageAd.update({ where: { id }, data: clean }));
    }
  } catch (e) {
    console.error(`PATCH admin homepage ${resource} failed`, e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/admin/homepage?resource=...&id=...
export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const id = url.searchParams.get("id");
  if (!isResource(resource) || !id) return NextResponse.json({ error: "resource and id required" }, { status: 400 });

  try {
    switch (resource) {
      case "config":
        await prisma.homepageConfig.delete({ where: { id } });
        break;
      case "zone":
        await prisma.homepageZone.delete({ where: { id } });
        break;
      case "slide":
        await prisma.homepageSlide.delete({ where: { id } });
        break;
      case "menu":
        await prisma.headerMenu.delete({ where: { id } });
        break;
      case "menuitem":
        await prisma.headerMenuItem.delete({ where: { id } });
        break;
      case "footerlink":
        await prisma.footerLink.delete({ where: { id } });
        break;
      case "ad":
        await prisma.homepageAd.delete({ where: { id } });
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`DELETE admin homepage ${resource} failed`, e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}