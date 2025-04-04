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
  // Ajout des champs pour les zones d'impression
  printAreas: z.array(z.object({
    id: z.number(),
    name: z.string(),
    format: z.enum(['pocket', 'a4', 'a3', 'custom']),
    position: z.enum(['front', 'back']),
    bounds: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }),
    allowCustomPosition: z.boolean().optional()
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
      printAreas: [],
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

  const handleEditProduct = (product: ExtendedProduct) => {
    setIsCreating(false);
    setSelectedProductId(product.id);
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
      printAreas: product.printAreas || [],
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
    });
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
        printAreas: data.printAreas || [],
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
  
  // Fonction pour ajouter une zone d'impression
  const addPrintArea = (printArea: Omit<PrintArea, 'id'>) => {
    const currentPrintAreas = form.getValues().printAreas || [];
    
    // Générer un ID unique pour la nouvelle zone d'impression
    const newId = currentPrintAreas.length > 0
      ? Math.max(...currentPrintAreas.map(area => area.id)) + 1
      : 1;
      
    const newPrintArea: PrintArea = {
      id: newId,
      name: printArea.name,
      format: printArea.format,
      position: printArea.position,
      bounds: {
        x: printArea.bounds.x,
        y: printArea.bounds.y,
        width: printArea.bounds.width,
        height: printArea.bounds.height
      },
      allowCustomPosition: printArea.allowCustomPosition ?? true
    };
    
    form.setValue("printAreas", [...currentPrintAreas, newPrintArea]);
  };
  
  // Fonction pour mettre à jour une zone d'impression existante
  const updatePrintArea = (id: number, updatedData: Partial<PrintArea>) => {
    const currentPrintAreas = form.getValues().printAreas || [];
    const updatedPrintAreas = currentPrintAreas.map(area => 
      area.id === id ? { ...area, ...updatedData } : area
    ) as PrintArea[];
    
    form.setValue("printAreas", updatedPrintAreas);
  };
  
  // Fonction pour supprimer une zone d'impression
  const removePrintArea = (id: number) => {
    const currentPrintAreas = form.getValues().printAreas || [];
    form.setValue("printAreas", currentPrintAreas.filter(area => area.id !== id));
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
