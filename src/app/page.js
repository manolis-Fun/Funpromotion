import HeroSlider from "../components/HeroSlider";
import BannerSection from "../components/banner-section";
import EcoSection from "../components/EcoSection";
import LatestProducts from "../components/latest-products";
import FaqSection from "../components/FaqSection";
import NewsletterBanner from "../components/NewsletterBanner";
import AboutFunPromotion from "@/components/about-fun-promotion";
import TrustedLogosSlider from "../components/common/ImageSlider";
import BulkOrdersStepper from "../components/BulkOrdersStepper";
import { EmployeeGiftsSection } from "../components/EmployeeGiftsSection";
import BrandSection from "../components/BrandSection";
import TopCompanies from "../components/top-companies";
import { graphqlClient, getAllProductsPaginatedQuery, getMockData } from '@/lib/graphql';
import { CatalogsWrapper } from "@/components/catalog-wrapper";
import HomeTabs from "@/components/home-tabs";
import FeaturedProduct from "@/components/featured-product";

export const revalidate = 3600;

async function fetchProducts() {
  try {
    const data = await graphqlClient
      .request(getAllProductsPaginatedQuery, { first: 1000 })
      .catch(() => getMockData(getAllProductsPaginatedQuery, { first: 1000 }));

    return data.products.nodes;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const allProducts = await fetchProducts();
 
  return (
    <main>
      <HeroSlider />
      <TopCompanies />
      <TrustedLogosSlider />
      <LatestProducts products={allProducts.slice(0, 4)} />
      <BannerSection />
      <FeaturedProduct products={allProducts?.slice(4, 8)} />
      <EmployeeGiftsSection />
      <CatalogsWrapper />
      <HomeTabs />
      <AboutFunPromotion />
      <BrandSection />
      <EcoSection />
      <BulkOrdersStepper />
      <FaqSection />
      <NewsletterBanner />
    </main>
  );
}
