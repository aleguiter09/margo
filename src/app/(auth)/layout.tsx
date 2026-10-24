import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-surface flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl flex-col justify-center px-4 sm:px-6">
        <Link
          href="/"
          className="focus-visible:ring-ring rounded-md focus-visible:outline-none focus-visible:ring-2"
        >
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

      <main className="flex flex-1 flex-col items-center pt-6 px-4">
        {children}
      </main>
    </div>
  );
}
