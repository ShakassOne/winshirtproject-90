import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ProductFilters } from '@/types/product';

interface FilterCategory {
  name: string;
  values: string[];
}

const AdminFiltersPage = () => {
  const [categories, setCategories] = useState<FilterCategory[]>([
    { name: 'Category', values: ['T-Shirts', 'Hoodies', 'Sweaters'] },
    { name: 'Price', values: ['Under $25', '$25 - $50', 'Over $50'] },
    { name: 'Color', values: ['Red', 'Blue', 'Green'] },
    { name: 'Size', values: ['S', 'M', 'L'] },
  ]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load filters from local storage on component mount
    const storedFilters = localStorage.getItem('productFilters');
    if (storedFilters) {
      setCategories(JSON.parse(storedFilters));
    }
  }, []);

  useEffect(() => {
    // Save filters to local storage whenever they change
    localStorage.setItem('productFilters', JSON.stringify(categories));
  }, [categories]);

  const handleCategoryChange = (key: string, value: string) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[selectedCategoryIndex][key] = value;
      return newCategories;
    });
  };

  const handleValueChange = (index: number, value: string) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[selectedCategoryIndex].values[index] = value;
      return newCategories;
    });
  };

  const addCategory = () => {
    if (newCategoryName.trim() !== '') {
      setCategories([...categories, { name: newCategoryName, values: [] }]);
      setNewCategoryName('');
    }
  };

  const addValue = () => {
    if (selectedCategoryIndex !== null && newCategoryValue.trim() !== '') {
      setCategories(prevCategories => {
        const newCategories = [...prevCategories];
        newCategories[selectedCategoryIndex].values.push(newCategoryValue);
        setNewCategoryValue('');
        return newCategories;
      });
    }
  };

  const deleteCategory = (index: number) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories.splice(index, 1);
      return newCategories;
    });
    setSelectedCategoryIndex(null);
  };

  const deleteValue = (categoryIndex: number, valueIndex: number) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[categoryIndex].values.splice(valueIndex, 1);
      return newCategories;
    });
  };

  const saveFilters = () => {
    toast.success('Filters saved successfully!');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Filters Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li
                    key={index}
                    className={`p-2 rounded-md cursor-pointer ${
                      selectedCategoryIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCategoryIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => deleteCategory(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Add Category Form */}
              <div className="mt-4 flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="New Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button onClick={addCategory}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Category Details */}
        <div>
          {selectedCategoryIndex !== null ? (
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    type="text"
                    value={categories[selectedCategoryIndex].name}
                    onChange={(e) => handleCategoryChange('name', e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <Label>Values</Label>
                  <ul className="mt-2 space-y-2">
                    {categories[selectedCategoryIndex].values.map((value, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <Input
                          type="text"
                          value={value}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                        />
                        <Button variant="ghost" size="sm" onClick={() => deleteValue(selectedCategoryIndex, index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>

                  {/* Add Value Form */}
                  <div className="mt-4 flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="New Value"
                      value={newCategoryValue}
                      onChange={(e) => setNewCategoryValue(e.target.value)}
                    />
                    <Button onClick={addValue}><Plus className="h-4 w-4 mr-2" />Add Value</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <p className="text-gray-500">Select a category to view details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Button className="mt-4" onClick={saveFilters}><Save className="h-4 w-4 mr-2" />Save Filters</Button>
    </div>
  );
};

export default AdminFiltersPage;
