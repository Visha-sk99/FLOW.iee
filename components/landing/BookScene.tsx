import type { RefObject } from "react";

export type BookRefs = {
  stage: RefObject<HTMLDivElement | null>;
  book: RefObject<HTMLDivElement | null>;
  cover: RefObject<HTMLDivElement | null>;
  leftPage: RefObject<HTMLDivElement | null>;
};

export type AuthMode = "login" | "signup";

export type BookSceneProps = {
  refs: BookRefs;
  ctaActive?: boolean;
  onAuth?: (mode: AuthMode) => void;
};

type PageContent = {
  label: string;
  title: string;
  big?: boolean;
  text?: string;
  points?: string[];
  footer?: string;
  diagram?: boolean;
  cta?: boolean;
};

type Spread = { left: PageContent; right: PageContent };

const spreads: Spread[] = [
  {
    left: {
      label: "01 / THE BEGINNING",
      title: "Track.\nAnalyze.\nGrow.",
      big: true,
      footer: "A clearer view of every student.",
    },
    right: {
      label: "THE SCIENCE OF PROGRESS",
      title: "ORBIZEE",
      big: true,
      diagram: true,
      footer: "Make every mark mean more.",
    },
  },
  {
    left: {
      label: "02 / STUDENTS",
      title: "Every learner,\nin one place.",
      text: "Profiles with photos, roll numbers, standards and divisions. Add students quickly and find anyone in seconds.",
      points: ["Photo profiles", "Search and filter by division", "Admin-only editing"],
    },
    right: {
      label: "03 / EXAMS",
      title: "Many subjects,\none exam.",
      text: "Create an exam once, with the subject, topic, paper type and maximum marks for every paper.",
      points: ["Multi-subject papers", "Topic and paper type", "Delete an exam with its marks"],
    },
  },
  {
    left: {
      label: "04 / MARKS ENTRY",
      title: "As fast as\na spreadsheet.",
      text: "A roll-number sorted table with keyboard navigation, live validation and automatic totals.",
      points: ["Tab, Enter and arrow keys", "Present · AB · ML · NA", "One-click batch save"],
    },
    right: {
      label: "05 / ANALYTICS",
      title: "Watch growth\ntake shape.",
      text: "Frequency polygons, radar charts and growth across the last three exams, overall and per subject.",
      points: ["Subject frequency polygons", "Radar view of strengths", "Marks at 33 · 60 · 80%"],
    },
  },
  {
    left: {
      label: "06 / RANKINGS",
      title: "Ranks that\nare fair.",
      text: "Overall rankings by percentage, plus top-three cards for every division. Absent and leave entries are skipped.",
      points: ["Overall leaderboard", "Division-wise top three", "Tap to open a profile"],
    },
    right: {
      label: "07 / REPORTS",
      title: "Ready to\nshare.",
      text: "Export a marks sheet or a full student report as a polished PDF in one click.",
      points: ["Marks sheet · landscape A4", "Student report · portrait A4", "Full exam history"],
    },
  },
  {
    left: {
      label: "08 / BUILT FOR INSTITUTES",
      title: "Shaped around\nyour classroom.",
      text: "Define your own standards and divisions. Admin controls protect every change, and smart caching keeps pages fast.",
      points: ["Dynamic standards and divisions", "Admin and read-only roles", "Fast, cached data"],
    },
    right: {
      label: "THE LAST PAGE",
      title: "Your next\nchapter.",
      text: "Sign in or create an account to begin.",
      cta: true,
    },
  },
];

function PageFace({
  page,
  ctaActive = false,
  onAuth,
}: {
  page: PageContent;
  ctaActive?: boolean;
  onAuth?: (mode: AuthMode) => void;
}) {
  return (
    <>
      <span className="landing-pg-label">{page.label}</span>
      <div className={`landing-pg-title${page.big ? " big" : ""}`}>
        {page.title}
      </div>
      {page.text && <p className="landing-pg-text">{page.text}</p>}
      {page.points && (
        <ul className="landing-pg-points">
          {page.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      {page.diagram && (
        <div className="landing-page-diagram">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      {page.cta && (
        <div className={`landing-pg-cta-group${ctaActive ? " is-live" : ""}`}>
          <button
            type="button"
            className="landing-pg-cta"
            tabIndex={ctaActive ? 0 : -1}
            onClick={() => onAuth?.("login")}
          >
            Login ↗
          </button>
          <button
            type="button"
            className="landing-pg-cta ghost"
            tabIndex={ctaActive ? 0 : -1}
            onClick={() => onAuth?.("signup")}
          >
            Sign Up
          </button>
        </div>
      )}
      {page.footer && <span className="landing-pg-footer">{page.footer}</span>}
    </>
  );
}

export default function BookScene({
  refs,
  ctaActive = false,
  onAuth,
}: BookSceneProps) {
  const last = spreads[spreads.length - 1];

  return (
    <div
      className={`landing-book-stage${ctaActive ? " is-cta-live" : ""}`}
      ref={refs.stage}
      aria-hidden={ctaActive ? undefined : true}
    >
      <div className="landing-book-float">
        <div className="landing-book" ref={refs.book}>
          <div className="landing-book-shadow" />

          {/* Base pages: first left page and last right page */}
          <div className="landing-left-page" ref={refs.leftPage}>
            <PageFace page={spreads[0].left} />
          </div>
          <div className="landing-right-page">
            <PageFace page={last.right} ctaActive={ctaActive} onAuth={onAuth} />
          </div>

          {/* Turning leaves: front = right page, back = next left page */}
          {spreads.slice(0, -1).map((spread, index) => (
            <div className="landing-leaf" key={index}>
              <div className="landing-face landing-face-front">
                <PageFace page={spread.right} />
              </div>
              <div className="landing-face landing-face-back">
                <PageFace page={spreads[index + 1].left} />
              </div>
            </div>
          ))}

          <div className="landing-book-spine" />

          <div className="landing-front-cover" ref={refs.cover}>
            <div className="landing-cover-inner">
              <span className="landing-cover-kicker">
                A NEW CHAPTER IN LEARNING
              </span>
              <div className="landing-cover-symbol">✳</div>
              <strong>ORBIZEE</strong>
              <span className="landing-cover-bottom">
                KNOWLEDGE IN MOTION · VOL. 01
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}