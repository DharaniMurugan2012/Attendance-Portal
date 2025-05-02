import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/context/AuthContext';
import AttendanceForm from '@/components/AttendanceForm';
import AttendanceTable from '@/components/AttendanceTable';
import ExportButton from '@/components/ExportButton';
import { AttendanceRecord } from '@/types';
import { getCurrentDate } from '@/utils/dateUtils';

// Mock data for user attendance records
const generateUserAttendanceRecords = (userId: string, userName: string, userEmail: string): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const currentDate = new Date();
  
  // Generate past 15 days of records
  for (let i = 14; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    // Generate a random status biased towards 'present'
    const random = Math.random();
    let status: 'present' | 'absent' | 'half-day';
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
    
    // For today, if it's a weekday, check if we should add in-progress
    if (i === 0 && dayOfWeek !== 0 && dayOfWeek !== 6) {
      const now = new Date();
      const currentHour = now.getHours();
      
      // If between 8:00 and 17:00, we might have an in-progress record
      if (currentHour >= 8 && currentHour < 17) {
        const inHour = Math.min(currentHour - 1, 9);
        inTime = `0${inHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
        outTime = null;
        status = 'in-progress';
      }
    }
    
    records.push({
      id: `rec-${userId}-${dateStr}`,
      userId,
      userName,
      userEmail,
      date: dateStr,
      inTime,
      outTime,
      status,
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getCurrentDate());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);
  
  // Initialize user attendance records and today's record
  useEffect(() => {
    if (state.user) {
      const userRecords = generateUserAttendanceRecords(
        state.user.id, 
        state.user.name, 
        state.user.email
      );
      setAttendanceRecords(userRecords);
      
      const today = getCurrentDate();
      const record = userRecords.find(r => r.date === today);
      
      if (record) {
        setTodayRecord(record);
        if (record.outTime) {
          setAttendanceStatus('completed');
        } else if (record.inTime) {
          setAttendanceStatus('in_progress');
        } else {
          setAttendanceStatus('not_started');
        }
      }
    }
  }, [state.user]);
  
  // Update filtered records when date or all records change
  useEffect(() => {
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      setSelectedDateStr(dateStr);
      
      setFilteredRecords(
        attendanceRecords.filter(record => {
          const recordDate = new Date(record.date);
          const year = recordDate.getFullYear();
          const month = recordDate.getMonth();
          const day = recordDate.getDate();
          
          return year === date.getFullYear() && 
                 month === date.getMonth() && 
                 day === date.getDate();
        })
      );
    }
  }, [date, attendanceRecords]);
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };
  
  const handleClockIn = (inTime: string) => {
    const today = getCurrentDate();
    
    // Update or create today's record
    const newRecord: AttendanceRecord = {
      id: `rec-${state.user?.id}-${today}`,
      userId: state.user?.id || '',
      userName: state.user?.name || '',
      userEmail: state.user?.email || '',
      date: today,
      inTime,
      outTime: null,
      status: 'in-progress'
    };
    
    setTodayRecord(newRecord);
    setAttendanceStatus('in_progress');
    
    // Update attendance records
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRecord;
        return updated;
      } else {
        return [newRecord, ...prev];
      }
    });
  };
  
  const handleClockOut = (outTime: string) => {
    if (!todayRecord) return;
    
    const updatedRecord = {
      ...todayRecord,
      outTime,
      status: 'present' as const
    };
    
    setTodayRecord(updatedRecord);
    setAttendanceStatus('completed');
    
    // Update attendance records
    setAttendanceRecords(prev => {
      const today = getCurrentDate();
      const existingIdx = prev.findIndex(r => r.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = updatedRecord;
        return updated;
      }
      return prev;
    });
  };

  const handleManualSubmit = (date: string, inTime: string, outTime: string, status: 'present' | 'absent' | 'half-day') => {
    // Create a completed record with both in and out times
    const newRecord: AttendanceRecord = {
      id: `rec-${state.user?.id}-${date}`,
      userId: state.user?.id || '',
      userName: state.user?.name || '',
      userEmail: state.user?.email || '',
      date,
      inTime: status === 'absent' ? '' : inTime,
      outTime: status === 'absent' ? null : outTime,
      status
    };
    
    // If the date is today, update today's record
    const today = getCurrentDate();
    if (date === today) {
      setTodayRecord(newRecord);
      setAttendanceStatus('completed');
    }
    
    // Update attendance records
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.date === date);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRecord;
        return updated;
      } else {
        return [newRecord, ...prev].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Attendance Form */}
          <div className="md:col-span-1">
            <AttendanceForm 
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              onManualSubmit={handleManualSubmit}
              attendanceStatus={attendanceStatus}
              lastInTime={todayRecord?.inTime || null}
            />
          </div>
          
          {/* Right Column - Calendar and History */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>
                    View your attendance for a specific date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        className="border rounded-md p-3 pointer-events-auto"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Select a date'}
                        </h3>
                        <ExportButton data={filteredRecords} fileName="my_attendance" />
                      </div>
                      <div>
                        <AttendanceTable data={filteredRecords} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Attendance History</CardTitle>
                    <ExportButton data={attendanceRecords} fileName="all_attendance" />
                  </div>
                  <CardDescription>
                    Your complete attendance record
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendanceTable data={attendanceRecords} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
