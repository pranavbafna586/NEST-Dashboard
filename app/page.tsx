import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import ParticlesBackground from "@/components/landing/ParticlesBackground";
import BentoFeatures from "@/components/landing/BentoFeatures";
import DashboardPreview from "@/components/landing/DashboardPreview";
import Footer from "@/components/landing/Footer";
import Chatbot from "@/components/landing/Chatbot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CTIE | Clinical Trial Intelligence Engine",
  description:
    "Transform fragmented clinical data into actionable insights with AI-powered RAG engine. Real-time harmonization, predictive analytics, and intelligent monitoring for clinical trials.",
  keywords: [
    "clinical trial",
    "data harmonization",
    "AI",
    "RAG",
    "analytics",
    "CDISC",
    "SDTM",
  ],
  openGraph: {
    title: "CTIE | Clinical Trial Intelligence Engine",
    description:
      "AI-powered clinical trial data harmonization and analytics platform.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Animated Particles Background */}
      <ParticlesBackground />

      {/* Floating Glass Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Bento Features Grid */}
      <BentoFeatures />

      {/* Interactive Dashboard Preview */}
      <DashboardPreview />

      {/* Footer */}
      <Footer />

      {/* Floating Chatbot */}
      <Chatbot />
    </main>
  );
}
