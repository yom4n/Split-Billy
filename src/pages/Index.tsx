import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Plus, Calculator, Key, Eye, EyeOff, Receipt } from 'lucide-react';
import VoiceRecorder from '@/components/VoiceRecorder';
import BillItem from '@/components/BillItem';
import BillConfirmation from '@/components/BillConfirmation';
import PersonCard from '@/components/PersonCard';
import SplitCalculation from '@/components/SplitCalculation';
import UnequalVoiceRecorder from '@/components/UnequalVoiceRecorder';
import ItemizedBillItem from '@/components/ItemizedBillItem';
import { processAudioWithGemini } from '@/utils/geminiProcessor';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const [billItems, setBillItems] = useState<BillItemData[]>([]);
  const [itemizedBillItems, setItemizedBillItems] = useState<ItemizedBillItemData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allPeople, setAllPeople] = useState<string[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [pendingBillItem, setPendingBillItem] = useState<BillItemData | null>(null);
  const [pendingItemizedBillItem, setPendingItemizedBillItem] = useState<ItemizedBillItemData | null>(null);
  const [isRecordingEqual, setIsRecordingEqual] = useState(false);
  const [isRecordingUnequal, setIsRecordingUnequal] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBillItems = localStorage.getItem('billItems');
    const savedItemizedBillItems = localStorage.getItem('itemizedBillItems');
    const savedAllPeople = localStorage.getItem('allPeople');
    const savedApiKey = localStorage.getItem('geminiApiKey');

    if (savedBillItems) {
      setBillItems(JSON.parse(savedBillItems));
    }
    if (savedItemizedBillItems) {
      setItemizedBillItems(JSON.parse(savedItemizedBillItems));
    }
    if (savedAllPeople) {
      setAllPeople(JSON.parse(savedAllPeople));
    }
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
      setIsApiKeyConfigured(true);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('billItems', JSON.stringify(billItems));
  }, [billItems]);

  useEffect(() => {
    localStorage.setItem('itemizedBillItems', JSON.stringify(itemizedBillItems));
  }, [itemizedBillItems]);

  useEffect(() => {
    localStorage.setItem('allPeople', JSON.stringify(allPeople));
  }, [allPeople]);

  useEffect(() => {
    if (geminiApiKey.trim()) {
      localStorage.setItem('geminiApiKey', geminiApiKey);
    }
  }, [geminiApiKey]);

  const handleApiKeySubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && geminiApiKey.trim()) {
      setIsApiKeyConfigured(true);
      toast({
        title: "API Key Configured",
        description: "Your Gemini API key has been successfully configured.",
      });
    }
  };

  const handleAudioProcessed = async (audioBlob: Blob, isEqualSplit: boolean = true) => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Processing audio with Gemini AI...');
      const result = await processAudioWithGemini(audioBlob, geminiApiKey, isEqualSplit);
      console.log('Gemini AI result:', result);
      
      if (isEqualSplit) {
        const newBillItem: BillItemData = {
          id: Date.now().toString(),
          item: result.item,
          amount: result.amount,
          paidBy: result.paidBy,
          sharedWith: result.sharedWith
        };
        setPendingBillItem(newBillItem);
      } else {
        const newItemizedBillItem: ItemizedBillItemData = {
          id: Date.now().toString(),
          item: result.item,
          amount: result.amount,
          paidBy: result.paidBy,
          itemizedCosts: result.itemizedCosts || []
        };
        setPendingItemizedBillItem(newItemizedBillItem);
      }

      toast({
        title: "Audio Processed Successfully!",
        description: "Please confirm the bill details below.",
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsRecordingEqual(false);
      setIsRecordingUnequal(false);
    }
  };

  const confirmBillItem = () => {
    if (pendingBillItem) {
      setBillItems(prev => [...prev, pendingBillItem]);
      
      // Update all people list
      const newPeople = [pendingBillItem.paidBy, ...pendingBillItem.sharedWith];
      setAllPeople(prev => {
        const combined = [...prev, ...newPeople];
        return [...new Set(combined)]; // Remove duplicates
      });

      toast({
        title: "Bill Item Added!",
        description: `Added ${pendingBillItem.item} for ₹${pendingBillItem.amount}`,
      });

      setPendingBillItem(null);
    }
  };

  const confirmItemizedBillItem = () => {
    if (pendingItemizedBillItem) {
      setItemizedBillItems(prev => [...prev, pendingItemizedBillItem]);
      
      // Update all people list
      const newPeople = [pendingItemizedBillItem.paidBy, ...pendingItemizedBillItem.itemizedCosts.map(cost => cost.person)];
      setAllPeople(prev => {
        const combined = [...prev, ...newPeople];
        return [...new Set(combined)]; // Remove duplicates
      });

      toast({
        title: "Itemized Bill Added!",
        description: `Added ${pendingItemizedBillItem.item} for ₹${pendingItemizedBillItem.amount}`,
      });

      setPendingItemizedBillItem(null);
    }
  };

  const rejectBillItem = () => {
    setPendingBillItem(null);
    toast({
      title: "Bill Item Discarded",
      description: "The bill item has been removed.",
    });
  };

  const rejectItemizedBillItem = () => {
    setPendingItemizedBillItem(null);
    toast({
      title: "Bill Item Discarded",
      description: "The itemized bill item has been removed.",
    });
  };

  const deleteBillItem = (billId: string) => {
    setBillItems(prev => prev.filter(item => item.id !== billId));
    toast({
      title: "Bill Item Removed",
      description: "The bill item has been deleted.",
    });
  };

  const deleteItemizedBillItem = (billId: string) => {
    setItemizedBillItems(prev => prev.filter(item => item.id !== billId));
    toast({
      title: "Itemized Bill Item Removed",
      description: "The itemized bill item has been deleted.",
    });
  };

  const addPersonToBill = (billId: string, personName: string) => {
    setBillItems(prev => prev.map(item => 
      item.id === billId 
        ? { ...item, sharedWith: [...item.sharedWith, personName] }
        : item
    ));
    
    if (!allPeople.includes(personName)) {
      setAllPeople(prev => [...prev, personName]);
    }
  };

  const removePersonFromBill = (billId: string, personName: string) => {
    setBillItems(prev => prev.map(item => 
      item.id === billId 
        ? { ...item, sharedWith: item.sharedWith.filter(name => name !== personName) }
        : item
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Voice Bill Buddy</h1>
          <p className="text-gray-600 text-lg">Split bills effortlessly with AI-powered voice recognition</p>
        </div>

        {/* API Key Input */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <Key className="h-5 w-5 text-blue-600" />
              Gemini API Key
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {isApiKeyConfigured ? (
                <span className="text-green-600 font-medium">✓ API Configured</span>
              ) : (
                <>
                  Enter your Gemini API key to enable voice processing. Get one from{' '}
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  onKeyDown={handleApiKeySubmit}
                  className="font-mono flex-1"
                />
                {geminiApiKey && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Recording Sections */}
        {(!isRecordingUnequal || isRecordingEqual) && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-gray-800">
                <Mic className="h-6 w-6 text-blue-600" />
                Equal Split Recording
              </CardTitle>
              <p className="text-gray-600">
                Say something like: "Aryan paid 250rs for margherita pizza and it was shared between Arun, Sahil, Mohit"
              </p>
            </CardHeader>
            <CardContent>
              <VoiceRecorder 
                onAudioProcessed={(audioBlob) => {
                  setIsRecordingEqual(true);
                  handleAudioProcessed(audioBlob, true);
                }}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>
        )}

        {(!isRecordingEqual || isRecordingUnequal) && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-gray-800">
                <Receipt className="h-6 w-6 text-purple-600" />
                Unequal Split Recording
              </CardTitle>
              <p className="text-gray-600">
                Say something like: "Aryan paid 60rs for drinks which had lemon drink for arun which costed 10rs and a soda for mohit which costed 20rs and a mojito for gurjot which costed 30rs"
              </p>
            </CardHeader>
            <CardContent>
              <UnequalVoiceRecorder 
                onAudioProcessed={(audioBlob) => {
                  setIsRecordingUnequal(true);
                  handleAudioProcessed(audioBlob, false);
                }}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>
        )}

        {/* Bill Confirmations */}
        {pendingBillItem && (
          <BillConfirmation
            billItem={pendingBillItem}
            onConfirm={confirmBillItem}
            onReject={rejectBillItem}
          />
        )}

        {pendingItemizedBillItem && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Confirm Itemized Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{pendingItemizedBillItem.item}</h3>
                <p className="text-gray-600 mb-2">Total: ₹{pendingItemizedBillItem.amount}</p>
                <p className="text-gray-600 mb-3">Paid by: {pendingItemizedBillItem.paidBy}</p>
                <div className="space-y-2">
                  {pendingItemizedBillItem.itemizedCosts.map((cost, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{cost.person} - {cost.item}</span>
                      <span className="font-semibold">₹{cost.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={confirmItemizedBillItem} className="flex-1">
                  Confirm
                </Button>
                <Button onClick={rejectItemizedBillItem} variant="outline" className="flex-1">
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bill Items */}
        {(billItems.length > 0 || itemizedBillItems.length > 0) && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-green-600" />
              Bill Items
            </h2>
            {billItems.map((item) => (
              <BillItem
                key={item.id}
                item={item}
                onAddPerson={(personName) => addPersonToBill(item.id, personName)}
                onRemovePerson={(personName) => removePersonFromBill(item.id, personName)}
                onDelete={() => deleteBillItem(item.id)}
                allPeople={allPeople}
              />
            ))}
            {itemizedBillItems.map((item) => (
              <ItemizedBillItem
                key={item.id}
                item={item}
                onDelete={() => deleteItemizedBillItem(item.id)}
              />
            ))}
          </div>
        )}

        {/* Split Calculation - Update to pass itemized bills */}
        {(billItems.length > 0 || itemizedBillItems.length > 0) && (
          <SplitCalculation 
            billItems={billItems} 
            itemizedBillItems={itemizedBillItems}
          />
        )}

        {/* Empty State */}
        {billItems.length === 0 && itemizedBillItems.length === 0 && !isProcessing && !pendingBillItem && !pendingItemizedBillItem && (
          <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No bills recorded yet</h3>
              <p className="text-gray-500">
                {!geminiApiKey.trim() 
                  ? "Enter your Gemini API key and start recording your first bill!"
                  : "Choose between equal or unequal split and start recording!"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
