import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Phrase {
  Phrase?: string;
  Term?: string;
  "Simple Meaning": string;
  "Example Usage 1": string;
  "Example Usage 2": string;
  "Example Usage 3": string;
}

interface PhraseCardProps {
  item: Phrase;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ item }) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(label));
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(label);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const isPhrase = item.Phrase !== undefined && item.Phrase !== null && item.Phrase !== '';
  const title = item.Phrase || item.Term || 'Untitled';
  const copyId = `item-${title}`;
  const isCopied = copiedItems.has(copyId);

  // Normalize keys for meaning and examples
  const getMeaning = () => {
    return (
      item["Simple Meaning"] ||
      item["simple meaning"] ||
      item["Simple meaning"] ||
      item["simple_meaning"] ||
      item["meaning"] ||
      ""
    );
  };

  const getExample = (num: number) => {
    return (
      item[`Example Usage ${num}`] ||
      item[`example usage ${num}`] ||
      item[`Example usage ${num}`] ||
      item[`example_usage_${num}`] ||
      item[`usage${num}`] ||
      ""
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isPhrase ? (
                <MessageSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <BookOpen className="w-5 h-5 text-purple-600" />
              )}
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  isPhrase 
                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                    : 'bg-purple-100 text-purple-700 border-purple-200'
                }`}
              >
                {isPhrase ? 'Phrase' : 'Term'}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
              {title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(title, copyId)}
            className="text-gray-500 hover:text-gray-700 shrink-0"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Simple Meaning */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            💡 Simple Meaning
          </h4>
          <p className="text-gray-800 text-sm leading-relaxed">
            {getMeaning()}
          </p>
        </div>

        {/* Usage Examples */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            📝 Usage Examples
          </h4>
          <div className="space-y-2">
            {[1, 2, 3].map(num => {
              const example = getExample(num);
              if (!example) return null;
              return (
                <div 
                  key={num} 
                  className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-800 leading-relaxed flex-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-400 text-white text-xs rounded-full mr-2 shrink-0">
                        {num}
                      </span>
                      {example}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(example, `${copyId}-example-${num}`)}
                      className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"
                    >
                      {copiedItems.has(`${copyId}-example-${num}`) ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhraseCard;
