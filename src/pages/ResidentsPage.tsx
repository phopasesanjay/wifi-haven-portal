import { useState, useEffect } from "react";
import { Search, Send, UserIcon, Mail, Wifi, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, sendEmailToUser, ApiError } from "@/services/api";
import type { User } from "@/types/api";

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
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sendingEmails, setSendingEmails] = useState(false);
  const { toast } = useToast();
  
  const itemsPerPage = 10;

  // Convert API User to Resident format
  const convertUserToResident = (user: User): Resident => ({
    id: user.userUId,
    name: `${user.firstName} ${user.lastName}`,
    apartmentNo: user.apartmentNo,
    email: user.email,
    routerId: `RT-${user.apartmentNo}-${user.userUId.slice(-3)}`,
    lastSpeedTest: null // API doesn't provide this yet
  });

  // Load residents from API
  useEffect(() => {
    const loadResidents = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers({
          page: currentPage,
          pageSize: itemsPerPage
        });
        
        const convertedResidents = response.data.map(convertUserToResident);
        setResidents(convertedResidents);
        setTotalItems(response.data.length); // Adjust based on actual total from API
      } catch (error) {
        console.error('Failed to load residents:', error);
        toast({
          title: "Error loading residents",
          description: "Failed to fetch residents from server. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadResidents();
  }, [currentPage, toast]);

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.apartmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedResidents = searchTerm ? filteredResidents : residents;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResidents(paginatedResidents.map(r => r.id));
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

  const handleSendSpeedTestLinks = async () => {
    const selectedCount = selectedResidents.length;
    if (selectedCount === 0) {
      toast({
        title: "No residents selected",
        description: "Please select at least one resident to send speed test links.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSendingEmails(true);
      
      // Get selected resident emails
      const selectedEmails = residents
        .filter(resident => selectedResidents.includes(resident.id))
        .map(resident => resident.email);

      await sendEmailToUser(selectedEmails);
      
      toast({
        title: "Speed test links sent!",
        description: `Successfully sent speed test links to ${selectedCount} resident${selectedCount > 1 ? 's' : ''}.`,
      });
      
      setSelectedResidents([]);
    } catch (error) {
      console.error('Failed to send emails:', error);
      toast({
        title: "Failed to send emails",
        description: error instanceof ApiError ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSendingEmails(false);
    }
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
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-md"
        />
        
        <Button 
          variant="sage" 
          onClick={handleSendSpeedTestLinks}
          disabled={selectedResidents.length === 0 || sendingEmails}
        >
          <Send className="w-4 h-4 mr-2" />
          {sendingEmails ? "Sending..." : `Send Speed Test Link (${selectedResidents.length})`}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading residents...</p>
        </div>
      )}

      {/* Residents Grid */}
      {!loading && (
        <div className="grid gap-4">
        {/* Select All Header */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedResidents.length === paginatedResidents.length && paginatedResidents.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-muted-foreground">
                Select All ({paginatedResidents.length} residents on this page)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Residents List */}
        {paginatedResidents.map((resident) => (
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
                    <UserIcon className="w-6 h-6 text-white" />
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
        
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        </div>
      )}

      {!loading && filteredResidents.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No residents found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "No residents match the current filter"}
          </p>
        </div>
      )}
    </div>
  );
}