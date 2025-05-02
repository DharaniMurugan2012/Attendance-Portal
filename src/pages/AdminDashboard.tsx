
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import AttendanceTable from '@/components/AttendanceTable';
import ExportButton from '@/components/ExportButton';
import { AttendanceRecord, User } from '@/types';
import { getCurrentDate } from '@/utils/dateUtils';
import { Search } from 'lucide-react';

// Mock data for all users
const MOCK_USERS: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user'
  },
  {
    id: 'user3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    role: 'user'
  },
  {
    id: 'user4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'user'
  },
  {
    id: 'user5',
    name: 'Robert Brown',
    email: 'robert@example.com',
    role: 'user'
  }
];

// Generate mock attendance data for all users
const generateAllAttendanceRecords = (): AttendanceRecord[] => {
  let allRecords: AttendanceRecord[] = [];
  
  MOCK_USERS.forEach(user => {
    // Generate past 30 days of records for each user
    const currentDate = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip weekends
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Generate a random status biased towards 'present'
      const random = Math.random();
      let status: 'present' | 'absent' | 'half-day' | 'in-progress';
      let inTime: string;
      let outTime: string | null;
      
      if (random < 0.85) { // 85% present
        status = 'present';
        // Random time between 8:30 and 9:30
        const inHour = 8 + Math.floor(Math.random() * 2);
        const inMinute = Math.floor(Math.random() * 60);
        inTime = `${inHour.toString().padStart(2, '0')}:${inMinute.toString().padStart(2, '0')}:00`;
        
        // Random time between 17:00 and 18:30
        const outHour = 17 + Math.floor(Math.random() * 2);
        const outMinute = Math.floor(Math.random() * 60);
        outTime = `${outHour.toString().padStart(2, '0')}:${outMinute.toString().padStart(2, '0')}:00`;
      } else if (random < 0.95) { // 10% half-day
        status = 'half-day';
        // Random time between 8:30 and 9:30
        const inHour = 8 + Math.floor(Math.random() * 2);
        const inMinute = Math.floor(Math.random() * 60);
        inTime = `${inHour.toString().padStart(2, '0')}:${inMinute.toString().padStart(2, '0')}:00`;
        
        // Half day out before 14:00
        const outHour = 12 + Math.floor(Math.random() * 2);
        const outMinute = Math.floor(Math.random() * 60);
        outTime = `${outHour.toString().padStart(2, '0')}:${outMinute.toString().padStart(2, '0')}:00`;
      } else { // 5% absent
        status = 'absent';
        inTime = '';
        outTime = null;
      }
      
      // For today, if it's a weekday, some users might have an in-progress record
      if (i === 0 && dayOfWeek !== 0 && dayOfWeek !== 6 && Math.random() > 0.3) {
        const now = new Date();
        const currentHour = now.getHours();
        
        // If between 8:00 and 17:00, we might have an in-progress record
        if (currentHour >= 8 && currentHour < 17 && Math.random() > 0.5) {
          const inHour = Math.min(currentHour - 1, 9);
          inTime = `0${inHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
          outTime = null;
          status = 'in-progress';
        }
      }
      
      allRecords.push({
        id: `rec-${user.id}-${dateStr}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        date: dateStr,
        inTime,
        outTime,
        status,
      });
    }
  });
  
  return allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getCurrentDate());
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!state.isAuthenticated || state.user?.role !== 'admin') {
      navigate('/');
    }
  }, [state.isAuthenticated, state.user?.role, navigate]);
  
  // Initialize attendance records
  useEffect(() => {
    const records = generateAllAttendanceRecords();
    setAllAttendanceRecords(records);
  }, []);
  
  // Filter records based on date, tab, and search query
  useEffect(() => {
    if (allAttendanceRecords.length === 0) return;
    
    let filtered = [...allAttendanceRecords];
    
    // Filter by date if on "daily" tab
    if (activeTab === 'daily' && date) {
      const dateStr = date.toISOString().split('T')[0];
      filtered = filtered.filter(record => record.date === dateStr);
    }
    
    // Filter by search query (if any)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.userName.toLowerCase().includes(query) || 
        record.userEmail.toLowerCase().includes(query)
      );
    }
    
    setFilteredRecords(filtered);
    
    if (date) {
      setSelectedDateStr(date.toISOString().split('T')[0]);
    }
  }, [date, allAttendanceRecords, activeTab, searchQuery]);
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Search employees..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle>All Attendance Records</CardTitle>
                  <ExportButton 
                    data={filteredRecords} 
                    fileName="all_employees_attendance" 
                  />
                </div>
                <CardDescription>
                  Complete attendance history for all employees
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <AttendanceTable data={filteredRecords} isAdmin={true} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="daily" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>
                    View attendance for a specific date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="border rounded-md p-3"
                  />
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Daily Attendance'}
                    </CardTitle>
                    <ExportButton 
                      data={filteredRecords} 
                      fileName={`attendance_${selectedDateStr}`} 
                    />
                  </div>
                  <CardDescription>
                    {filteredRecords.length} employees
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <AttendanceTable data={filteredRecords} isAdmin={true} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
