import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { initiateStripeCheckout } from '@/lib/stripe';
import { CheckoutFormData, StripeCheckoutResult, StripeCheckoutError } from '@/types/checkout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { ShoppingCart, CreditCard, Truck, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schéma de validation du formulaire de checkout
const checkoutSchema = z.object({
  customerInfo: z.object({
    fullName: z.string().min(2, { message: "Le nom complet est requis" }),
    email: z.string().email({ message: "Email invalide" }),
    phone: z.string().min(10, { message: "Numéro de téléphone invalide" }),
    createAccount: z.boolean().default(false),
    password: z.string().optional().refine(val => {
      if (val === undefined) return true;
      return val.length >= 6 || val.length === 0;
    }, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  }).refine(data => {
    // Si createAccount est true, password est requis
    if (data.createAccount && (!data.password || data.password.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: "Le mot de passe est requis pour créer un compte",
    path: ["password"],
  }),
  shippingAddress: z.object({
    address: z.string().min(5, { message: "Adresse requise" }),
    city: z.string().min(2, { message: "Ville requise" }),
    postalCode: z.string().min(5, { message: "Code postal requis" }),
    country: z.string().min(2, { message: "Pays requis" }),
  }),
  paymentInfo: z.object({
    cardHolder: z.string().min(2, { message: "Nom du titulaire de la carte requis" }),
    savePaymentInfo: z.boolean().default(false),
  }),
  shippingMethod: z.string().min(1, { message: "Méthode de livraison requise" }),
  orderNotes: z.string().optional(),
});

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, register } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(5.99);
  const [total, setTotal] = useState(0);
  // Recommander la création de compte si l'utilisateur n'est pas connecté
  const [shouldCreateAccount, setShouldCreateAccount] = useState(false);

  // Définir les options de livraison
  const shippingOptions = [
    { id: 'standard', name: 'Standard (3-5 jours)', price: 5.99, estimatedDays: 5, default: true },
    { id: 'express', name: 'Express (1-2 jours)', price: 12.99, estimatedDays: 2 },
    { id: 'priority', name: 'Prioritaire (24h)', price: 19.99, estimatedDays: 1 },
  ];

  // Initialiser le formulaire avec react-hook-form
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerInfo: {
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        createAccount: !isAuthenticated, // Suggérer la création de compte si non connecté
      },
      shippingAddress: {
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
      },
      paymentInfo: {
        cardHolder: user?.name || '',
        savePaymentInfo: false,
      },
      shippingMethod: 'standard',
      orderNotes: '',
    }
  });

  // Observer le changement sur createAccount pour rendre le champ password requis
  const createAccount = form.watch('customerInfo.createAccount');
  const selectedShippingMethod = form.watch('shippingMethod');

  // Mettre à jour la suggestion de création de compte quand l'état d'authentification change
  useEffect(() => {
    if (!isAuthenticated) {
      setShouldCreateAccount(true);
      form.setValue('customerInfo.createAccount', true);
    }
  }, [isAuthenticated, form]);

  // Charger le panier lors de l'initialisation
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartString = localStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          setCartItems(cart);
          
          // Calculer le sous-total
          const calculatedSubtotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          setSubtotal(calculatedSubtotal);
          
          // Mettre à jour le total
          const selectedOption = shippingOptions.find(option => option.id === selectedShippingMethod);
          const shippingPrice = selectedOption?.price || shippingOptions[0].price;
          setShippingCost(shippingPrice);
          setTotal(calculatedSubtotal + shippingPrice);
        } else {
          // Rediriger si le panier est vide
          navigate('/products');
          toast.info('Votre panier est vide');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    };

    loadCart();
  }, [navigate, selectedShippingMethod]);

  // Mettre à jour le coût d'expédition lorsque la méthode change
  useEffect(() => {
    const selectedOption = shippingOptions.find(option => option.id === selectedShippingMethod);
    if (selectedOption) {
      setShippingCost(selectedOption.price);
      setTotal(subtotal + selectedOption.price);
    }
  }, [selectedShippingMethod, subtotal]);

  // Gérer la soumission du formulaire
  const onSubmit: SubmitHandler<CheckoutFormData> = async (data) => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsProcessing(true);

    try {
      // Si l'utilisateur veut créer un compte et n'est pas déjà connecté
      if (data.customerInfo.createAccount && !isAuthenticated && data.customerInfo.password) {
        try {
          // Tentative de création de compte avant de finaliser la commande
          await register(data.customerInfo.fullName, data.customerInfo.email, data.customerInfo.password);
          toast.success('Compte créé avec succès!');
        } catch (error) {
          console.error('Erreur lors de la création du compte:', error);
          toast.error('Erreur lors de la création du compte. Vérifiez si cet email existe déjà ou réessayez plus tard.');
          // Continue avec la commande malgré l'échec de création de compte
        }
      }

      // Préparer les éléments pour le checkout
      const checkoutItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedLotteries: item.selectedLotteries,
        size: item.size,
        color: item.color,
        visualDesign: item.visualDesign // Inclure les informations de design visuel
      }));

      // Appel à la fonction de paiement Stripe
      const result = await initiateStripeCheckout(checkoutItems);
      
      if (!result.success) {
        // Type assertion pour accéder à la propriété error
        const errorResult = result as StripeCheckoutError;
        toast.error(`Erreur de paiement: ${errorResult.error}`);
        setIsProcessing(false);
        return;
      }

      // Sauvegarder les informations de commande
      localStorage.setItem('lastOrderDetails', JSON.stringify({
        customerInfo: {
          fullName: data.customerInfo.fullName,
          email: data.customerInfo.email,
          phone: data.customerInfo.phone
        },
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        orderNotes: data.orderNotes,
        orderItems: cartItems,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total
      }));

      // Redirection vers Stripe si URL est fournie
      if (result.url) {
        window.location.href = result.url;
      } else {
        // Sinon, rediriger vers la page de confirmation
        navigate('/confirmation');
        // Vider le panier après le paiement réussi
        localStorage.setItem('cart', '[]');
      }
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      toast.error(`Une erreur s'est produite lors du traitement du paiement.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
        <ShoppingCart className="mr-2" /> Finaliser votre commande
      </h1>

      {shouldCreateAccount && !isAuthenticated && (
        <Alert variant="default" className="mb-6 bg-winshirt-purple/10 border-winshirt-purple">
          <AlertCircle className="h-4 w-4 text-winshirt-purple-light" />
          <AlertDescription className="text-white">
            Créez un compte pour suivre facilement vos commandes et participer aux loteries
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de checkout */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Informations client */}
              <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="mr-2" /> Informations personnelles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerInfo.fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerInfo.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="06 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isAuthenticated && (
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="customerInfo.createAccount"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Créer un compte</FormLabel>
                              <FormDescription>
                                Pour un suivi facile de vos commandes
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {createAccount && (
                        <FormField
                          control={form.control}
                          name="customerInfo.password"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Mot de passe</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Minimum 6 caractères" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Adresse de livraison */}
              <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Truck className="mr-2" /> Adresse de livraison
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="shippingAddress.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Rue de Paris" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input placeholder="75001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input placeholder="France" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Méthode de livraison */}
              <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Truck className="mr-2" /> Méthode de livraison
                </h2>
                
                <FormField
                  control={form.control}
                  name="shippingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          {shippingOptions.map((option) => (
                            <FormItem
                              key={option.id}
                              className="flex items-center space-x-3 space-y-0 border border-winshirt-blue/20 p-4 rounded-lg"
                            >
                              <FormControl>
                                <RadioGroupItem value={option.id} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex-1">
                                <div className="flex justify-between items-center">
                                  <span>{option.name}</span>
                                  <span className="font-bold text-winshirt-purple-light">
                                    {option.price.toFixed(2)} €
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400">
                                  Livraison estimée: {option.estimatedDays} jour{option.estimatedDays > 1 ? 's' : ''}
                                </p>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Informations de paiement */}
              <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <CreditCard className="mr-2" /> Informations de paiement
                </h2>

                <p className="text-sm text-gray-400 mb-4">
                  Vous serez redirigé vers Stripe pour finaliser votre paiement en toute sécurité.
                </p>

                <FormField
                  control={form.control}
                  name="paymentInfo.cardHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du titulaire de la carte</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isAuthenticated && (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="paymentInfo.savePaymentInfo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Sauvegarder mes informations de paiement</FormLabel>
                            <FormDescription>
                              Pour des achats plus rapides à l'avenir
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </Card>

              {/* Notes de commande */}
              <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
                <h2 className="text-xl font-semibold text-white mb-4">Notes de commande</h2>

                <FormField
                  control={form.control}
                  name="orderNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions spéciales (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instructions de livraison, détails particuliers..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Bouton de soumission pour les petits écrans */}
              <div className="lg:hidden">
                <Button 
                  type="submit" 
                  className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Traitement en cours...' : `Payer ${total.toFixed(2)} €`}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Récapitulatif de la commande */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-winshirt-space border border-winshirt-purple/20 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif de la commande</h2>

            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 py-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.size && `Taille: ${item.size}`}
                      {item.color && item.size && ' | '}
                      {item.color && `Couleur: ${item.color}`}
                    </p>
                    <p className="text-xs text-gray-400">Qté: {item.quantity}</p>
                    {item.visualDesign && (
                      <p className="text-xs text-winshirt-purple-light">Personnalisé</p>
                    )}
                    {item.selectedLotteries && item.selectedLotteries.length > 0 && (
                      <p className="text-xs text-winshirt-purple-light">Loterie incluse</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              ))}

              <Separator className="bg-winshirt-blue/20" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <p className="text-gray-400">Sous-total</p>
                  <p className="text-white">{subtotal.toFixed(2)} €</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-400">Livraison</p>
                  <p className="text-white">{shippingCost.toFixed(2)} €</p>
                </div>
                <Separator className="bg-winshirt-blue/20" />
                <div className="flex justify-between text-base font-semibold">
                  <p className="text-white">Total</p>
                  <p className="text-winshirt-purple-light">{total.toFixed(2)} €</p>
                </div>
              </div>

              {/* Bouton de paiement pour grands écrans */}
              <div className="hidden lg:block mt-6">
                <Button 
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Traitement en cours...' : `Payer ${total.toFixed(2)} €`}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
