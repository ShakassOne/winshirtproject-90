
import React from 'react';
import { Trophy, Calendar, Users, DollarSign } from 'lucide-react';

const StatsSection: React.FC = () => {
  return (
    <section className="py-16 relative bg-winshirt-space/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* T-shirts vendus */}
          <div className="winshirt-card p-6 text-center flex flex-col items-center winshirt-card-hover">
            <div className="w-16 h-16 bg-winshirt-purple/20 rounded-full flex items-center justify-center mb-4">
              <Users className="text-winshirt-purple-light w-8 h-8" />
            </div>
            <h3 className="text-4xl font-bold text-winshirt-blue-light mb-2">3000+</h3>
            <p className="text-gray-400">T-shirts vendus</p>
          </div>

          {/* Loteries terminées */}
          <div className="winshirt-card p-6 text-center flex flex-col items-center winshirt-card-hover">
            <div className="w-16 h-16 bg-winshirt-blue/20 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-winshirt-blue-light w-8 h-8" />
            </div>
            <h3 className="text-4xl font-bold text-winshirt-blue-light mb-2">24</h3>
            <p className="text-gray-400">Loteries terminées</p>
          </div>

          {/* Gagnants heureux */}
          <div className="winshirt-card p-6 text-center flex flex-col items-center winshirt-card-hover">
            <div className="w-16 h-16 bg-winshirt-purple/20 rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-winshirt-purple-light w-8 h-8" />
            </div>
            <h3 className="text-4xl font-bold text-winshirt-blue-light mb-2">18</h3>
            <p className="text-gray-400">Gagnants heureux</p>
          </div>

          {/* Valeur des lots distribués */}
          <div className="winshirt-card p-6 text-center flex flex-col items-center winshirt-card-hover">
            <div className="w-16 h-16 bg-winshirt-blue/20 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="text-winshirt-blue-light w-8 h-8" />
            </div>
            <h3 className="text-4xl font-bold text-winshirt-blue-light mb-2">100K+</h3>
            <p className="text-gray-400">Valeur des lots distribués</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
