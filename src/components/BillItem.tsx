
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, X, ShoppingBag, User, IndianRupee } from 'lucide-react';

interface BillItemData {
  id: string;
  item: string;
  amount: number;
  paidBy: string;
  sharedWith: string[];
}

interface BillItemProps {
  item: BillItemData;
  onAddPerson: (personName: string) => void;
  onRemovePerson: (personName: string) => void;
  onDelete: () => void;
  allPeople: string[];
}

const BillItem: React.FC<BillItemProps> = ({ item, onAddPerson, onRemovePerson, onDelete, allPeople }) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAddPerson = () => {
    if (newPersonName.trim() && !item.sharedWith.includes(newPersonName.trim())) {
      onAddPerson(newPersonName.trim());
      setNewPersonName('');
      setShowAddInput(false);
    }
  };

  const perPersonAmount = item.amount / (item.sharedWith.length + 1); // +1 for the person who paid

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow duration-200 relative">
      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bill Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{item.item}" from the bill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardHeader className="pb-4 pl-12">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-600" />
            <span className="text-xl text-gray-800">{item.item}</span>
          </div>
          <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
            <IndianRupee className="h-6 w-6" />
            {item.amount}
          </div>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Paid by <strong className="text-blue-600">{item.paidBy}</strong></span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Shared with:</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {item.sharedWith.map((person, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors duration-200 flex items-center gap-1 px-3 py-1"
              >
                <span>{person}</span>
                <X 
                  className="h-3 w-3 hover:text-red-600 cursor-pointer" 
                  onClick={() => onRemovePerson(person)}
                />
              </Badge>
            ))}
            
            {!showAddInput ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddInput(true)}
                className="h-7 px-3 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Person
              </Button>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
                  className="h-7 w-24 text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={handleAddPerson} className="h-7 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddInput(false);
                    setNewPersonName('');
                  }}
                  className="h-7 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-1">Amount per person:</div>
          <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
            <IndianRupee className="h-4 w-4" />
            {perPersonAmount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Split between {item.sharedWith.length + 1} people
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillItem;
