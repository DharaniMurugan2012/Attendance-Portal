
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getCurrentDate } from '@/utils/dateUtils';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AttendanceFormProps {
  onManualSubmit: (date: string, inTime: string, outTime: string, status: 'present' | 'absent' | 'half-day') => void;
  attendanceStatus: 'not_started' | 'in_progress' | 'completed';
  lastInTime: string | null;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onManualSubmit,
  attendanceStatus,
  lastInTime
}) => {
  const { state } = useAuth();
  const currentDate = getCurrentDate();
  
  const form = useForm({
    defaultValues: {
      date: currentDate,
      inTime: lastInTime?.substring(0, 5) || '',
      outTime: '',
      status: 'present' as 'present' | 'absent' | 'half-day'
    }
  });
  
  const handleManualSubmit = (data: { date: string; inTime: string; outTime: string; status: 'present' | 'absent' | 'half-day' }) => {
    onManualSubmit(data.date, `${data.inTime}:00`, `${data.outTime}:00`, data.status);
    // Reset form
    form.reset({
      date: data.date,
      inTime: '',
      outTime: '',
      status: 'present'
    });
    toast.success('Attendance recorded successfully!');
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center">
          <Clock className="mr-2 h-5 w-5 text-attendance-primary" />
          Record Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                      disabled={form.watch('status') === 'absent'}
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
                      disabled={form.watch('status') === 'absent'}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit">Submit Attendance</Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-gray-500 text-center w-full">
          {attendanceStatus === 'completed' 
            ? "You've already recorded attendance for today." 
            : "Record your daily attendance by filling the form above."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default AttendanceForm;
