
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, UserX, Mail, Phone } from 'lucide-react';
import { Home } from '@/services/residents';

export interface Resident {
  id: number;
  name: string;
  email: string;
  phone: string;
  unitNumber: string;
  moveInDate: string;
  status: 'active' | 'inactive';
  isOwner: boolean;
  home: Home;
}

interface ResidentsTableProps {
  residents: Resident[];
  onEdit: (resident: Resident) => void;
  onViewDetails: (resident: Resident) => void;
  onDeactivate: (resident: Resident) => void;
  onDelete: (resident: Resident) => void;
}

const ResidentsTable = ({ 
  residents,
  onEdit,
  onViewDetails,
  onDeactivate,
  onDelete
}: ResidentsTableProps) => {
  console.log('ResidentsTable received residents:', residents);
  if (residents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No residents found.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableCaption>A list of all residents in the property.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Home</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Move In</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {residents.map((resident) => (
          <TableRow key={resident.id}>
            <TableCell className="font-medium">{resident.name}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{resident.home.name}</span>
                <span className="text-sm text-muted-foreground">{resident.home.address}</span>
              </div>
            </TableCell>
            <TableCell>{resident.unitNumber}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-sm">
                  <Mail size={14} /> <span>{resident.email}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone size={14} /> <span>{resident.phone}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                resident.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {resident.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell>
              {resident.isOwner ? 'Owner' : 'Tenant'}
            </TableCell>
            <TableCell>{resident.moveInDate}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(resident)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(resident)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDeactivate(resident)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    {resident.status === 'active' ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={() => onDelete(resident)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ResidentsTable;
