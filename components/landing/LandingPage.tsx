"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";
import AuthSection from "./AuthSection";
import BookScene, { type AuthMode, type BookRefs } from "./BookScene";
import Particles from "./Particles";

gsap.registerPlugin(ScrollTrigger);

const features = [
  ["01", "Student Management"],
  ["02", "Smart Marks Entry"],
  ["03", "Performance Analytics"],
  ["04", "Rankings & Reports"],
];

export default function LandingPage() {
  const scene = useRef<HTMLElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const featureReveal = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const ctaLiveRef = useRef(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [ctaActive, setCtaActive] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const bookRefs: BookRefs = {
    stage: useRef<HTMLDivElement>(null),
    book: useRef<HTMLDivElement>(null),
    cover: useRef<HTMLDivElement>(null),
    leftPage: useRef<HTMLDivElement>(null),
  };

  /** Select the tab and smooth-scroll to the auth panel. */
  const openAuth = useCallback((mode: AuthMode = "login") => {
    setAuthMode(mode);
    setMenuOpen(false);

    const target = document.getElementById("login");
    if (!target) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: 0, duration: 1.5 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // static open book -> CTA must still be clickable
      setCtaActive(true);
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    const updateScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // progress window in which the last spread is on screen (recomputed below)
    const ctaRange = { start: 0.77, end: 0.9 };

    const context = gsap.context(() => {
      const leaves = Array.from(
        scene.current?.querySelectorAll<HTMLElement>(".landing-leaf") ?? []
      );

      gsap.set(bookRefs.leftPage.current, {
        scaleX: 0.03,
        opacity: 0,
        transformOrigin: "right center",
      });
      gsap.set(bookRefs.cover.current, {
        rotationY: 0,
        transformOrigin: "left center",
      });
      gsap.set(featureReveal.current, { autoAlpha: 0, y: 25 });
      gsap.set(leaves, {
        rotationY: 0,
        transformOrigin: "left center",
        zIndex: (index: number) => 10 - index,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scene.current,
          start: "top top",
          // longer scroll so the final spread can be held open
          end: () =>
            `+=${window.innerHeight * (window.innerWidth < 640 ? 6 : 9)}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const live =
              self.progress >= ctaRange.start && self.progress <= ctaRange.end;
            if (live !== ctaLiveRef.current) {
              ctaLiveRef.current = live;
              setCtaActive(live);
            }
          },
        },
      });

      timeline
        // book approaches
        .to(bookRefs.stage.current, { scale: 1.3, yPercent: -2, duration: 20 }, 0)
        .to(glow.current, { xPercent: 12, yPercent: -9, duration: 60 }, 0)
        .to(dust.current, { yPercent: -20, duration: 169 }, 0)
        .to(heroCopy.current, { autoAlpha: 0, y: -35, duration: 18 }, 8)
        // rotate and rise
        .to(
          bookRefs.stage.current,
          { rotation: -5, yPercent: -10, duration: 15 },
          20
        )
        // open the cover
        .to(bookRefs.cover.current, { rotationY: -170, duration: 35 }, 35)
        .to(
          bookRefs.leftPage.current,
          { scaleX: 1, opacity: 1, duration: 30 },
          40
        )
        // camera orbit
        .to(
          bookRefs.book.current,
          { rotationY: 14, rotationX: 6, duration: 15, ease: "power1.inOut" },
          55
        )
        .to(
          bookRefs.stage.current,
          { rotation: 1, scale: 1.35, yPercent: -14, duration: 25 },
          55
        )
        .to(featureReveal.current, { autoAlpha: 1, y: 0, duration: 12 }, 72);

      // turn the pages one by one (last leaf finishes at 128)
      leaves.forEach((leaf, index) => {
        const start = 82 + index * 12;
        timeline
          .to(
            leaf,
            { rotationY: -180, duration: 10, ease: "power2.inOut" },
            start
          )
          .set(leaf, { zIndex: 11 + index }, start + 5);
      });

      // settle squarely on the last spread so the CTA is readable + clickable
      timeline
        .to(
          bookRefs.book.current,
          { rotationY: 4, rotationX: 2, duration: 12, ease: "power2.out" },
          128
        )
        .to(
          bookRefs.stage.current,
          {
            rotation: 0,
            scale: 1.4,
            yPercent: -8,
            duration: 12,
            ease: "power2.out",
          },
          128
        )
        // HOLD 140 -> 150 : nothing animates, the CTA just sits there
        // leave the book and enter the page
        .to(featureReveal.current, { autoAlpha: 0, duration: 6 }, 150)
        .to(
          bookRefs.stage.current,
          { scale: 2.45, yPercent: 7, autoAlpha: 0, duration: 15 },
          154
        );

      // derive the real clickable window from the built timeline
      const total = timeline.duration() || 169;
      ctaRange.start = 129 / total;
      ctaRange.end = 153 / total;

      // scroll reveals for the sections after the book
      document
        .querySelectorAll<HTMLElement>(
          ".landing-editorial > *, .landing-section-heading > *, .landing-feature-lines > div, .landing-journey > *, .landing-auth-intro > *"
        )
        .forEach((el) => {
          gsap.from(el, {
            y: 50,
            autoAlpha: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
        });
    }, scene);

    ScrollTrigger.refresh();

    return () => {
      context.revert();
      lenis.off("scroll", updateScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="landing-root" id="home">
      <nav className="landing-nav" aria-label="Main navigation">
        <a className="landing-logo" href="#home">
          ORBIZEE<span></span>
        </a>
        <div className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
        <a
          className="landing-nav-login"
          href="#login"
          onClick={(event) => {
            event.preventDefault();
            openAuth("login");
          }}
        >
          Login <span aria-hidden="true">↗</span>
        </a>
        <button
          className="landing-menu-button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        {menuOpen && (
          <div
            className="landing-mobile-menu"
            onClick={() => setMenuOpen(false)}
          >
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a
              href="#login"
              onClick={(event) => {
                event.preventDefault();
                openAuth("login");
              }}
            >
              Login
            </a>
            <a
              href="#login"
              onClick={(event) => {
                event.preventDefault();
                openAuth("signup");
              }}
            >
              Sign Up
            </a>
          </div>
        )}
      </nav>

      <section className="landing-scene" ref={scene} aria-label="Open the story">
        <div className="landing-atmosphere" ref={glow} />
        <div className="landing-grain" />
        <div className="landing-particles-layer" ref={dust}>
          <Particles />
        </div>

        <div className="landing-hero-copy" ref={heroCopy}>
          <span className="landing-eyebrow">ORBIZEE</span>
          <h1>Every mark tells a story.</h1>
          <p>Scroll to open the chapter.</p>
        </div>

        <BookScene refs={bookRefs} ctaActive={ctaActive} onAuth={openAuth} />

        <div className="landing-feature-reveal" ref={featureReveal}>
          <span>INSIDE THIS CHAPTER</span>
          <div className="landing-feature-reveal-list">
            {features.map(([number, title]) => (
              <div key={number}>
                <small>{number}</small>
                <strong>{title}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-scroll-cue">
          <span>SCROLL TO EXPLORE</span>
          <span className="landing-scroll-line" />
        </div>
      </section>

      <section className="landing-editorial" id="about">
        <span className="landing-eyebrow">01 / DISCOVER</span>
        <h2>
          Progress deserves
          <br />
          a better perspective.
        </h2>
        <p>
          ORBIZEE brings the everyday work of a coaching institute into focus, so
          teachers can spend less time organizing data and more time
          understanding their students.
        </p>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">02 / EXPLORE FEATURES</span>
          <h2>Everything connects.</h2>
          <p>From the first student record to the final report.</p>
        </div>

        <div className="landing-feature-lines">
          <div>
            <span>01</span>
            <h3>Know every student.</h3>
            <p>Profiles, photos, standards, and divisions in one place.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Make exams effortless.</h3>
            <p>Multi-subject papers and fast, Excel-like marks entry.</p>
          </div>
          <div>
            <span>03</span>
            <h3>See the bigger picture.</h3>
            <p>Growth charts, rankings, and ready-to-share PDF reports.</p>
          </div>
        </div>
      </section>

      <section className="landing-editorial landing-institute">
        <span className="landing-eyebrow">03 / BUILT FOR REAL INSTITUTES</span>
        <h2>
          Made for the
          <br />
          way you teach.
        </h2>
        <p>
          Shape your own standards and divisions. Give administrators the
          controls they need. Keep the experience responsive, even as your
          institute grows.
        </p>
      </section>

      <section className="landing-journey">
        <span className="landing-eyebrow">04 / BEGIN YOUR JOURNEY</span>
        <h2>The next chapter is yours.</h2>
        <div className="landing-journey-actions">
          <button
            type="button"
            className="landing-journey-primary"
            onClick={() => openAuth("login")}
          >
            Login <span aria-hidden="true">↗</span>
          </button>
          <button
            type="button"
            className="landing-journey-ghost"
            onClick={() => openAuth("signup")}
          >
            Create an account
          </button>
        </div>
      </section>

      <AuthSection mode={authMode} onModeChange={setAuthMode} />

      <footer className="landing-footer">
        <span>ORBIZEE</span>
        <span>Every mark tells a story.</span>
      </footer>
    </main>
  );
}