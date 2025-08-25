
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, LogOut, Calendar, User, FileText, Plus, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateData, getData } from "@/lib/api";
import WordDisplay from "@/components/dashboard/WordDisplay";
import StatsCards from "@/components/dashboard/StatsCards";
import PhraseCard from "@/components/dashboard/PhraseCard";
import { FloatingSidebar } from "@/components/ui/floating-sidebar";

const Dashboard = () => {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    loadTodaysWords();
  }, [navigate]);

  const transformDataForPhraseCard = (data: any[]) => {
    console.log("Transforming data for PhraseCard:", data);
    return data.map((item, index) => {
      console.log(`Processing item ${index}:`, item);
      console.log(`Item ${index} keys:`, Object.keys(item));
      console.log(`Item ${index} Phrase:`, item.Phrase);
      console.log(`Item ${index} Term:`, item.Term);
      
      const result: any = {
        "Simple Meaning": item["Simple Meaning"] || item["simple meaning"] || '',
        "Example Usage 1": item["Example Usage 1"] || item["example usage 1"] || '',
        "Example Usage 2": item["Example Usage 2"] || item["example usage 2"] || '',
        "Example Usage 3": item["Example Usage 3"] || item["example usage 3"] || '',
      };
      
      // Check for Phrase/Term in various formats
      if (item.Phrase !== undefined && item.Phrase !== null && item.Phrase !== '') {
        result.Phrase = item.Phrase;
        console.log(`Item ${index} has Phrase:`, item.Phrase);
      } else if (item.phrase !== undefined && item.phrase !== null && item.phrase !== '') {
        result.Phrase = item.phrase;
        console.log(`Item ${index} has phrase (lowercase):`, item.phrase);
      }
      
      if (item.Term !== undefined && item.Term !== null && item.Term !== '') {
        result.Term = item.Term;
        console.log(`Item ${index} has Term:`, item.Term);
      } else if (item.term !== undefined && item.term !== null && item.term !== '') {
        result.Term = item.term;
        console.log(`Item ${index} has term (lowercase):`, item.term);
      }
      
      console.log(`Transformed item ${index}:`, result);
      return result;
    });
  };

  const loadTodaysWords = async () => {
    try {
      const data = await getData();
      if (data && Array.isArray(data)) {
        console.log("Received data on load:", data);
        setAllItems(transformDataForPhraseCard(data));
      }
    } catch (error) {
      console.error("Error loading today's words:", error);
      console.log("No words generated today yet");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleGenerateWords = async () => {
    setLoading(true);
    try {
      const data = await generateData();
      console.log("Received data:", data);
      if (data && Array.isArray(data)) {
        setAllItems(transformDataForPhraseCard(data));
        toast({
          title: "Success!",
          description: "New words generated successfully",
        });
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (error: any) {
      console.error("Error generating words:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Floating Sidebar */}
      <FloatingSidebar currentPath="/dashboard" />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">WordGen Pro</h1>
              <p className="text-sm text-gray-500">Content Generation Dashboard</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/quiz')}
                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 flex items-center gap-2"
              >
                <Brain className="w-5 h-5 mr-1 text-indigo-600" />
                Quiz
              </Button>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-GB')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats */}
          <StatsCards hasWords={!!allItems.length} />

          {/* Main Content Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Today's Word Generation
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {allItems.length
                  ? "Here are your generated words and phrases for today"
                  : "Generate your daily professional content words"
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!allItems.length ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No words generated today
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Click the button below to generate AI-powered words tailored to your profession.
                  </p>
                </div>
              ) : null}

              {/* Phrases and Terms */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {allItems.map((item, index) => (
                  <PhraseCard key={index} item={item} />
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={allItems.length ? loadTodaysWords : handleGenerateWords}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : allItems.length ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Refresh Words
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Generate Words
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
