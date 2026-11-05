import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { sanityConfigured } from "@/sanity/env";

export { metadata, viewport } from "next-sanity/studio";

export function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 font-sans">
        <h1 className="text-4xl">Studio not connected yet</h1>
        <p className="mt-4 text-lg text-ink-soft">
          Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> to <code>.env.local</code> (see <code>.env.example</code>) and restart the
          site. Then this page becomes your editor for products, orders and requests.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
