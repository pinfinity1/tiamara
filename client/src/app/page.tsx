import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel group="home-banner" />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {/*
          When we build the product sections, we will fetch their data here
          because this page itself is a Server Component.
        */}
      </div>
    </div>
  );
}
