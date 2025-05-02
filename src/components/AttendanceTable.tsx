
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceRecord } from '@/types';
import { formatDate, formatTime, getStatusColor } from '@/utils/dateUtils';
import { Badge } from "@/components/ui/badge";

interface AttendanceTableProps {
  data: AttendanceRecord[];
  isAdmin?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ 
  data,
  isAdmin = false 
}) => {
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption>
          {isAdmin 
            ? 'Comprehensive attendance records for all employees' 
            : 'Your attendance history'
          }
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {isAdmin && <TableHead>Name</TableHead>}
            {isAdmin && <TableHead>Email</TableHead>}
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{formatDate(record.date)}</TableCell>
              {isAdmin && <TableCell>{record.userName}</TableCell>}
              {isAdmin && <TableCell className="text-sm text-muted-foreground">{record.userEmail}</TableCell>}
              <TableCell>{record.inTime ? formatTime(record.inTime) : '-'}</TableCell>
              <TableCell>{record.outTime ? formatTime(record.outTime) : '-'}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getStatusColor(record.status)}`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
