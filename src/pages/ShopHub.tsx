import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

// Lazy-load the heavy content
import { lazy, Suspense } from "react";
const SuppliersContent = lazy(() => import("@/components/content/SuppliersContent"));
const ShopContent = lazy(() => import("@/components/content/ShopContent"));

const TABS = [
  { value: "suppliers", label: "Suppliers", icon: ShieldCheck },
  { value: "shop", label: "Shop", icon: ShoppingBag },
] as const;

const ShopHubPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "suppliers";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shop — Suppliers & Products | Peptyl"
        description="Compare prices from approved UK suppliers and browse curated supplements to support your protocols."
        path="/shop"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-8 w-full max-w-xs">
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-2 flex-1">
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
              <TabsContent value="suppliers">
                <SuppliersContent />
              </TabsContent>
              <TabsContent value="shop">
                <ShopContent />
              </TabsContent>
            </Suspense>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShopHubPage;
