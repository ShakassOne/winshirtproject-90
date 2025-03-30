
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface BasicLotteryInfoProps {
  form: UseFormReturn<any>;
}

const BasicLotteryInfo: React.FC<BasicLotteryInfoProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Titre de la loterie</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Montre Rolex Submariner" 
                  {...field}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Valeur du lot (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="5000" 
                  {...field}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Description détaillée de la loterie et du lot à gagner..." 
                {...field}
                className="bg-winshirt-space-light border-winshirt-purple/30 min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicLotteryInfo;
