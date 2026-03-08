import { Metadata } from "next";
import { ForestService } from "@/lib/services/forest";
import { ForestView } from "@/components/forest";
import { TreeData } from "@/lib/services/tree/types";
import { DataSyncer } from "@/lib/services/data";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { TrustMRRProvider } from "@/lib/providers/trustmrr";

export const metadata: Metadata = {
  title: "Explore the Forest | Garden of Makers",
  description: "Fly through an interactive 3D forest of startups. Each tree represents a real company with verified revenue data.",
};

/**
 * Forest Page
 * Server component that fetches initial forest data
 * Passes data to client ForestView component
 */
export default async function ForestPage() {
  // Fetch initial forest data on the server
  let initialTrees: TreeData[] = [];
  let initialTotalStartups = 0;
  let initialCategories: string[] = [];

  try {
    const syncer = new DataSyncer(createServiceClient(), new TrustMRRProvider());
    const forestService = new ForestService(syncer);
    const forestData = await forestService.buildForest();

    initialTrees = forestData.trees;
    initialTotalStartups = forestData.totalStartups;
    initialCategories = forestData.categories;
  } catch (error) {
    console.error("Failed to fetch initial forest data:", error);
    // Let the client-side handle the error and retry
  }

  return (
    <div className="-mt-[73px] -mb-[88px] h-screen w-screen overflow-hidden">
      <ForestView
        initialTrees={initialTrees}
        initialTotalStartups={initialTotalStartups}
        initialCategories={initialCategories}
      />
    </div>
  );
}
