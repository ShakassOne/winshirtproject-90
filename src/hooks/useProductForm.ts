
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery } from '@/types/lottery';
import { toast } from '@/lib/toast';

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du produit doit comporter au moins 2 caractères.",
  }),
  description: z.string().optional(),
  price: z.number(),
  image: z.string().optional(),
  secondaryImage: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  type: z.string().optional(),
  productType: z.string().optional(),
  sleeveType: z.string().optional(),
  linkedLotteries: z.array(z.string()).optional(),
  tickets: z.coerce.number().min(1).max(5).default(1),
  weight: z.number().optional(),
  deliveryPrice: z.number().optional(),
  allowCustomization: z.boolean().default(false),
  defaultVisualId: z.number().nullable().optional(),
  defaultVisualSettings: z.any().optional(),
  visualCategoryId: z.number().nullable().optional(),
});

export const useProductForm = (
  products: ExtendedProduct[],
  setProducts: React.Dispatch<React.SetStateAction<ExtendedProduct[]>>,
  activeLotteries: ExtendedLottery[]
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof productFormSchema>>({
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

  const onSubmit = async (data: any) => {
    try {
      const newProduct: ExtendedProduct = {
        id: isCreating ? Date.now() : selectedProductId || Date.now(),
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        image: data.image || '',
        secondaryImage: data.secondaryImage || '',
        sizes: data.sizes || [],
        colors: data.colors || [],
        type: data.type || 'standard',
        productType: data.productType || 'T-shirt',
        sleeveType: data.sleeveType || 'Courtes',
        linkedLotteries: data.linkedLotteries ? data.linkedLotteries.map(Number) : [],
        popularity: 0,
        tickets: Number(data.tickets) || 1,
        weight: data.weight || 0,
        deliveryPrice: data.deliveryPrice || 0,
        allowCustomization: data.allowCustomization || false,
        defaultVisualId: data.defaultVisualId || null,
        defaultVisualSettings: data.defaultVisualSettings || null,
        visualCategoryId: data.visualCategoryId ? Number(data.visualCategoryId) : null,
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
    form.setValue("sizes", [...form.getValues().sizes, size]);
  };

  const removeSize = (size: string) => {
    form.setValue("sizes", form.getValues().sizes.filter((s: string) => s !== size));
  };

  const addColor = (color: string) => {
    form.setValue("colors", [...form.getValues().colors, color]);
  };

  const removeColor = (color: string) => {
    form.setValue("colors", form.getValues().colors.filter((c: string) => c !== color));
  };
  
  const toggleLottery = (lotteryId: string) => {
    const linkedLotteries = form.getValues().linkedLotteries || [];
    if (linkedLotteries.includes(lotteryId)) {
      form.setValue("linkedLotteries", linkedLotteries.filter((id: string) => id !== lotteryId));
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
    deselectAllLotteries
  };
};
