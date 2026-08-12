import HomePageClient from "@/components/homepage/HomePageClient";
import { getHomepageData } from "@/lib/homepage";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const data = await getHomepageData();
  const params = await searchParams;
  const auth = params.auth;
  return <HomePageClient data={data} authParam={typeof auth === "string" ? auth : undefined} />;
}