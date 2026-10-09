import Image from "next/image";
import Link from "next/link";

type Section = Readonly<{
  heading: string;
  paragraphs: readonly string[];
}>;

type Props = Readonly<{
  brand: string;
  title: string;
  lastUpdated: string;
  backHomeLabel: string;
  otherDocLabel: string;
  otherDocHref: string;
  sections: readonly Section[];
}>;

export function LegalDocumentLayout({
  brand,
  title,
  lastUpdated,
  backHomeLabel,
  otherDocLabel,
  otherDocHref,
  sections,
}: Props) {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="border-b border-border/80 bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/margo-logo.png"
              alt={brand}
              width={140}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {backHomeLabel}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{lastUpdated}</p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-foreground">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/80 bg-background">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <Link href="/" className="hover:text-foreground">
            {brand}
          </Link>
          <Link href={otherDocHref} className="hover:text-foreground">
            {otherDocLabel}
          </Link>
        </div>
      </footer>
    </div>
  );
}
