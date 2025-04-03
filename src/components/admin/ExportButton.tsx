
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  onExport: (format: 'csv' | 'json' | 'excel') => void;
  label?: string;
  disabled?: boolean;
  exportFormats?: Array<'csv' | 'json' | 'excel'>;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  label = 'Exporter',
  disabled = false,
  exportFormats = ['csv', 'json', 'excel']
}) => {
  const formatLabels = {
    csv: 'CSV',
    json: 'JSON',
    excel: 'Excel'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
          disabled={disabled}
        >
          <Download size={16} className="mr-2" /> {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-winshirt-space border-winshirt-purple/30 text-white">
        {exportFormats.map(format => (
          <DropdownMenuItem
            key={format}
            onClick={() => onExport(format)}
            className="cursor-pointer hover:bg-winshirt-purple/20"
          >
            Exporter en {formatLabels[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
