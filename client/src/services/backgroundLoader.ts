import axios from "axios";
import { simpleCache } from "../utils/simpleCache";

class BackgroundDataLoader {
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async preloadDistrictData(): Promise<void> {
    if (this.isLoading || this.loadPromise) {
      return this.loadPromise || Promise.resolve();
    }

    this.isLoading = true;
    ("🚀 Starting background district data preload...");

    this.loadPromise = this.loadData();
    return this.loadPromise;
  }

  private async loadData(): Promise<void> {
    try {
      // Check if data is already cached
      const cachedGeoJson = simpleCache.get("district-geojson");
      const cachedDistricts = simpleCache.get("districts-list");

      if (cachedGeoJson && cachedDistricts) {
        ("✅ District data already cached");
        return;
      }

      // Start both requests in parallel
      const promises: Promise<any>[] = [];

      if (!cachedDistricts) {
        promises.push(
          axios
            .get("http://localhost:5000/api/districts/list", {
              timeout: 10000,
              withCredentials: true,
            })
            .then((response) => {
              simpleCache.set("districts-list", response.data, 15 * 60 * 1000);
              ("📋 Background: Districts list cached");
              return response.data;
            })
            .catch((error) => {
              ("⚠️ Background: Districts list failed, will try fallback later");
              return null;
            })
        );
      }

      if (!cachedGeoJson) {
        promises.push(
          axios
            .get("http://localhost:5000/api/districts/geojson", {
              timeout: 30000,
              withCredentials: true,
            })
            .then((response) => {
              simpleCache.set(
                "district-geojson",
                response.data,
                60 * 60 * 1000
              );
              ("🗺️ Background: District GeoJSON cached");
              return response.data;
            })
            .catch((error) => {
              ("⚠️ Background: District GeoJSON failed, will try on-demand");
              return null;
            })
        );
      }

      // Wait for all requests to complete (or fail)
      const results = await Promise.allSettled(promises);

      // If districts list failed, try to create from cultural sites
      if (!cachedDistricts && !simpleCache.get("districts-list")) {
        try {
          const sitesResponse = await axios.get(
            "http://localhost:5000/api/culturalsites/map",
            {
              timeout: 10000,
            }
          );

          const sites = sitesResponse.data || [];
          const districtCounts = sites.reduce((acc: any, site: any) => {
            const district = site.district;
            if (district) {
              acc[district] = (acc[district] || 0) + 1;
            }
            return acc;
          }, {});

          const districts = Object.entries(districtCounts).map(
            ([name, count]) => ({
              name,
              siteCount: count,
            })
          );

          simpleCache.set("districts-list", districts, 15 * 60 * 1000);
          ("📋 Background: Created districts list from sites");
        } catch (fallbackError) {
          ("⚠️ Background: All district loading methods failed");
        }
      }

      ("✅ Background district data loading completed");
    } catch (error) {
      console.error("❌ Background district data loading failed:", error);
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  // Method to get cached data immediately
  getCachedDistrictData() {
    return {
      geoJson: simpleCache.get("district-geojson"),
      districts: simpleCache.get("districts-list"),
    };
  }

  // Method to check if data is available
  isDataReady(): boolean {
    const cached = this.getCachedDistrictData();
    return Boolean(cached.geoJson && cached.districts);
  }
}

export const backgroundLoader = new BackgroundDataLoader();
