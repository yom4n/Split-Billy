
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ArrowRight, IndianRupee } from 'lucide-react';
import PersonCard from './PersonCard';

interface BillItemData {
  id: string;
  item: string;
  amount: number;
  paidBy: string;
  sharedWith: string[];
}

interface ItemizedBillItemData {
  id: string;
  item: string;
  amount: number;
  paidBy: string;
  itemizedCosts: { person: string; item: string; cost: number }[];
}

interface SplitCalculationProps {
  billItems: BillItemData[];
  itemizedBillItems?: ItemizedBillItemData[];
}

const SplitCalculation: React.FC<SplitCalculationProps> = ({ billItems, itemizedBillItems = [] }) => {
  // Calculate totals and balances for each person
  const calculateSplits = () => {
    const personTotals: Record<string, {
      totalPaid: number;
      totalOwed: number;
      transactions: Array<{
        item: string;
        amount: number;
        type: 'owes' | 'paid';
      }>;
    }> = {};

    // Initialize all people from regular bills
    billItems.forEach(item => {
      const allPeople = [item.paidBy, ...item.sharedWith];
      allPeople.forEach(person => {
        if (!personTotals[person]) {
          personTotals[person] = {
            totalPaid: 0,
            totalOwed: 0,
            transactions: []
          };
        }
      });
    });

    // Initialize all people from itemized bills
    itemizedBillItems.forEach(item => {
      const allPeople = [item.paidBy, ...item.itemizedCosts.map(cost => cost.person)];
      allPeople.forEach(person => {
        if (!personTotals[person]) {
          personTotals[person] = {
            totalPaid: 0,
            totalOwed: 0,
            transactions: []
          };
        }
      });
    });

    // Calculate splits for regular items (equal split)
    billItems.forEach(item => {
      const totalShares = item.sharedWith.length + 1; // +1 for person who paid
      const perPersonAmount = item.amount / totalShares;

      // Person who paid
      personTotals[item.paidBy].totalPaid += item.amount;
      personTotals[item.paidBy].totalOwed += perPersonAmount;
      personTotals[item.paidBy].transactions.push({
        item: item.item,
        amount: item.amount,
        type: 'paid'
      });

      // People who shared
      item.sharedWith.forEach(person => {
        personTotals[person].totalOwed += perPersonAmount;
        personTotals[person].transactions.push({
          item: item.item,
          amount: perPersonAmount,
          type: 'owes'
        });
      });
    });

    // Calculate splits for itemized items (unequal split)
    itemizedBillItems.forEach(item => {
      // Person who paid
      personTotals[item.paidBy].totalPaid += item.amount;
      personTotals[item.paidBy].transactions.push({
        item: item.item,
        amount: item.amount,
        type: 'paid'
      });

      // People who ordered specific items
      item.itemizedCosts.forEach(cost => {
        personTotals[cost.person].totalOwed += cost.cost;
        personTotals[cost.person].transactions.push({
          item: cost.item,
          amount: cost.cost,
          type: 'owes'
        });
      });
    });

    return personTotals;
  };

  const personTotals = calculateSplits();
  const totalBillAmount = billItems.reduce((sum, item) => sum + item.amount, 0) + 
                         itemizedBillItems.reduce((sum, item) => sum + item.amount, 0);

  // Calculate settlements (who owes whom)
  const calculateSettlements = () => {
    const settlements: Array<{
      from: string;
      to: string;
      amount: number;
    }> = [];

    const balances = Object.entries(personTotals).map(([name, data]) => ({
      name,
      balance: data.totalPaid - data.totalOwed
    }));

    const creditors = balances.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const settlementAmount = Math.min(creditor.balance, Math.abs(debtor.balance));
      
      if (settlementAmount > 0.01) { // Avoid tiny amounts due to floating point
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: settlementAmount
        });
      }

      creditor.balance -= settlementAmount;
      debtor.balance += settlementAmount;

      if (creditor.balance < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j++;
    }

    return settlements;
  };

  const settlements = calculateSettlements();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
            <Calculator className="h-6 w-6 text-green-600" />
            Bill Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/80 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Bill</div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-800">
                <IndianRupee className="h-6 w-6" />
                {totalBillAmount}
              </div>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Items</div>
              <div className="text-2xl font-bold text-blue-600">{billItems.length + itemizedBillItems.length}</div>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">People Involved</div>
              <div className="text-2xl font-bold text-green-600">{Object.keys(personTotals).length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Person Cards */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Individual Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(personTotals).map(([name, data]) => (
            <PersonCard
              key={name}
              name={name}
              totalOwed={data.totalOwed}
              totalPaid={data.totalPaid}
              netBalance={data.totalPaid - data.totalOwed}
              transactions={data.transactions}
            />
          ))}
        </div>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              Who Pays Whom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{settlement.from}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-blue-600">{settlement.to}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-green-600">
                    <IndianRupee className="h-4 w-4" />
                    {settlement.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SplitCalculation;
