
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { X, ShoppingBag, User, IndianRupee, Receipt } from 'lucide-react';

interface ItemizedCost {
  person: string;
  item: string;
  cost: number;
}

interface ItemizedBillItemData {
  id: string;
  item: string;
  amount: number;
  paidBy: string;
  itemizedCosts: ItemizedCost[];
}

interface ItemizedBillItemProps {
  item: ItemizedBillItemData;
  onDelete: () => void;
}

const ItemizedBillItem: React.FC<ItemizedBillItemProps> = ({ item, onDelete }) => {
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
            <Receipt className="h-5 w-5 text-purple-600" />
            <span className="text-xl text-gray-800">{item.item}</span>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Itemized
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
            <IndianRupee className="h-6 w-6" />
            {item.amount}
          </div>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Paid by <strong className="text-purple-600">{item.paidBy}</strong></span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Itemized Breakdown:</h4>
          <div className="space-y-2">
            {item.itemizedCosts.map((cost, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {cost.person}
                  </Badge>
                  <span className="text-gray-700">{cost.item}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-green-600">
                  <IndianRupee className="h-4 w-4" />
                  {cost.cost}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="text-sm text-purple-700 mb-1">Split Type:</div>
          <div className="text-lg font-semibold text-purple-600">
            Unequal Split (Itemized)
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Each person pays for their specific items
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemizedBillItem;
