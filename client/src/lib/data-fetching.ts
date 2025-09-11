import { useHomepageStore } from "@/store/useHomepageStore";

export async function getHomepageData() {
  await useHomepageStore.getState().fetchBanners();
  await useHomepageStore.getState().fetchSections();

  const banners = useHomepageStore.getState().banners;
  const sections = useHomepageStore.getState().sections;

  return { banners, sections };
}
