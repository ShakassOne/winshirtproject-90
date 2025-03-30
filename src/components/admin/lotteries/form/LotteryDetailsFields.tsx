
import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface LotteryDetailsFieldsProps {
  form: UseFormReturn<any>;
  lotteryStatuses: string[];
}

const LotteryDetailsFields: React.FC<LotteryDetailsFieldsProps> = ({ form, lotteryStatuses }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">URL de l'image</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  {...field}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Entrez l'URL de l'image du lot
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="targetParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Seuil de participants</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="100" 
                  {...field}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Nombre minimum de participations requis
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Date de fin */}
      <FormField
        control={form.control}
        name="endDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-white">Date de fin</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={`w-full pl-3 text-left font-normal bg-winshirt-space-light border-winshirt-purple/30 ${!field.value && "text-gray-400"}`}
                  >
                    {field.value ? (
                      format(new Date(field.value), "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-winshirt-space border-winshirt-purple/30" align="start">
                <CalendarComponent
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription className="text-gray-400">
              Date à laquelle le tirage au sort sera automatiquement effectué
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Statut de la loterie</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                {lotteryStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LotteryDetailsFields;
