
import { supabase } from '@/integrations/supabase/client';
import { mockProducts } from '@/data/mockData';
import { toast } from '@/lib/toast';

interface LoadedData {
  products?: any[];
  lotteries?: any[];
  visuals?: any[];
  visualCategories?: any[];
}

export const preloadAllData = async (): Promise<LoadedData> => {
  const result: LoadedData = {};
  
  try {
    console.log("Préchargement des données...");
    
    // Try to load products from Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error("Error fetching products from Supabase:", productsError);
    } else if (products && products.length > 0) {
      // Convert snake_case to camelCase
      const camelCaseProducts = products.map(product => {
        const newProduct: any = {};
        for (const key in product) {
          if (Object.prototype.hasOwnProperty.call(product, key)) {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            newProduct[camelKey] = product[key];
          }
        }
        return newProduct;
      });
      
      // Save to localStorage and return
      localStorage.setItem('products', JSON.stringify(camelCaseProducts));
      result.products = camelCaseProducts;
      console.log(`${camelCaseProducts.length} produits chargés`);
    } else {
      // Fallback to localStorage or mock data
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        result.products = JSON.parse(storedProducts);
      } else {
        // Use mock data as last resort
        localStorage.setItem('products', JSON.stringify(mockProducts));
        result.products = mockProducts;
      }
      console.log(`${result.products.length} produits chargés`);
    }
    
    // Load lotteries
    const { data: lotteries, error: lotteriesError } = await supabase
      .from('lotteries')
      .select('*');
      
    if (lotteriesError) {
      console.error("Error fetching lotteries from Supabase:", lotteriesError);
      const storedLotteries = localStorage.getItem('lotteries');
      if (storedLotteries) {
        result.lotteries = JSON.parse(storedLotteries);
      }
    } else {
      // Convert snake_case to camelCase
      const camelCaseLotteries = lotteries.map(lottery => {
        const newLottery: any = {};
        for (const key in lottery) {
          if (Object.prototype.hasOwnProperty.call(lottery, key)) {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            newLottery[camelKey] = lottery[key];
          }
        }
        return newLottery;
      });
      
      // Save to localStorage and return
      localStorage.setItem('lotteries', JSON.stringify(camelCaseLotteries));
      result.lotteries = camelCaseLotteries;
      console.log(`${camelCaseLotteries.length} loteries chargées`);
    }
    
    // Load visual categories
    const { data: visualCategories, error: categoriesError } = await supabase
      .from('visual_categories')
      .select('*');
      
    if (!categoriesError && visualCategories) {
      // Convert and save
      const camelCaseCategories = visualCategories.map(category => {
        const newCategory: any = {};
        for (const key in category) {
          if (Object.prototype.hasOwnProperty.call(category, key)) {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            newCategory[camelKey] = category[key];
          }
        }
        return newCategory;
      });
      
      localStorage.setItem('visualCategories', JSON.stringify(camelCaseCategories));
      result.visualCategories = camelCaseCategories;
    } else {
      const storedCategories = localStorage.getItem('visualCategories');
      if (storedCategories) {
        result.visualCategories = JSON.parse(storedCategories);
      }
    }
    
    // Load visuals
    const { data: visuals, error: visualsError } = await supabase
      .from('visuals')
      .select('*');
      
    if (!visualsError && visuals) {
      // Convert and save
      const camelCaseVisuals = visuals.map(visual => {
        const newVisual: any = {};
        for (const key in visual) {
          if (Object.prototype.hasOwnProperty.call(visual, key)) {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            newVisual[camelKey] = visual[key];
          }
        }
        return newVisual;
      });
      
      localStorage.setItem('visuals', JSON.stringify(camelCaseVisuals));
      result.visuals = camelCaseVisuals;
    } else {
      const storedVisuals = localStorage.getItem('visuals');
      if (storedVisuals) {
        result.visuals = JSON.parse(storedVisuals);
      }
    }
    
    console.log("Préchargement des données terminé");
    
    // Test Supabase connection
    const { data, error } = await supabase.from('lotteries').select('count');
    if (error) {
      console.error("Supabase connection error:", error);
    } else {
      console.log("Supabase connected successfully");
    }
    
    return result;
    
  } catch (error) {
    console.error("Error preloading data:", error);
    toast.error("Erreur lors du chargement des données");
    return result;
  }
};
