import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CompanyManager } from "@/components/CompanyManager";
import { InvoiceManager } from "@/components/InvoiceManager";
import { ProductManager } from "@/components/ProductManager";
import { ClientManager } from "@/components/ClientManager";
import { Dashboard } from "@/components/Dashboard";
import { Settings } from "@/components/Settings";
import { TemplateBuilder } from "@/components/TemplateBuilder/TemplateBuilder";
import { NotFound } from "@/pages/NotFound";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/components/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard onTabChange={(tab: string) => {}} />
          },
          {
            path: "invoices",
            element: <InvoiceManager />
          },
          {
            path: "clients",
            element: <ClientManager />
          },
          {
            path: "companies",
            element: <CompanyManager />
          },
          {
            path: "products",
            element: <ProductManager />
          },
          {
            path: "settings",
            element: <Settings />
          },
          {
            path: "template-builder",
            element: <TemplateBuilder />
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    element: <AuthPage />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export const Routes = () => {
  return <RouterProvider router={router} />;
};