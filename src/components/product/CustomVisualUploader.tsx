import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileType2, Image } from 'lucide-react';
import { toast } from '@/lib/toast';

interface CustomVisualUploaderProps {
  onVisualUpload: (file: File, previewUrl: string) => void;
  onVisualRemove: () => void;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  uploadedVisual?: { file: File; previewUrl: string } | null;
  buttonStyle?: 'full' | 'compact';
}

const CustomVisualUploader: React.FC<CustomVisualUploaderProps> = ({
  onVisualUpload,
  onVisualRemove,
  allowedFileTypes = ['.png', '.jpg', '.jpeg', '.svg', '.eps', '.ai'],
  maxFileSizeMB = 10,
  uploadedVisual = null,
  buttonStyle = 'full'
}) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Vérifier le type de fichier
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedFileTypes.includes(fileExt)) {
      toast.error(`Type de fichier non autorisé. Types acceptés: ${allowedFileTypes.join(', ')}`);
      return;
    }

    // Vérifier la taille du fichier
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxFileSizeMB) {
      toast.error(`Fichier trop volumineux. Taille maximale: ${maxFileSizeMB}MB`);
      return;
    }

    // Créer une URL pour l'aperçu
    const previewUrl = URL.createObjectURL(file);
    onVisualUpload(file, previewUrl);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    // Plutôt que de supprimer complètement, utiliser une image par défaut
    if (onVisualRemove) {
      // Créer un fichier fictif pour l'image par défaut
      const defaultImageUrl = 'https://placehold.co/600x400?text=Image+Manquante';
      
      // Créer un blob à partir de l'URL d'image par défaut
      fetch(defaultImageUrl)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], "default-image.png", { type: "image/png" });
          onVisualUpload(file, defaultImageUrl);
        })
        .catch(() => {
          // En cas d'erreur, informer l'utilisateur mais ne pas laisser l'image vide
          toast.warning("Image par défaut utilisée");
          onVisualRemove();
        });
    }
  };

  // Extension du fichier
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  // Si on est en mode compact, on n'affiche qu'un bouton
  if (buttonStyle === 'compact') {
    return (
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={allowedFileTypes.join(',')}
          className="hidden"
        />
        <Button 
          onClick={handleButtonClick}
          variant="outline" 
          size="sm"
          className="border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/20 flex items-center gap-2"
        >
          <Image size={16} />
          <span>Upload</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedFileTypes.join(',')}
        className="hidden"
      />

      {!uploadedVisual ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            dragging ? 'border-winshirt-blue bg-winshirt-blue/10' : 'border-gray-600'
          }`}
          onClick={handleButtonClick}
        >
          <Upload size={40} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-1">Déposez votre visuel ici</h3>
          <p className="text-gray-400 text-sm mb-3">
            ou cliquez pour sélectionner un fichier
          </p>
          <p className="text-xs text-gray-500">
            Formats acceptés: {allowedFileTypes.join(', ')} - Max {maxFileSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Votre visuel</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-400 hover:text-red-300 p-1 h-auto"
            >
              <X size={18} />
            </Button>
          </div>

          {uploadedVisual.previewUrl ? (
            <div className="bg-gray-800/30 rounded-md overflow-hidden mb-3">
              <img
                src={uploadedVisual.previewUrl}
                alt="Aperçu du visuel"
                className="w-full h-[200px] object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-800/30 p-4 rounded-md mb-3">
              <FileType2 size={24} className="text-winshirt-blue" />
              <div>
                <p className="text-sm font-medium truncate">{uploadedVisual.file.name}</p>
                <p className="text-xs text-gray-400">
                  Format: {getFileExtension(uploadedVisual.file.name)}
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            {(uploadedVisual.file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVisualUploader;
