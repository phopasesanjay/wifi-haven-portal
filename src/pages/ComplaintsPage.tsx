import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { getAllComplaints, getAllUsers, ApiError } from "@/services/api";
import type { Complaint as ApiComplaint, User } from "@/types/api";

interface Complaint {
  id: string;
  residentName: string;
  apartmentNo: string;
  issue: string;
  status: "open" | "closed";
  dateCreated: string;
}

const mockComplaints: Complaint[] = [
  {
    id: "1",
    residentName: "Sarah Johnson",
    apartmentNo: "12A",
    issue: "WiFi speed is very slow in bedroom area",
    status: "open",
    dateCreated: "2024-01-20"
  },
  {
    id: "2", 
    residentName: "Mike Chen",
    apartmentNo: "08B",
    issue: "Intermittent connection drops during video calls",
    status: "open",
    dateCreated: "2024-01-19"
  },
  {
    id: "3",
    residentName: "Emma Rodriguez",
    apartmentNo: "15C",
    issue: "Unable to connect new smart TV to network",
    status: "closed",
    dateCreated: "2024-01-18"
  },
  {
    id: "4",
    residentName: "David Park",
    apartmentNo: "05A",
    issue: "Router keeps disconnecting every few hours",
    status: "open",
    dateCreated: "2024-01-17"
  }
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  
  const itemsPerPage = 10;

  // Convert API Complaint to local Complaint format
  const convertApiComplaintToLocal = (apiComplaint: ApiComplaint, users: User[]): Complaint => {
    const user = users.find(u => u.userUId === apiComplaint.userUId);
    return {
      id: apiComplaint.complaintUId,
      residentName: user ? `${user.firstName} ${user.lastName}` : 'Unknown Resident',
      apartmentNo: apiComplaint.appartmentNo,
      issue: apiComplaint.description,
      status: apiComplaint.isResolved ? "closed" : "open",
      dateCreated: apiComplaint.createdAt.split('T')[0] // Extract date part
    };
  };

  // Load data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch both complaints and users in parallel
        const [complaintsResponse, usersResponse] = await Promise.all([
          getAllComplaints({ page: currentPage, pageSize: itemsPerPage }),
          getAllUsers({ page: 1, pageSize: 1000 }) // Get all users for mapping
        ]);
        
        setUsers(usersResponse.data);
        
        const convertedComplaints = complaintsResponse.data.map(complaint => 
          convertApiComplaintToLocal(complaint, usersResponse.data)
        );
        
        setComplaints(convertedComplaints);
        setTotalItems(complaintsResponse.data.length);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error loading complaints",
          description: "Failed to fetch complaints from server. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, toast]);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.apartmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.issue.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && complaint.status === activeTab;
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedComplaints = searchTerm ? filteredComplaints : complaints;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleResolveComplaint = (id: string) => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === id 
          ? { ...complaint, status: "closed" as const }
          : complaint
      )
    );
    
    toast({
      title: "Complaint Resolved",
      description: "The complaint has been marked as resolved.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "open" ? (
      <AlertCircle className="w-4 h-4 text-warning" />
    ) : (
      <CheckCircle className="w-4 h-4 text-success" />
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Complaints Management</h1>
        <p className="text-muted-foreground">Track and resolve resident WiFi issues</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading complaints...</p>
        </div>
      )}

      {/* Search */}
      {!loading && (
        <div className="mb-6">
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      {/* Tabs */}
      {!loading && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
          <TabsTrigger value="open">
            Open ({complaints.filter(c => c.status === "open").length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({complaints.filter(c => c.status === "closed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {paginatedComplaints.map((complaint) => (
              <Card 
                key={complaint.id} 
                className={`transition-all duration-200 hover:shadow-soft-md ${
                  complaint.status === "open" ? "border-l-4 border-l-warning" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(complaint.status)}
                      <div>
                        <h3 className="font-medium text-foreground">{complaint.residentName}</h3>
                        <p className="text-sm text-muted-foreground">Apt {complaint.apartmentNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={complaint.status === "open" ? "secondary" : "outline"}>
                        {complaint.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4">{complaint.issue}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(complaint.dateCreated).toLocaleDateString()}
                    </span>
                    {complaint.status === "open" && (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleResolveComplaint(complaint.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
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
        </TabsContent>
        </Tabs>
      )}

      {!loading && filteredComplaints.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No complaints found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "No complaints match the current filter"}
          </p>
        </div>
      )}
    </div>
  );
}