
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShoppingBag, User, IndianRupee } from 'lucide-react';

interface BillItemData {
  item: string;
  amount: number;
  paidBy: string;
  sharedWith: string[];
}

interface BillConfirmationProps {
  billItem: BillItemData;
  onConfirm: () => void;
  onReject: () => void;
}

const BillConfirmation: React.FC<BillConfirmationProps> = ({ billItem, onConfirm, onReject }) => {
  const perPersonAmount = billItem.amount / (billItem.sharedWith.length + 1);

  return (
    <Card className="shadow-lg border-2 border-blue-200 bg-blue-50/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <span className="text-xl text-gray-800">Confirm Bill Item</span>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">Please verify the details before adding to your bill</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">{billItem.item}</h3>
            <div className="flex items-center gap-1 text-xl font-bold text-green-600">
              <IndianRupee className="h-5 w-5" />
              {billItem.amount}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <User className="h-4 w-4" />
            <span>Paid by <strong className="text-blue-600">{billItem.paidBy}</strong></span>
          </div>

          <div className="mb-3">
            <h4 className="font-medium text-gray-700 mb-2">Shared with:</h4>
            <div className="flex flex-wrap gap-2">
              {billItem.sharedWith.map((person, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {person}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Amount per person:</div>
            <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
              <IndianRupee className="h-4 w-4" />
              {perPersonAmount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Split between {billItem.sharedWith.length + 1} people
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Confirm & Add
          </Button>
          <Button
            onClick={onReject}
            variant="destructive"
            className="px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Discard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillConfirmation;
