import Image from 'next/image';
import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative h-[calc(100vh-4.5rem)] min-h-[560px] overflow-hidden border-b border-border bg-background">
      {/* Text — wider left column pushes art to the right edge */}
      <div className="relative z-10 flex h-full w-full items-center px-6 md:absolute md:inset-y-0 md:left-0 md:w-[58%] md:px-10 lg:w-[56%] lg:px-14 xl:px-20">
        <div className="w-full max-w-none">
          <h1 className="font-display text-[3.75rem] leading-[1.02] font-bold tracking-[-0.03em] text-foreground md:text-[5.25rem] lg:text-[6.75rem] xl:text-[7.5rem]">
            Human stories
            <br />
            &amp; ideas
          </h1>
          <p className="mt-7 max-w-[32rem] font-sans text-xl leading-snug text-foreground md:max-w-[36rem] md:text-2xl lg:text-[1.65rem]">
            A place to read, write, and deepen your understanding
          </p>
          <div className="mt-11">
            <Link
              href="#trending"
              className="inline-flex h-[3.25rem] min-w-[12.5rem] items-center justify-center rounded-pill bg-button-primary px-10 text-lg font-medium text-button-primary-foreground no-underline transition-colors hover:bg-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2"
            >
              Start reading
            </Link>
          </div>
        </div>
      </div>

      {/* Art — pinned to the right corner */}
      <div className="pointer-events-none absolute top-1/2 right-0 hidden aspect-[1152/1504] h-[min(90%,740px)] -translate-y-1/2 md:block">
        <Image
          src="/images/hero-art.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1280px) 38vw, 480px"
          className="object-contain object-right"
        />
      </div>
    </section>
  );
}
