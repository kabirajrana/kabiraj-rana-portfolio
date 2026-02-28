import Navbar from "@/components/layout/Navbar";
import AboutSection from "@/components/sections/AboutSection";
import ContactCTA from "@/components/ContactCTA";
import ExpertiseSection from "@/components/ExpertiseSection";
import Hero from "@/components/sections/Hero";
import ProjectsSection from "@/components/ProjectsSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1280px] px-5 md:px-8 xl:px-10">
        <Hero />
        <div className="mt-16 space-y-24 pb-24">
          <AboutSection />
          <ProjectsSection />
          <ExpertiseSection />
          <ContactCTA />
        </div>
      </main>
    </>
  );
}
