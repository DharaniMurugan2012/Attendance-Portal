
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getCurrentDate, getCurrentTime } from '@/utils/dateUtils';
import { Clock, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AttendanceFormProps {
  onClockIn: (inTime: string) => void;
  onClockOut: (outTime: string) => void;
  onManualSubmit: (date: string, inTime: string, outTime: string, status: 'present' | 'absent' | 'half-day') => void;
  attendanceStatus: 'not_started' | 'in_progress' | 'completed';
  lastInTime: string | null;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onClockIn,
  onClockOut,
  onManualSubmit,
  attendanceStatus,
  lastInTime
}) => {
  const { state } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const currentDate = getCurrentDate();
  const [isManualMode, setIsManualMode] = useState(false);
  
  const form = useForm({
    defaultValues: {
      date: currentDate,
      inTime: lastInTime?.substring(0, 5) || '',
      outTime: '',
      status: 'present' as 'present' | 'absent' | 'half-day'
    }
  });
  
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
  
  const handleManualSubmit = (data: { date: string; inTime: string; outTime: string; status: 'present' | 'absent' | 'half-day' }) => {
    onManualSubmit(data.date, `${data.inTime}:00`, `${data.outTime}:00`, data.status);
    setIsManualMode(false);
    toast.success('Attendance recorded successfully!');
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
        {isManualMode ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleManualSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="inTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clock In Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        placeholder="09:00" 
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="outTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clock Out Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        placeholder="17:00" 
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Attendance Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="present" />
                          </FormControl>
                          <FormLabel className="font-normal">Present</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="half-day" />
                          </FormControl>
                          <FormLabel className="font-normal">Half-day</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="absent" />
                          </FormControl>
                          <FormLabel className="font-normal">Absent</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsManualMode(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        {!isManualMode && (
          <>
            {attendanceStatus === 'not_started' ? (
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={handleClockIn} 
                  className="bg-attendance-primary hover:bg-attendance-primary/90"
                >
                  <CheckCheck className="mr-2 h-4 w-4" /> Clock In
                </Button>
                <Button 
                  onClick={() => setIsManualMode(true)} 
                  variant="outline"
                  className="text-sm"
                >
                  Enter Attendance Manually
                </Button>
              </div>
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
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default AttendanceForm;
