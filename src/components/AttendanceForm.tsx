
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getCurrentDate, getCurrentTime } from '@/utils/dateUtils';
import { Clock } from 'lucide-react';

interface AttendanceFormProps {
  onClockIn: (inTime: string) => void;
  onClockOut: (outTime: string) => void;
  attendanceStatus: 'not_started' | 'in_progress' | 'completed';
  lastInTime: string | null;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onClockIn,
  onClockOut,
  attendanceStatus,
  lastInTime
}) => {
  const { state } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const currentDate = getCurrentDate();
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  const handleClockIn = () => {
    const time = getCurrentTime();
    onClockIn(time);
    toast.success('You have clocked in successfully!');
  };
  
  const handleClockOut = () => {
    const time = getCurrentTime();
    onClockOut(time);
    toast.success('You have clocked out successfully!');
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center">
          <Clock className="mr-2 h-5 w-5 text-attendance-primary" />
          Today's Attendance
        </CardTitle>
        <CardDescription>
          Date: {currentDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-36 h-36 rounded-full border-4 border-attendance-primary flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Time</p>
                <p className="text-3xl font-bold text-attendance-dark">
                  {currentTime.substring(0, 5)}
                </p>
              </div>
            </div>
            {attendanceStatus === 'in_progress' && (
              <div className="absolute inset-0 rounded-full border-4 border-attendance-secondary animate-pulse-ring"></div>
            )}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${
              attendanceStatus === 'completed' 
                ? 'text-attendance-secondary' 
                : attendanceStatus === 'in_progress' 
                  ? 'text-attendance-accent'
                  : 'text-gray-700'
            }`}>
              {attendanceStatus === 'not_started' 
                ? 'Not Started' 
                : attendanceStatus === 'in_progress' 
                  ? 'In Progress'
                  : 'Completed'}
            </span>
          </div>
          
          {lastInTime && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Clock In Time:</span>
              <span className="font-medium">{lastInTime.substring(0, 5)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        {attendanceStatus === 'not_started' ? (
          <Button 
            onClick={handleClockIn} 
            className="bg-attendance-primary hover:bg-attendance-primary/90"
          >
            Clock In
          </Button>
        ) : attendanceStatus === 'in_progress' ? (
          <Button 
            onClick={handleClockOut} 
            className="bg-attendance-secondary hover:bg-attendance-secondary/90"
          >
            Clock Out
          </Button>
        ) : (
          <p className="text-sm text-gray-600">
            You have completed your attendance for today
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AttendanceForm;
