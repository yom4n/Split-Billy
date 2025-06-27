
interface GeminiResponse {
  item: string;
  amount: number;
  paidBy: string;
  sharedWith: string[];
  isEqualSplit?: boolean;
  itemizedCosts?: { person: string; item: string; cost: number }[];
}

export const processAudioWithGemini = async (audioBlob: Blob, apiKey: string, isEqualSplit: boolean = true): Promise<GeminiResponse> => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  try {
    // Convert audio blob to base64
    const audioBase64 = await blobToBase64(audioBlob);
    
    console.log('Converting audio to text and processing...');

    const prompt = isEqualSplit ? `
    Analyze this audio recording and extract the following information about a bill/expense:
    1. The item or service that was purchased
    2. The amount paid (extract just the number)
    3. Who paid for it
    4. Who it was shared with (list of names)

    Please respond in this exact JSON format:
    {
      "item": "name of the item",
      "amount": numeric_amount,
      "paidBy": "name of person who paid",
      "sharedWith": ["name1", "name2", "name3"],
      "isEqualSplit": true
    }

    The audio might say something like "John paid 250 rupees for pizza and it was shared between Alice, Bob, Charlie"
    Extract the item (pizza), amount (250), paidBy (John), and sharedWith (Alice, Bob, Charlie).
    
    Make sure to return valid JSON only, no additional text.
    ` : `
    Analyze this audio recording and extract information about an unequal bill split with itemized costs:
    1. The main category/item that was purchased
    2. The total amount paid
    3. Who paid for it
    4. Individual items and their costs for each person

    Please respond in this exact JSON format:
    {
      "item": "main category name",
      "amount": total_numeric_amount,
      "paidBy": "name of person who paid",
      "sharedWith": [],
      "isEqualSplit": false,
      "itemizedCosts": [
        {"person": "name1", "item": "item1", "cost": cost1},
        {"person": "name2", "item": "item2", "cost": cost2}
      ]
    }

    The audio might say something like "Aryan paid 60rs for drinks which had lemon drink for arun which costed 10rs and a soda for mohit which costed 20rs and a mojito for gurjot which costed 30rs"
    Extract the main item (drinks), total amount (60), paidBy (Aryan), and itemizedCosts with each person's specific item and cost.
    
    Make sure to return valid JSON only, no additional text.
    `;

    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: audioBlob.type || 'audio/wav',
              data: audioBase64
            }
          }
        ]
      }]
    };

    console.log('Sending request to Gemini API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);
    
    // Parse the JSON response
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsedResult = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsedResult.item || !parsedResult.amount || !parsedResult.paidBy) {
        throw new Error('Invalid JSON structure from Gemini');
      }
      
      return {
        item: parsedResult.item,
        amount: Number(parsedResult.amount),
        paidBy: parsedResult.paidBy,
        sharedWith: parsedResult.sharedWith || [],
        isEqualSplit: parsedResult.isEqualSplit !== false,
        itemizedCosts: parsedResult.itemizedCosts || []
      };
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Fallback with example data if parsing fails
      return {
        item: "Unknown Item",
        amount: 0,
        paidBy: "Unknown",
        sharedWith: [],
        isEqualSplit: isEqualSplit
      };
    }
    
  } catch (error) {
    console.error('Error processing audio with Gemini:', error);
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix to get just the base64 string
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
