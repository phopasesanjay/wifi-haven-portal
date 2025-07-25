import { useState } from "react";
import { Search, Send, User, Mail, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Resident {
  id: string;
  name: string;
  apartmentNo: string;
  email: string;
  routerId: string;
  lastSpeedTest: string | null;
}

const mockResidents: Resident[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    apartmentNo: "12A",
    email: "sarah.johnson@email.com",
    routerId: "RT-12A-001",
    lastSpeedTest: "2024-01-18"
  },
  {
    id: "2",
    name: "Mike Chen",
    apartmentNo: "08B",
    email: "mike.chen@email.com",
    routerId: "RT-08B-002",
    lastSpeedTest: null
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    apartmentNo: "15C",
    email: "emma.rodriguez@email.com",
    routerId: "RT-15C-003",
    lastSpeedTest: "2024-01-15"
  },
  {
    id: "4",
    name: "David Park",
    apartmentNo: "05A",
    email: "david.park@email.com",
    routerId: "RT-05A-004",
    lastSpeedTest: "2024-01-10"
  },
  {
    id: "5",
    name: "Lisa Wang",
    apartmentNo: "22B",
    email: "lisa.wang@email.com",
    routerId: "RT-22B-005",
    lastSpeedTest: "2024-01-20"
  }
];

export default function ResidentsPage() {
  const [residents] = useState<Resident[]>(mockResidents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apartmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResidents(filteredResidents.map(r => r.id));
    } else {
      setSelectedResidents([]);
    }
  };

  const handleSelectResident = (residentId: string, checked: boolean) => {
    if (checked) {
      setSelectedResidents(prev => [...prev, residentId]);
    } else {
      setSelectedResidents(prev => prev.filter(id => id !== residentId));
    }
  };

  const handleSendSpeedTestLinks = () => {
    const selectedCount = selectedResidents.length;
    if (selectedCount === 0) {
      toast({
        title: "No residents selected",
        description: "Please select at least one resident to send speed test links.",
        variant: "destructive"
      });
      return;
    }

    // Simulate sending emails
    toast({
      title: "Speed test links sent!",
      description: `Successfully sent speed test links to ${selectedCount} resident${selectedCount > 1 ? 's' : ''}.`,
    });
    
    setSelectedResidents([]);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Resident Management</h1>
        <p className="text-muted-foreground">Manage residents and send WiFi speed test links</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <Input
          placeholder="Search residents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        
        <Button 
          variant="sage" 
          onClick={handleSendSpeedTestLinks}
          disabled={selectedResidents.length === 0}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Speed Test Link ({selectedResidents.length})
        </Button>
      </div>

      {/* Residents Grid */}
      <div className="grid gap-4">
        {/* Select All Header */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedResidents.length === filteredResidents.length && filteredResidents.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-muted-foreground">
                Select All ({filteredResidents.length} residents)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Residents List */}
        {filteredResidents.map((resident) => (
          <Card 
            key={resident.id} 
            className={`transition-all duration-200 hover:shadow-soft-md ${
              selectedResidents.includes(resident.id) ? "ring-2 ring-sage bg-sage-light/20" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedResidents.includes(resident.id)}
                    onCheckedChange={(checked) => handleSelectResident(resident.id, checked as boolean)}
                  />
                  
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-foreground">{resident.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-sky rounded-full"></div>
                        Apt {resident.apartmentNo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {resident.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        {resident.routerId}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Last Speed Test</div>
                  {resident.lastSpeedTest ? (
                    <Badge variant="secondary">
                      {new Date(resident.lastSpeedTest).toLocaleDateString()}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Never tested</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResidents.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No residents found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "No residents match the current filter"}
          </p>
        </div>
      )}
    </div>
  );
}