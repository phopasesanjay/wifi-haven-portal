import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { submitSpeedRecord, createComplaint } from '@/services/api';
import { Wifi, Download, Upload, Timer, AlertCircle } from 'lucide-react';

interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

const SpeedTestPage = () => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<SpeedTestResult | null>(null);
  const [email, setEmail] = useState('');
  const [apartmentNo, setApartmentNo] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const runSpeedTest = () => {
    setIsRunningTest(true);
    
    // Simulate speed test with realistic values
    setTimeout(() => {
      const mockResult: SpeedTestResult = {
        downloadMbps: Math.round((Math.random() * 100 + 20) * 10) / 10,
        uploadMbps: Math.round((Math.random() * 50 + 10) * 10) / 10,
        pingMs: Math.round(Math.random() * 30 + 5)
      };
      
      setTestResult(mockResult);
      setIsRunningTest(false);
    }, 3000);
  };

  const saveSpeedTestResult = async () => {
    if (!testResult || !email) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide your email and run a speed test first."
      });
      return;
    }

    try {
      await submitSpeedRecord({
        email,
        downloadMbps: testResult.downloadMbps,
        uploadMbps: testResult.uploadMbps,
        pingMs: testResult.pingMs
      });

      toast({
        title: "Success",
        description: "Speed test data saved successfully!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save speed test data. Please try again."
      });
    }
  };

  const submitComplaint = async () => {
    if (!email || !apartmentNo || !complaintDescription) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields."
      });
      return;
    }

    setIsSubmittingComplaint(true);
    
    try {
      await createComplaint({
        email,
        appartmentNo: apartmentNo,
        description: complaintDescription
      });

      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully!"
      });
      
      setComplaintDescription('');
      setDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit complaint. Please try again."
      });
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Internet Speed Test</h1>
        <p className="text-muted-foreground">Test your internet connection speed and report any issues</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Please provide your details to save test results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment">Apartment Number</Label>
              <Input
                id="apartment"
                placeholder="B1-102"
                value={apartmentNo}
                onChange={(e) => setApartmentNo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speed Test Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Speed Test
          </CardTitle>
          <CardDescription>Click the button below to test your internet speed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Button 
              onClick={runSpeedTest} 
              disabled={isRunningTest}
              size="lg"
              className="min-w-[200px]"
            >
              {isRunningTest ? 'Testing...' : 'Start Speed Test'}
            </Button>
          </div>

          {isRunningTest && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground">Running speed test, please wait...</p>
            </div>
          )}

          {testResult && !isRunningTest && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Download className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{testResult.downloadMbps}</div>
                <div className="text-sm text-muted-foreground">Mbps Download</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{testResult.uploadMbps}</div>
                <div className="text-sm text-muted-foreground">Mbps Upload</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Timer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{testResult.pingMs}</div>
                <div className="text-sm text-muted-foreground">ms Ping</div>
              </div>
            </div>
          )}

          {testResult && (
            <div className="flex justify-center">
              <Button onClick={saveSpeedTestResult} variant="outline">
                Save Test Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Issue Button */}
      <div className="text-center">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="lg" className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report an Issue</DialogTitle>
              <DialogDescription>
                Describe the internet connectivity issue you're experiencing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              <p className="text-sm text-muted-foreground">
                Make sure your email and apartment number are filled in above
              </p>
            </div>
            <DialogFooter>
              <Button 
                onClick={submitComplaint} 
                disabled={isSubmittingComplaint}
                className="w-full"
              >
                {isSubmittingComplaint ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SpeedTestPage;