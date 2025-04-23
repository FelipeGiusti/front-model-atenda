import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Calendar, Clock, DollarSign, Users, TrendingUp, PlusCircle, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("week"); // week, month, quarter
  
  // Mock data for demonstration
  const appointmentsData = [
    { day: "Seg", value: 3 },
    { day: "Ter", value: 7 },
    { day: "Qua", value: 5 },
    { day: "Qui", value: 8 },
    { day: "Sex", value: 12 },
    { day: "Sáb", value: 5 },
    { day: "Dom", value: 0 },
  ];
  
  const statusData = [
    { name: "Confirmados", value: 25, color: "hsl(var(--primary))" },
    { name: "Pendentes", value: 12, color: "hsl(53, 94%, 59%)" },
    { name: "Cancelados", value: 8, color: "hsl(347, 77%, 50%)" },
  ];
  
  // Fetch appointments for today
  const { data: todayAppointments, isLoading } = useQuery({
    queryKey: ["/api/appointments/date", new Date().toISOString().split("T")[0]],
    queryFn: async () => {
      // This would be replaced with actual data in a real implementation
      return [
        { id: 1, patientName: "Lucas Silva", time: "09:00", type: "Consulta inicial", status: "confirmed" },
        { id: 2, patientName: "Maria Oliveira", time: "10:30", type: "Retorno", status: "pending" },
        { id: 3, patientName: "João Paulo", time: "13:00", type: "Avaliação trimestral", status: "confirmed" },
        { id: 4, patientName: "Ana Beatriz", time: "14:30", type: "Retorno", status: "confirmed" },
      ];
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Visão geral do seu consultório</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button asChild>
            <Link href="/patients">
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo paciente
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/agenda">
              <CalendarCheck className="h-4 w-4 mr-2" />
              Agendar
            </Link>
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Atendimentos hoje</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {todayAppointments?.length || 0}
                </h3>
              </div>
              <div className="rounded-full p-2 bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+14.5% vs. semana passada</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receita do mês</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">R$ 4.250</h3>
              </div>
              <div className="rounded-full p-2 bg-green-50 dark:bg-gray-700 text-green-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+5.2% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lembretes enviados</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">42</h3>
              </div>
              <div className="rounded-full p-2 bg-amber-50 dark:bg-gray-700 text-amber-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-500 flex items-center">
              <span className="material-icons-round text-xs mr-1">trending_flat</span>
              <span>Mesmo que semana anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pacientes ativos</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">56</h3>
              </div>
              <div className="rounded-full p-2 bg-blue-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+3 novos esta semana</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Agendamentos</h3>
              <select 
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm p-2"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
                <option value="quarter">Último trimestre</option>
              </select>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis hide={true} />
                  <Tooltip 
                    formatter={(value) => [`${value} consultas`, 'Quantidade']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-8">
                {statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Appointments */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">
              Hoje ({todayAppointments?.length || 0} atendimentos)
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4 overflow-auto max-h-[320px] hide-scrollbar">
                {todayAppointments?.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className={`flex items-center p-3 rounded-lg border-l-4 ${
                      appointment.status === 'confirmed' ? 'bg-primary-50 dark:bg-gray-700 border-primary-500' : 
                      appointment.status === 'pending' ? 'bg-amber-50 dark:bg-gray-700 border-amber-500' :
                      'bg-red-50 dark:bg-gray-700 border-red-500'
                    }`}
                  >
                    <div className="flex-shrink-0 mr-3">
                      <span className="text-sm font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{appointment.patientName}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.type}</p>
                    </div>
                    <span className="material-icons-round text-primary-500">chevron_right</span>
                  </div>
                ))}
                
                {todayAppointments?.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum atendimento para hoje
                  </div>
                )}
              </div>
            )}
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/agenda">
                Ver agenda completa
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
