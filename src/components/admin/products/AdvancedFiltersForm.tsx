
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface AdvancedFiltersFormProps {
  form: UseFormReturn<any>;
}

const AdvancedFiltersForm: React.FC<AdvancedFiltersFormProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-white">Filtres avancés</h3>
      
      {/* Genre */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Genre</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Sélectionnez un genre" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                <SelectItem value="homme">Homme</SelectItem>
                <SelectItem value="femme">Femme</SelectItem>
                <SelectItem value="enfant">Enfant</SelectItem>
                <SelectItem value="unisexe">Unisexe</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      {/* Matière */}
      <FormField
        control={form.control}
        name="material"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Matière</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Coton, Polyester, Bio..."
                className="bg-winshirt-space-light border-winshirt-purple/30"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-gray-400">
              Séparez les différentes matières par des virgules
            </FormDescription>
          </FormItem>
        )}
      />
      
      {/* Coupe */}
      <FormField
        control={form.control}
        name="fit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Coupe</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Sélectionnez une coupe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="ajusté">Ajusté</SelectItem>
                <SelectItem value="oversize">Oversize</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      {/* Marque */}
      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marque</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Nike, Adidas, etc."
                className="bg-winshirt-space-light border-winshirt-purple/30"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default AdvancedFiltersForm;
