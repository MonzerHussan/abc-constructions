import { redirect } from "next/navigation";

/** ABC homepage is the product entry point — not the company landing frame. */
export default function RootPage() {
  redirect("/projects/ABC");
}
