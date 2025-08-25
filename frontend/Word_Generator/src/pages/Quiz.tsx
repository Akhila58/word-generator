import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getQuiz } from "@/lib/api";
import { FloatingSidebar } from "@/components/ui/floating-sidebar";

interface Question {
  Question: string;
  Type: "Blank" | "MCQ";
  Options?: string[];
  Answer: string;
}

const Quiz = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [blankAnswer, setBlankAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showCurrentAnswer, setShowCurrentAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    loadQuiz();
  }, [navigate]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await getQuiz();
      console.log("Raw quiz data from API:", quizData);
      
      // Check if quizData is a string (JSON string) and needs parsing
      let parsedQuizData;
      if (typeof quizData === 'string') {
        try {
          parsedQuizData = JSON.parse(quizData);
        } catch (parseError) {
          console.error("Failed to parse quiz JSON:", parseError);
          throw new Error("Invalid quiz data format");
        }
      } else {
        parsedQuizData = quizData;
      }
      
      console.log("Parsed quiz data:", parsedQuizData);
      
      if (parsedQuizData && Array.isArray(parsedQuizData) && parsedQuizData.length > 0) {
        setQuestions(parsedQuizData);
        setUserAnswers(new Array(parsedQuizData.length).fill(""));
      } else {
        throw new Error("No quiz data available");
      }
    } catch (error) {
      console.error("Get quiz error:", error);
      toast({
        title: "Failed to load quiz",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!questions[currentQuestion]) {
      toast({
        title: "Error",
        description: "Question not found",
        variant: "destructive",
      });
      return;
    }
    
    const currentAnswer = questions[currentQuestion].Type === "MCQ" ? selectedOption : blankAnswer;

    if (!currentAnswer.trim()) {
      toast({
        title: "Please answer the question",
        description: "You must provide an answer before proceeding",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = currentAnswer;
    setUserAnswers(newAnswers);

    if (currentQuestion === questions.length - 1) {
      calculateScore(newAnswers);
      setShowResults(true);
    } else {
      // Show the correct answer before moving to next question
      setShowCurrentAnswer(true);
    }
  };

  const handleContinue = () => {
    setShowCurrentAnswer(false);
    setCurrentQuestion(currentQuestion + 1);
    setSelectedOption("");
    setBlankAnswer("");
  };

  const calculateScore = (answers: string[]) => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer.toLowerCase().trim() === questions[index].Answer.toLowerCase().trim()) {
        correct++;
      }
    });
    setScore(correct);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers(new Array(questions.length).fill(""));
    setSelectedOption("");
    setBlankAnswer("");
    setShowResults(false);
    setShowAnswers(false);
    setShowCurrentAnswer(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <FloatingSidebar currentPath="/quiz" />
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        <FloatingSidebar currentPath="/quiz" />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-24 relative z-10">
          <Card className="shadow-2xl border border-white/30 bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-foreground">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {score}/{questions.length}
              </div>
              <p className="text-muted-foreground">
                You scored {Math.round((score / questions.length) * 100)}%
              </p>
              
              <Button 
                onClick={() => setShowAnswers(!showAnswers)}
                variant="outline"
                className="w-full max-w-md"
              >
                {showAnswers ? "Hide Answers" : "Show Answers"}
              </Button>

              {showAnswers && (
                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-semibold text-center">Question Review</h3>
                  {questions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer.toLowerCase().trim() === question.Answer.toLowerCase().trim();
                    
                    return (
                      <Card key={index} className={`p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-1">
                              {isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Question {index + 1}:</p>
                              <p className="text-sm">{question.Question}</p>
                              
                              {question.Type === "MCQ" && question.Options && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">Options:</p>
                                  {question.Options.map((option, optIndex) => (
                                    <p key={optIndex} className="text-xs text-muted-foreground ml-2">
                                      • {option}
                                    </p>
                                  ))}
                                </div>
                              )}
                              
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Your answer:</p>
                                <p className="text-sm">{userAnswer || "No answer provided"}</p>
                              </div>
                              
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Correct answer:</p>
                                <p className="text-sm font-medium text-green-700">{question.Answer}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button onClick={restartQuiz} className="px-8">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart Quiz
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <FloatingSidebar currentPath="/quiz" />
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No quiz questions available</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <FloatingSidebar currentPath="/quiz" />
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Error loading question</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      <FloatingSidebar currentPath="/quiz" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="bg-white/60 backdrop-blur-xl border-b border-white/30 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pl-24">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Knowledge Quiz</h1>
                <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
                className="text-purple-600 hover:text-purple-900 hover:bg-purple-50"
              >
                History
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-24 relative z-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="shadow-2xl border border-white/30 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                {currentQ.Question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentQ.Type === "MCQ" ? (
                <div className="space-y-3">
                  {currentQ.Options?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedOption === option
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border bg-white/50 hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedOption(option)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedOption === option && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-foreground">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Fill in the blank:
                  </label>
                  <Input
                    value={blankAnswer}
                    onChange={(e) => setBlankAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="text-lg p-4 bg-white/70 border-border focus:border-primary"
                  />
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(currentQuestion - 1);
                      setSelectedOption(userAnswers[currentQuestion - 1] || "");
                      setBlankAnswer(userAnswers[currentQuestion - 1] || "");
                    }
                  }}
                  disabled={currentQuestion === 0 || showCurrentAnswer}
                >
                  Previous
                </Button>

                <Button
                  onClick={showCurrentAnswer ? handleContinue : handleNext}
                  className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish Quiz' : (showCurrentAnswer ? 'Continue' : 'Submit Answer')}
                </Button>
              </div>

              {showCurrentAnswer && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="font-medium text-green-800">Correct Answer:</p>
                        <p className="text-green-700">{currentQ.Answer}</p>
                        {currentQ.Type === "MCQ" && currentQ.Options && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-green-600">All options:</p>
                            {currentQ.Options.map((option, optIndex) => (
                              <p key={optIndex} className="text-xs text-green-600 ml-2">
                                • {option}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
