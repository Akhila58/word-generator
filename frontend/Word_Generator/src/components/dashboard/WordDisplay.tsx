
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WordDisplayProps {
  wordData: any;
}

const WordDisplay = ({ wordData }: WordDisplayProps) => {
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
      
      // Reset copied state after 2 seconds
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

  if (!wordData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No word data available</p>
      </div>
    );
  }

  // Handle array format (new format)
  if (Array.isArray(wordData)) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            ✨ {wordData.length} Professional Content Items Generated
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {wordData.map((item, index) => {
            const isPhrase = item.phrase !== undefined;
            const isTerm = item.term !== undefined;
            const title = isPhrase ? item.phrase : item.term;
            const copyId = `item-${index}`;
            const isCopied = copiedItems.has(copyId);
            
            return (
              <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
                      {item["Simple Meaning"]}
                    </p>
                  </div>

                  {/* Usage Examples */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      📝 Usage Examples
                    </h4>
                    <div className="space-y-2">
                      {[1, 2, 3].map(num => {
                        const exampleKey = `Example Usage ${num}`;
                        const example = item[exampleKey];
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
          })}
        </div>
      </div>
    );
  }

  // Handle legacy object format
  const sections = typeof wordData === 'object' && !Array.isArray(wordData) 
    ? Object.entries(wordData)
    : [['Generated Content', wordData]];

  const renderLegacySection = (title: string, items: string[] | string, type: 'list' | 'text' = 'list') => {
    if (!items) return null;

    const content = type === 'list' && Array.isArray(items) ? items : [items.toString()];
    const isCopied = copiedItems.has(title);

    return (
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {title.replace('_', ' ')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(content.join(', '), title)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {type === 'list' && Array.isArray(items) ? (
            <div className="flex flex-wrap gap-2">
              {content.map((item, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-default"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="prose prose-sm">
              <p className="text-gray-700 leading-relaxed">{content[0]}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
          ✨ Words Generated Successfully
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {sections.map(([key, value]) => {
          if (value === null || value === undefined) return null;
          
          const isArray = Array.isArray(value);
          const isString = typeof value === 'string';
          
          if (isArray || isString) {
            return renderLegacySection(key, value, isArray ? 'list' : 'text');
          }
          
          return null;
        })}
      </div>
      
      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No content to display</p>
        </div>
      )}
    </div>
  );
};

export default WordDisplay;
