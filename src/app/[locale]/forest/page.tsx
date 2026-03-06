import { ForestService } from "@/lib/services/forest";
import { ForestView } from "@/components/forest";
import { TreeData } from "@/lib/services/tree/types";

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
    const forestService = new ForestService();
    const forestData = await forestService.buildForest();

    initialTrees = forestData.trees;
    initialTotalStartups = forestData.totalStartups;
    initialCategories = forestData.categories;
  } catch (error) {
    console.error("Failed to fetch initial forest data:", error);
    // Let the client-side handle the error and retry
  }

  return (
    <ForestView
      initialTrees={initialTrees}
      initialTotalStartups={initialTotalStartups}
      initialCategories={initialCategories}
    />
  );
}
