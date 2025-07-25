import { useState } from "react";
import { Search, Send, Users, Wifi, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Resident {
  id: string;
  name: string;
  apartmentNo: string;
  email: string;
  routerId: string;
  status: "active" | "inactive";
  lastSpeedTest: string | null;
}

const mockResidents: Resident[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    apartmentNo: "12A",
    email: "sarah.johnson@email.com",
    routerId: "RT-12A-001",
    status: "active",
    lastSpeedTest: "2024-01-18"
  },
  {
    id: "2",
    name: "Mike Chen",
    apartmentNo: "08B",
    email: "mike.chen@email.com",
    routerId: "RT-08B-002",
    status: "active",
    lastSpeedTest: null
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    apartmentNo: "15C",
    email: "emma.rodriguez@email.com",
    routerId: "RT-15C-003",
    status: "active",
    lastSpeedTest: "2024-01-15"
  },
  {
    id: "4",
    name: "David Park",
    apartmentNo: "05A",
    email: "david.park@email.com",
    routerId: "RT-05A-004",
    status: "inactive",
    lastSpeedTest: "2024-01-10"
  },
  {
    id: "5",
    name: "Lisa Wang",
    apartmentNo: "22B",
    email: "lisa.wang@email.com",
    routerId: "RT-22B-005",
    status: "active",
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

  const stats = {
    total: residents.length,
    active: residents.filter(r => r.status === "active").length,
    testedRecently: residents.filter(r => r.lastSpeedTest && 
      new Date(r.lastSpeedTest) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Resident Management</h1>
        <p className="text-muted-foreground">Manage residents and send WiFi speed test links</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Tests</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky">{stats.testedRecently}</div>
            <p className="text-xs text-muted-foreground">Past 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search residents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          variant="sky" 
          onClick={handleSendSpeedTestLinks}
          disabled={selectedResidents.length === 0}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Speed Test Link ({selectedResidents.length})
        </Button>
      </div>

      {/* Residents Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedResidents.length === filteredResidents.length && filteredResidents.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Apartment</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Router ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Speed Test</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResidents.map((resident) => (
              <TableRow key={resident.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedResidents.includes(resident.id)}
                    onCheckedChange={(checked) => handleSelectResident(resident.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">{resident.name}</TableCell>
                <TableCell>{resident.apartmentNo}</TableCell>
                <TableCell className="text-muted-foreground">{resident.email}</TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{resident.routerId}</code>
                </TableCell>
                <TableCell>
                  <Badge variant={resident.status === "active" ? "secondary" : "outline"}>
                    {resident.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {resident.lastSpeedTest ? (
                    <span className="text-sm text-muted-foreground">
                      {new Date(resident.lastSpeedTest).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Never</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredResidents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No residents found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "No residents match the current filter"}
          </p>
        </div>
      )}
    </div>
  );
}