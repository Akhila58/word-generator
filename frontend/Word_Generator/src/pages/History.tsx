import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, History as HistoryIcon, Calendar, Clock, BookOpen, ArrowLeft, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHistory } from "@/lib/api";
import { FloatingSidebar } from "@/components/ui/floating-sidebar";

interface HistoryItem {
  generated_on: string;
  user_id: string;
  data: Array<{
    phrase?: string;
    term?: string;
    "simple meaning": string;
    "example usage 1": string;
    "example usage 2": string;
    "example usage 3": string;
  }>;
}

interface BackendHistoryItem {
  word_object: Array<{
    phrase?: string;
    term?: string;
    "Simple Meaning": string;
    "Example Usage 1": string;
    "Example Usage 2": string;
    "Example Usage 3": string;
  }>;
  user_id: string;
  words_generated_on: string;
}

const History = () => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    loadHistory();
  }, [navigate]);

  const parseDate = (dateString: string) => {
    // Handle DD-MM-YYYY format from backend
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Convert DD-MM-YYYY to YYYY-MM-DD for proper parsing
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return new Date(`${year}-${month}-${day}`);
      }
    }
    return new Date(dateString);
  };

  const transformBackendData = (backendData: BackendHistoryItem[]): HistoryItem[] => {
    console.log('Transforming backend data:', backendData);
    const transformed = backendData.map(item => ({
      generated_on: item.words_generated_on,
      user_id: item.user_id,
      data: item.word_object.map(wordObj => ({
        phrase: wordObj.phrase || '',
        term: wordObj.term || '',
        "simple meaning": wordObj["Simple Meaning"] || '',
        "example usage 1": wordObj["Example Usage 1"] || '',
        "example usage 2": wordObj["Example Usage 2"] || '',
        "example usage 3": wordObj["Example Usage 3"] || '',
      }))
    }));
    console.log('Transformed data:', transformed);
    return transformed;
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      const transformedData = transformBackendData(data || []);
      setHistoryData(transformedData);
    } catch (error: any) {
      toast({
        title: "Failed to load history",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseDate(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = parseDate(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  const groupHistoryByTime = (history: HistoryItem[]) => {
    const now = new Date();
    const groups = {
      Today: [] as HistoryItem[],
      Yesterday: [] as HistoryItem[],
      'Last 7 Days': [] as HistoryItem[],
      'Last 30 Days': [] as HistoryItem[],
      Older: [] as HistoryItem[]
    };

    history.forEach(item => {
      const date = parseDate(item.generated_on);
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 24) {
        groups.Today.push(item);
      } else if (diffInDays === 1) {
        groups.Yesterday.push(item);
      } else if (diffInDays < 7) {
        groups['Last 7 Days'].push(item);
      } else if (diffInDays < 30) {
        groups['Last 30 Days'].push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return groups;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getProjectName = (item: HistoryItem) => {
    return `Word Generation - ${item.data?.length || 0} words`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  const groupedHistory = groupHistoryByTime(historyData);

  // Detailed view when a history item is selected
  if (selectedHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 relative">
        <FloatingSidebar currentPath="/history" />
        
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Header with back button */}
        <header className="bg-white/60 backdrop-blur-xl border-b border-white/30 sticky top-0 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pl-24">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedHistory(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to History
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {getProjectName(selectedHistory)}
                    </h1>
                    <p className="text-sm text-gray-500">{formatDate(selectedHistory.generated_on)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Word content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-24 relative z-10">
          {/* Date information */}
          <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 shadow-sm">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Generated on: <strong>{formatDate(selectedHistory.generated_on)}</strong></span>
              <span className="text-gray-400">•</span>
              <span>{getTimeAgo(selectedHistory.generated_on)}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {selectedHistory.data?.map((wordItem, index) => (
              <Card key={index} className="shadow-xl border border-white/30 bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-gray-900 leading-relaxed">
                        {wordItem.phrase || wordItem.term || "Untitled"}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {wordItem.phrase ? "Phrase" : wordItem.term ? "Term" : "Unknown"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(wordItem.phrase || wordItem.term || "", "Word")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {wordItem["simple meaning"] && (
                      <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-700 flex-1">
                            {wordItem["simple meaning"]}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(wordItem["simple meaning"], "Meaning")}
                            className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {(wordItem["example usage 1"] || wordItem["example usage 2"] || wordItem["example usage 3"]) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Usage Examples:</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const examples = [
                                wordItem["example usage 1"],
                                wordItem["example usage 2"], 
                                wordItem["example usage 3"]
                              ].filter(Boolean).join('\n\n');
                              copyToClipboard(examples, "Examples");
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {[
                            wordItem["example usage 1"],
                            wordItem["example usage 2"], 
                            wordItem["example usage 3"]
                          ].filter(Boolean).map((example, exampleIndex) => (
                            <div key={exampleIndex} className="bg-gray-50/50 rounded-lg p-2 border-l-4 border-purple-300">
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {example}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Timeline view (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 relative">
      <FloatingSidebar currentPath="/history" />
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/30 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pl-24">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <HistoryIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Generation History</h1>
                <p className="text-sm text-gray-500">View your past word generations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/quiz')}
                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
              >
                Quiz
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-24 relative z-10">
        {historyData.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No history yet</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Start generating words from your dashboard to build your generation history.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([timeGroup, items]) => {
              if (items.length === 0) return null;
              
              return (
                <div key={timeGroup} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700 sticky top-20 bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full border border-white/30 inline-block shadow-sm">
                    {timeGroup}
                  </h2>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <Card 
                        key={index}
                        className="shadow-md border border-white/40 bg-white/60 backdrop-blur-sm hover:shadow-xl hover:bg-white/80 transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedHistory(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {getProjectName(item)}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {getTimeAgo(item.generated_on)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                                {item.data?.length || 0} words
                              </Badge>
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <ArrowLeft className="w-3 h-3 rotate-180 text-purple-600" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
