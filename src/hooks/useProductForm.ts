
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExtendedProduct, PrintArea } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du produit doit comporter au moins 2 caractères.",
  }),
  description: z.string().optional(),
  price: z.coerce.number(),
  image: z.string().optional(),
  secondaryImage: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  type: z.string().optional(),
  productType: z.string().optional(),
  sleeveType: z.string().optional(),
  linkedLotteries: z.array(z.string()).optional(),
  tickets: z.coerce.number().min(1).max(5).default(1),
  weight: z.coerce.number().optional(),
  deliveryPrice: z.coerce.number().optional(),
  allowCustomization: z.boolean().default(false),
  defaultVisualId: z.number().nullable().optional(),
  defaultVisualSettings: z.any().optional(),
  visualCategoryId: z.number().nullable().optional(),
  // Mise à jour du schéma pour les zones d'impression
  printAreas: z.array(z.object({
    id: z.number(),
    name: z.string(),
    position: z.enum(['front', 'back']),
    format: z.literal('custom'), 
    bounds: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }),
    allowCustomPosition: z.boolean().optional().default(true)
  })).optional(),
  // Nouveaux champs pour les filtres avancés
  gender: z.enum(['homme', 'femme', 'enfant', 'unisexe']).optional(),
  material: z.string().optional(),
  fit: z.enum(['regular', 'ajusté', 'oversize']).optional(),
  brand: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const useProductForm = (
  products: ExtendedProduct[],
  setProducts: React.Dispatch<React.SetStateAction<ExtendedProduct[]>>,
  activeLotteries: ExtendedLottery[]
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Create a proper empty array of the correct type for printAreas
  const emptyPrintAreas: PrintArea[] = [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      secondaryImage: "",
      sizes: [],
      colors: [],
      type: "",
      productType: "",
      sleeveType: "",
      linkedLotteries: [],
      tickets: 1,
      weight: 0,
      deliveryPrice: 0,
      allowCustomization: false,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: null,
      printAreas: emptyPrintAreas,
      gender: undefined,
      material: "",
      fit: undefined,
      brand: "",
    },
  });

  const handleCreateProduct = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    form.reset();
  };

  const handleDeleteProduct = (productId: number) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?");
    if (confirmDelete) {
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      toast.success("Produit supprimé avec succès");
    }
  };

  const handleEditProduct = (product: ExtendedProduct) => {
    setIsCreating(false);
    setSelectedProductId(product.id);
    
    // Create properly typed print areas array
    const typedPrintAreas: PrintArea[] = (product.printAreas || []).map(area => ({
      id: area.id,
      name: area.name,
      format: 'custom', // Toujours format personnalisé
      position: area.position,
      bounds: {
        x: area.bounds.x,
        y: area.bounds.y,
        width: area.bounds.width,
        height: area.bounds.height
      },
      allowCustomPosition: area.allowCustomPosition ?? true
    }));
    
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      secondaryImage: product.secondaryImage,
      sizes: product.sizes,
      colors: product.colors,
      type: product.type,
      productType: product.productType,
      sleeveType: product.sleeveType,
      linkedLotteries: product.linkedLotteries?.map(String),
      tickets: product.tickets,
      weight: product.weight,
      deliveryPrice: product.deliveryPrice,
      allowCustomization: product.allowCustomization,
      defaultVisualId: product.defaultVisualId,
      defaultVisualSettings: product.defaultVisualSettings,
      visualCategoryId: product.visualCategoryId,
      printAreas: typedPrintAreas,
      gender: product.gender,
      material: product.material,
      fit: product.fit,
      brand: product.brand,
    });
    
    console.log("Loaded product for editing:", {
      id: product.id,
      price: product.price,
      tickets: product.tickets,
      linkedLotteries: product.linkedLotteries?.map(String),
      gender: product.gender,
      material: product.material,
      fit: product.fit,
      brand: product.brand,
      printAreas: typedPrintAreas
    });
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log("Form data submitted:", data);
      
      // Ensure all numeric values are actually numbers
      const price = Number(data.price);
      const tickets = Number(data.tickets);
      const weight = data.weight ? Number(data.weight) : 0;
      const deliveryPrice = data.deliveryPrice ? Number(data.deliveryPrice) : 0;
      
      if (isNaN(price) || isNaN(tickets) || isNaN(weight) || isNaN(deliveryPrice)) {
        toast.error("Erreur de conversion des valeurs numériques");
        return;
      }
      
      // Ensure properly typed printAreas
      const typedPrintAreas: PrintArea[] = (data.printAreas || []).map(area => ({
        id: area.id,
        name: area.name,
        format: 'custom',
        position: area.position,
        bounds: {
          x: area.bounds.x,
          y: area.bounds.y,
          width: area.bounds.width,
          height: area.bounds.height
        },
        allowCustomPosition: area.allowCustomPosition ?? true
      }));
      
      const newProduct: ExtendedProduct = {
        id: isCreating ? Date.now() : selectedProductId || Date.now(),
        name: data.name,
        description: data.description || '',
        price: price,
        image: data.image || '',
        secondaryImage: data.secondaryImage || '',
        sizes: data.sizes || [],
        colors: data.colors || [],
        type: data.type || 'standard',
        productType: data.productType || 'T-shirt',
        sleeveType: data.sleeveType || 'Courtes',
        linkedLotteries: data.linkedLotteries ? data.linkedLotteries.map(Number) : [],
        popularity: 0,
        tickets: tickets,
        weight: weight,
        deliveryPrice: deliveryPrice,
        allowCustomization: data.allowCustomization || false,
        defaultVisualId: data.defaultVisualId || null,
        defaultVisualSettings: data.defaultVisualSettings || null,
        // Si on autorise la personnalisation, on garde la catégorie visuelle
        // Sinon on la met à null
        visualCategoryId: data.allowCustomization ? 
          (data.visualCategoryId || 1) : null,
        printAreas: typedPrintAreas,
        gender: data.gender,
        material: data.material,
        fit: data.fit,
        brand: data.brand,
      };

      if (isCreating) {
        setProducts(prevProducts => {
          const updatedProducts = [...prevProducts, newProduct];
          localStorage.setItem('products', JSON.stringify(updatedProducts));
          return updatedProducts;
        });
        toast.success("Produit créé avec succès");
        setIsCreating(false);
        form.reset();
      } else {
        const productIndex = products.findIndex(p => p.id === selectedProductId);
        
        if (productIndex !== -1) {
          const updatedProducts = [...products];
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            ...newProduct
          };
          
          setProducts(updatedProducts);
          
          localStorage.setItem('products', JSON.stringify(updatedProducts));
          
          toast.success("Produit mis à jour avec succès");
          setIsCreating(false);
          setSelectedProductId(null);
          form.reset();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de la soumission du formulaire");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedProductId(null);
    form.reset();
  };

  const addSize = (size: string) => {
    const currentSizes = form.getValues().sizes || [];
    form.setValue("sizes", [...currentSizes, size]);
  };

  const removeSize = (size: string) => {
    const currentSizes = form.getValues().sizes || [];
    form.setValue("sizes", currentSizes.filter(s => s !== size));
  };

  const addColor = (color: string) => {
    const currentColors = form.getValues().colors || [];
    form.setValue("colors", [...currentColors, color]);
  };

  const removeColor = (color: string) => {
    const currentColors = form.getValues().colors || [];
    form.setValue("colors", currentColors.filter(c => c !== color));
  };
  
  const toggleLottery = (lotteryId: string) => {
    const linkedLotteries = form.getValues().linkedLotteries || [];
    if (linkedLotteries.includes(lotteryId)) {
      form.setValue("linkedLotteries", linkedLotteries.filter(id => id !== lotteryId));
    } else {
      form.setValue("linkedLotteries", [...linkedLotteries, lotteryId]);
    }
  };
  
  const selectAllLotteries = () => {
    const allLotteryIds = activeLotteries.map(lottery => lottery.id.toString());
    form.setValue("linkedLotteries", allLotteryIds);
  };
  
  const deselectAllLotteries = () => {
    form.setValue("linkedLotteries", []);
  };
  
  // Create a unique ID for new print area
  const generatePrintAreaId = (): number => {
    const currentAreas = form.getValues().printAreas || [];
    return currentAreas.length > 0 
      ? Math.max(...currentAreas.map(area => area.id)) + 1 
      : 1;
  };
  
  // Add a new print area
  const addPrintArea = (printArea: Omit<PrintArea, 'id'>) => {
    const newArea: PrintArea = {
      ...printArea,
      id: generatePrintAreaId(),
      format: 'custom'
    };
    
    const currentAreas = form.getValues().printAreas || [];
    
    // Check if we already have a front or back area
    const hasArea = currentAreas.some(area => area.position === printArea.position);
    
    // Si on a déjà une zone pour cette position (recto/verso), ne pas en ajouter une autre
    if (hasArea) {
      toast.error(`Une zone d'impression ${printArea.position === 'front' ? 'recto' : 'verso'} existe déjà`);
      return;
    }
    
    form.setValue("printAreas", [...currentAreas, newArea]);
  };
  
  // Update an existing print area
  const updatePrintArea = (id: number, data: Partial<PrintArea>) => {
    const currentAreas = form.getValues().printAreas || [];
    const updatedAreas = currentAreas.map(area => {
      if (area.id === id) {
        return { 
          ...area, 
          ...data,
          format: 'custom' // Ensure format is always 'custom'
        };
      }
      return area;
    });
    
    form.setValue("printAreas", updatedAreas);
  };
  
  // Remove a print area
  const removePrintArea = (id: number) => {
    const currentAreas = form.getValues().printAreas || [];
    form.setValue("printAreas", currentAreas.filter(area => area.id !== id));
  };

  return {
    isCreating,
    selectedProductId,
    form,
    handleCreateProduct,
    handleEditProduct,
    handleDeleteProduct,
    onSubmit,
    handleCancel,
    addSize,
    removeSize,
    addColor,
    removeColor,
    toggleLottery,
    selectAllLotteries,
    deselectAllLotteries,
    addPrintArea,
    updatePrintArea,
    removePrintArea
  };
};
