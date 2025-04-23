
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle, Lock } from 'lucide-react';
import { toast } from '@/lib/toast';
import { checkRLSStatus, fixSupabaseSecurityIssues } from '@/lib/supabase-security';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SecuritySettingsManager = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [tablesWithoutRLS, setTablesWithoutRLS] = useState<string[]>([]);
  
  const checkSecurity = async () => {
    setIsChecking(true);
    try {
      const tables = await checkRLSStatus();
      setTablesWithoutRLS(tables);
      
      if (tables.length === 0) {
        toast.success('Toutes les tables ont RLS activé');
      } else {
        toast.warning(`${tables.length} table(s) sans RLS activé`);
      }
    } catch (error) {
      console.error("Erreur lors des vérifications de sécurité:", error);
      toast.error("Erreur lors des vérifications de sécurité");
    } finally {
      setIsChecking(false);
    }
  };
  
  const fixSecurityIssues = async () => {
    setIsFixing(true);
    try {
      const success = await fixSupabaseSecurityIssues();
      if (success) {
        toast.success("Problèmes de sécurité corrigés avec succès");
        // Actualiser l'état
        await checkSecurity();
      } else {
        toast.error("Certains problèmes de sécurité n'ont pas pu être corrigés");
      }
    } catch (error) {
      console.error("Erreur lors de la correction des problèmes de sécurité:", error);
      toast.error("Erreur lors de la correction des problèmes de sécurité");
    } finally {
      setIsFixing(false);
    }
  };
  
  useEffect(() => {
    checkSecurity();
  }, []);
  
  return (
    <div className="space-y-4">
      <Card className="winshirt-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Vérification de la sécurité</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkSecurity} 
                disabled={isChecking}
                className="border-gray-500/20 text-gray-300"
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-1" />
                )}
                Vérifier la sécurité
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Row Level Security (RLS)</span>
                {tablesWithoutRLS.length === 0 ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Activé
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" /> {tablesWithoutRLS.length} table(s) sans RLS
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Chemins de recherche des fonctions</span>
                <Badge className="bg-yellow-600">
                  <AlertTriangle className="h-3 w-3 mr-1" /> À vérifier
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Protection par mot de passe</span>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Désactivé
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Options MFA</span>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Insuffisant
                </Badge>
              </div>
            </div>
            
            {tablesWithoutRLS.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Tables sans RLS activé</AlertTitle>
                <AlertDescription>
                  Les tables suivantes n'ont pas RLS activé : {tablesWithoutRLS.join(', ')}
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="bg-yellow-900/20 border-yellow-500/30 mt-4">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertTitle className="text-yellow-500">Avertissements de sécurité Supabase</AlertTitle>
              <AlertDescription className="text-yellow-300">
                <p>Les avertissements suivants nécessitent une attention :</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Function Search Path Mutable : La fonction exec_sql a un chemin de recherche mutable</li>
                  <li>Leaked Password Protection Disabled : La protection contre les fuites de mots de passe est désactivée</li>
                  <li>Insufficient MFA Options : Ce projet a trop peu d'options d'authentification multi-facteurs</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Separator className="my-4 bg-gray-700/30" />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">
                Les problèmes de sécurité RLS peuvent être corrigés automatiquement
              </p>
              <Button 
                onClick={fixSecurityIssues}
                disabled={isFixing || (tablesWithoutRLS.length === 0)}
              >
                {isFixing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-1" />
                )}
                Corriger les problèmes de sécurité
              </Button>
            </div>
            
            <Alert className="bg-blue-900/20 border-blue-500/30 mt-4">
              <AlertTitle className="text-blue-300">Comment résoudre les problèmes de sécurité avancés</AlertTitle>
              <AlertDescription className="text-blue-200 text-sm">
                <p>Pour résoudre les autres avertissements, vous devez accéder au tableau de bord Supabase :</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Pour <strong>Leaked Password Protection</strong> : Activez cette option dans les paramètres d'authentification</li>
                  <li>Pour <strong>MFA</strong> : Configurez des options MFA supplémentaires dans les paramètres d'authentification</li>
                  <li>Pour <strong>Function Search Path</strong> : Les chemins de recherche mutables peuvent être corrigés en utilisant le bouton ci-dessus</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettingsManager;
