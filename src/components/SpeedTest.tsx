import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { submitSpeedRecord, createComplaint } from "@/services/api";
import { Wifi, Download, Upload, Timer, AlertCircle } from "lucide-react";
import { useLibreSpeedTest } from "@/hooks/useLibreSpeedTest";

interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

const SpeedTest = () => {
  const [searchParams] = useSearchParams();
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<SpeedTestResult | null>(null);
  
  // Get email from URL parameters
  const email = searchParams.get('email') || '';
  const userId = searchParams.get('userId') || '';

  const [complaintEmail, setComplaintEmail] = useState("");
  const [apartmentNo, setApartmentNo] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    },
    (final) => {
      setIsRunningTest(false);
      // setTestResult({
      //   downloadMbps: parseFloat(final.download) || 0,
      //   uploadMbps: parseFloat(final.upload) || 0,
      //   pingMs: parseFloat(final.ping) || 0,
      // });
    }
  );

  const handleStartTest = () => {
    setTestResult(null);
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

  const submitComplaint = async () => {
    if (!complaintEmail || !apartmentNo || !complaintDescription) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields.",
      });
      return;
    }

    setIsSubmittingComplaint(true);

    try {
      await createComplaint({
        email: complaintEmail,
        appartmentNo: apartmentNo,
        description: complaintDescription,
      });

      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully!",
      });

      setComplaintEmail("");
      setApartmentNo("");
      setComplaintDescription("");
      setDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
      });
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-foreground">Internet Speed Test</h1>
              <p className="text-sm text-muted-foreground">Test your connection speed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        {!email && (
          <Card>
            <CardHeader>
              <CardTitle>Missing Email</CardTitle>
              <CardDescription>Email parameter is required to run the speed test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">Please provide an email parameter in the URL (e.g., ?email=user@example.com)</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Speed Test
            </CardTitle>
            <CardDescription>Click the button below to test your internet speed. Results will be saved automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button onClick={handleStartTest} disabled={isRunningTest || !email} size="lg" className="min-w-[200px]">
                {isRunningTest ? "Testing..." : "Start Speed Test"}
              </Button>
              {email && <p className="text-sm text-muted-foreground mt-2">Testing for: {email}</p>}
            </div>

            {isRunningTest && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="text-muted-foreground">Running speed test, please wait...</p>
              </div>
            )}

            {testResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 border rounded-lg bg-card">
                  <Download className="h-10 w-10 mx-auto mb-3 text-green-500" />
                  <div className="text-3xl font-bold">{testResult.downloadMbps.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Mbps Download</div>
                </div>
                <div className="text-center p-6 border rounded-lg bg-card">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-blue-500" />
                  <div className="text-3xl font-bold">{testResult.uploadMbps.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Mbps Upload</div>
                </div>
                <div className="text-center p-6 border rounded-lg bg-card">
                  <Timer className="h-10 w-10 mx-auto mb-3 text-orange-500" />
                  <div className="text-3xl font-bold">{testResult.pingMs.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">ms Ping</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Report Internet Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Report an Internet Issue</DialogTitle>
                <DialogDescription>Describe the internet connectivity issue you're experiencing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint-email">Email Address</Label>
                  <Input
                    id="complaint-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={complaintEmail}
                    onChange={(e) => setComplaintEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-apartment">Apartment Number</Label>
                  <Input
                    id="complaint-apartment"
                    placeholder="B1-102"
                    value={apartmentNo}
                    onChange={(e) => setApartmentNo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-description">Issue Description</Label>
                  <Textarea
                    id="complaint-description"
                    placeholder="WiFi speed is too slow during the evening hours..."
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={submitComplaint} disabled={isSubmittingComplaint} className="w-full">
                  {isSubmittingComplaint ? "Submitting..." : "Submit Complaint"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default SpeedTest;
