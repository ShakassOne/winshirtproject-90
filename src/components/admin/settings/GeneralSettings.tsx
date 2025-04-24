
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GeneralSettings: React.FC = () => {
  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle>Paramètres Généraux</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Les paramètres généraux de l'application seront configurés ici.</p>
        {/* TODO: Add specific general settings configuration */}
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
