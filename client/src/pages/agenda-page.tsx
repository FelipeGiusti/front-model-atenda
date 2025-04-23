import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { ChevronLeft, ChevronRight, CalendarPlus, Calendar as CalendarIcon } from 'lucide-react';

// Form schema for new appointment
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  date: z.date(),
  startTime: z.string().min(1, "Selecione um horário"),
  endTime: z.string().min(1, "Selecione um horário"),
  type: z.string().min(1, "Selecione um tipo"),
  status: z.string().min(1, "Selecione um status"),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function AgendaPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  
  // Format selected date for display
  const formattedDate = format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const formattedMonth = format(selectedDate, "MMMM yyyy", { locale: ptBR });
  
  // Generate time slots for the day view
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Start at 8 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });
  
  // Fetch patients for the appointment form
  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      // This would fetch actual patients in a real implementation
      return [
        { id: 1, name: 'Lucas Silva' },
        { id: 2, name: 'Maria Oliveira' },
        { id: 3, name: 'João Paulo' },
        { id: 4, name: 'Ana Beatriz' },
      ];
    }
  });
  
  // Fetch appointments for the selected date
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments/date', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      // This would fetch actual appointments in a real implementation
      return [
        { 
          id: 1, 
          patientId: 1,
          patientName: 'Lucas Silva',
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: '09:00',
          endTime: '10:00',
          type: 'Consulta inicial',
          status: 'confirmed',
          notes: ''
        },
        { 
          id: 2, 
          patientId: 2,
          patientName: 'Maria Oliveira',
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: '10:30',
          endTime: '11:30',
          type: 'Retorno',
          status: 'pending',
          notes: ''
        },
      ];
    }
  });
  
  // Setup form for new appointment
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '',
      date: selectedDate,
      startTime: '',
      endTime: '',
      type: 'initial',
      status: 'confirmed',
      notes: '',
    },
  });
  
  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      // Convert form data to API format
      const apiData = {
        patientId: parseInt(data.patientId),
        date: format(data.date, 'yyyy-MM-dd'),
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        status: data.status,
        notes: data.notes || '',
      };
      
      const res = await apiRequest('POST', '/api/appointments', apiData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/date'] });
      setShowAppointmentDialog(false);
      form.reset();
    },
  });
  
  // Navigation functions
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };
  
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Form submission handler
  const onSubmit = (data: AppointmentFormValues) => {
    createAppointment.mutate(data);
  };
  
  // Find appointment for a given time slot
  const getAppointmentForTime = (time: string) => {
    return appointments?.find(app => {
      const [hour] = time.split(':');
      const [appHour] = app.startTime.split(':');
      return appHour === hour;
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Agenda</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie seus agendamentos</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Novo agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um paciente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients?.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id.toString()}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                              <Input
                                type="date"
                                value={format(field.value, 'yyyy-MM-dd')}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Início</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fim</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo de consulta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="initial">Consulta inicial</SelectItem>
                              <SelectItem value="followup">Retorno</SelectItem>
                              <SelectItem value="assessment">Avaliação</SelectItem>
                              <SelectItem value="emergency">Emergência</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmado</SelectItem>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="canceled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações sobre a consulta..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAppointmentDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createAppointment.isPending}
                    >
                      {createAppointment.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <Button size="icon" variant="outline" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-medium text-gray-800 dark:text-white capitalize">
                {viewMode === 'day' ? formattedDate : formattedMonth}
              </h2>
              <Button size="icon" variant="outline" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="ml-4 text-sm h-9"
                onClick={goToToday}
              >
                Hoje
              </Button>
            </div>

            {/* View Options & Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-9">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  className="px-4 py-1 h-full rounded-none text-sm"
                  onClick={() => setViewMode('day')}
                >
                  Dia
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  className="px-4 py-1 h-full rounded-none text-sm"
                  onClick={() => setViewMode('week')}
                >
                  Semana
                </Button>
              </div>
              
              <Select defaultValue="all_professionals">
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_professionals">Todos os profissionais</SelectItem>
                  <SelectItem value={user?.id.toString() || ""}>
                    {user?.name || "Meu perfil"}
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all_patients">
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_patients">Todos os pacientes</SelectItem>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Calendar View */}
      {viewMode === 'day' ? (
        <Card>
          {/* Time column headers */}
          <div className="grid grid-cols-12 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-1 p-2 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm text-center">
              Hora
            </div>
            <div className="col-span-11 p-2 text-gray-700 dark:text-gray-300 font-medium text-center capitalize">
              {formattedDate}
            </div>
          </div>
          
          {/* Time slots */}
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            timeSlots.map((time) => {
              const appointment = getAppointmentForTime(time);
              return (
                <div key={time} className="grid grid-cols-12 border-b border-gray-200 dark:border-gray-700">
                  <div className="col-span-1 p-3 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm text-center">
                    {time}
                  </div>
                  <div className="col-span-11 p-1 min-h-[60px]">
                    {appointment && (
                      <div 
                        className={`appointment ${
                          appointment.status === 'confirmed' ? 'appointment-confirmed' : 
                          appointment.status === 'pending' ? 'appointment-pending' : 
                          'appointment-canceled'
                        }`}
                      >
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {appointment.patientName}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {appointment.type}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="md:col-span-5">
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Agendamentos do dia
                </h3>
                {appointments?.length ? (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          appointment.status === 'confirmed' ? 'bg-primary-50 dark:bg-gray-700 border-primary-500' : 
                          appointment.status === 'pending' ? 'bg-amber-50 dark:bg-gray-700 border-amber-500' :
                          'bg-red-50 dark:bg-gray-700 border-red-500'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{appointment.startTime}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{appointment.endTime}</span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {appointment.patientName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.type}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                    Nenhum agendamento para este dia
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Floating action button for new appointment */}
      <Button 
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg p-0"
        onClick={() => setShowAppointmentDialog(true)}
      >
        <CalendarPlus className="h-6 w-6" />
      </Button>
    </div>
  );
}
