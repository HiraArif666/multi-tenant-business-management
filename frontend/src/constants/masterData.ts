export interface MasterDataConfig {
  label: string;
  basePath: string;
  permissionPrefix: string;
}

// Keyed by the ":type" route slug used in /master-data/:type
export const MASTER_DATA_CONFIG: Record<string, MasterDataConfig> = {
  vendors: {
    label: "Vendor",
    basePath: "/api/vendors",
    permissionPrefix: "master-data.vendor",
  },
  suppliers: {
    label: "Supplier",
    basePath: "/api/suppliers",
    permissionPrefix: "master-data.supplier",
  },
  contractors: {
    label: "Contractor",
    basePath: "/api/contractors",
    permissionPrefix: "master-data.contractor",
  },
  consultants: {
    label: "Consultant",
    basePath: "/api/consultants",
    permissionPrefix: "master-data.consultant",
  },
  customers: {
    label: "Customer",
    basePath: "/api/customers",
    permissionPrefix: "master-data.customer",
  },
};