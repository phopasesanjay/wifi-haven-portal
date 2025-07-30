import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { submitSpeedRecord } from "@/services/api";
import { useLibreSpeedTest } from "@/hooks/useLibreSpeedTest";

interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

const MinimalSpeedTest = () => {
  const [searchParams] = useSearchParams();
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<SpeedTestResult | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Get email from URL parameters
  const email = searchParams.get('email') || '';
  const userId = searchParams.get('userId') || '';

  const { toast } = useToast();

  const runSpeedTest = useLibreSpeedTest(
    (update) => {
      const download = parseFloat(update.download) || 0;
      const upload = parseFloat(update.upload) || 0;
      const ping = parseFloat(update.ping) || 0;
      setTestResult({
        downloadMbps: download,
        uploadMbps: upload,
        pingMs: ping,
      });
      
      // Update progress based on test state
      if (update.download && !update.upload) {
        setProgress(33); // Download phase
      } else if (update.upload) {
        setProgress(66); // Upload phase
      } else {
        setProgress(10); // Initial phase
      }
    },
    (final) => {
      setProgress(100);
      setIsRunningTest(false);
    }
  );

  const handleStartTest = () => {
    setTestResult(null);
    setProgress(0);
    setIsRunningTest(true);
    runSpeedTest();
  };

  useEffect(() => {
    const autoSaveResult = async () => {
      if (!testResult || !email) {
        toast({
          variant: "destructive",
          title: "Missing Email",
          description: "Please provide your email to save test results.",
        });
        return;
      }

      try {
        await submitSpeedRecord({
          email,
          downloadMbps: testResult.downloadMbps,
          uploadMbps: testResult.uploadMbps,
          pingMs: testResult.pingMs,
        });

        toast({
          title: "Speed Test Saved",
          description: "Your speed test results have been automatically saved!",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Failed to save speed test data automatically.",
        });
      }
    };

    if (testResult && email && !isRunningTest) {
      autoSaveResult();
    }
  }, [testResult, email, toast, isRunningTest]);

  // Auto-start test when component mounts
  useEffect(() => {
    if (email) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        handleStartTest();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [email]);

  // Show error if no email
  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Missing Email</h1>
          <p className="text-muted-foreground">
            Please provide an email parameter in the URL (e.g., ?email=user@example.com)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8">
                 {isRunningTest ? (
           <>
             {/* Big Spinner */}
             <div className="flex justify-center mb-8">
               <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary"></div>
             </div>
             
             {/* Progress Bar */}
             <div className="w-full max-w-md mx-auto mb-6">
               <div className="w-full bg-gray-200 rounded-full h-3">
                 <div 
                   className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" 
                   style={{ width: `${progress}%` }}
                 ></div>
               </div>
               <div className="text-center mt-2">
                 <span className="text-sm text-muted-foreground">{progress}%</span>
               </div>
             </div>
             
             {/* Please Wait Text */}
             <h1 className="text-3xl font-bold text-foreground mb-4">Please Wait</h1>
             <p className="text-lg text-muted-foreground mb-2">
               Running speed test for: <span className="font-semibold text-primary">{email}</span>
             </p>
             <p className="text-sm text-muted-foreground">
               This will take a few moments...
             </p>
           </>
         ) : testResult ? (
           <>
             {/* Success State - Minimal */}
             <div className="text-green-500 text-6xl mb-4">✅</div>
             <h1 className="text-2xl font-bold text-foreground mb-2">Complete</h1>
             <p className="text-muted-foreground">
               You can now close this page
             </p>
           </>
         ) : (
          <>
            {/* Initial State */}
            <div className="text-blue-500 text-6xl mb-4">🔄</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Initializing</h1>
            <p className="text-muted-foreground">
              Preparing speed test...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MinimalSpeedTest; 