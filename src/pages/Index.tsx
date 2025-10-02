import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { CompanyProfile } from "@/components/CompanyProfile";
import { ClientManager } from "@/components/ClientManager";
import { ProductManager } from "@/components/ProductManager";
import { InvoiceManager } from "@/components/InvoiceManager";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onTabChange={setActiveTab} />;
      case "company":
        return <CompanyProfile />;
      case "clients":
        return <ClientManager />;
      case "products":
        return <ProductManager />;
      case "invoices":
        return <InvoiceManager />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
