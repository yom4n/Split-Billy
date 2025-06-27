
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, IndianRupee } from 'lucide-react';

interface PersonCardProps {
  name: string;
  totalOwed: number;
  totalPaid: number;
  netBalance: number;
  transactions: Array<{
    item: string;
    amount: number;
    type: 'owes' | 'paid';
  }>;
}

const PersonCard: React.FC<PersonCardProps> = ({ 
  name, 
  totalOwed, 
  totalPaid, 
  netBalance, 
  transactions 
}) => {
  const isOwed = netBalance > 0;
  const owesAmount = Math.abs(netBalance);

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
          </div>
          <Badge 
            variant={isOwed ? "default" : "destructive"}
            className={`${isOwed ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
          >
            {isOwed ? 'Gets' : 'Owes'} ₹{owesAmount.toFixed(2)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Total Paid:</span>
            <div className="flex items-center gap-1 font-medium text-green-600">
              <IndianRupee className="h-3 w-3" />
              {totalPaid.toFixed(2)}
            </div>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Total Share:</span>
            <div className="flex items-center gap-1 font-medium text-blue-600">
              <IndianRupee className="h-3 w-3" />
              {totalOwed.toFixed(2)}
            </div>
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Items:</div>
            <div className="flex flex-wrap gap-1">
              {transactions.map((transaction, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-1"
                >
                  {transaction.item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonCard;
