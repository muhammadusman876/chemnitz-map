// services/backgroundLoader.ts
import { simpleCache } from "../utils/simpleCache";

export const backgroundDataLoader = {
  async preloadData() {
    // Start loading in background after 2 seconds
    setTimeout(async () => {
      try {
        ("🔄 Preloading data in background...");

        // Load all sites
        const sitesResponse = await fetch("http://localhost:5000/api/culturalsites/");
        const sites = await sitesResponse.json();
        simpleCache.set("all-sites", sites);

        // Extract categories
        const categories = Array.from(
          new Set(sites.map((site: any) => site.category))
        );
        simpleCache.set("categories", categories);

      } catch (error) {
        console.warn("❌ Background loading failed:", error);
      }
    }, 2000);
  },
};
