import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import GuideSection from "./components/GuideSection";
import AdminOnly from "./components/AdminOnly";
import BallotSection from "./components/BallotSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#121212]">
      <Navbar />
      <div className="container mt-24 mx-auto px-12 py-4">
        <HeroSection />
        <GuideSection />
        <BallotSection />
        <AdminOnly />
      </div>
    </main>
  );
}