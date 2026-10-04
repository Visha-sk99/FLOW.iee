import type { Metadata } from "next";
import LandingPage from "../components/landing/LandingPage";
import "./landing.css";

export const metadata: Metadata = {
  title: "FLOWIEE | Every mark tells a story",
  description:
    "Students, exams, marks, rankings, and performance insights for real science classrooms.",
};

export default function HomePage() {
  return <LandingPage />;
}
