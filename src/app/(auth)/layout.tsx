import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-surface flex min-h-screen flex-col">
      <header className="flex w-full flex-col items-center justify-center px-4 pb-4 pt-8">
        <Link href="/" className="focus-visible:ring-ring rounded-md focus-visible:outline-none focus-visible:ring-2">
          <Image
            src="/margo-logo.png"
            alt="Margo"
            width={140}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
