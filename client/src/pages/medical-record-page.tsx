import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MessageSquare, Save } from "lucide-react";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Schema for medical record
const medicalRecordSchema = z.object({
  patientId: z.number(),
  recordType: z.string(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

type MedicalRecordValues = z.infer<typeof medicalRecordSchema>;

export default function MedicalRecordPage() {
  const { patientId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("anamnesis");
  
  // Fetch patient details if patientId exists
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['/api/patients', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      
      // This would normally fetch the patient from the API
      // Placeholder: In a real implementation, use:
      // const res = await fetch(`/api/patients/${patientId}`);
      // return await res.json();
      
      return {
        id: parseInt(patientId),
        name: "Maria Oliveira",
        age: 28,
        email: "maria.oliveira@email.com",
        phone: "(11) 98765-1234",
        profession: "Analista de Marketing",
        status: "active",
        objective: "Emagrecimento",
        medicalHistory: {
          chronicDiseases: ["Hipertensão"],
          allergies: "",
          notes: "Paciente relata dificuldade em manter rotina alimentar devido à carga horária de trabalho."
        },
        anthropometry: {
          weight: 65.5,
          height: 168,
          bmi: 23.2,
          bodyFat: 28
        }
      };
    },
    enabled: !!patientId
  });
  
  // Fetch medical records for this patient
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['/api/medical-records/patient', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      // This would normally fetch the medical records from the API
      // In a real implementation, use:
      // const res = await fetch(`/api/medical-records/patient/${patientId}`);
      // return await res.json();
      
      return [
        {
          id: 1,
          patientId: parseInt(patientId),
          date: new Date().toISOString(),
          recordType: "anamnesis",
          content: JSON.stringify({
            personalInfo: {
              birthDate: "1995-05-15",
              profession: "Analista de Marketing",
              objective: "Emagrecimento"
            },
            healthHistory: {
              chronicDiseases: ["Hipertensão"],
              allergies: "",
              notes: "Paciente relata dificuldade em manter rotina alimentar devido à carga horária de trabalho."
            },
            anthropometry: {
              weight: 65.5,
              height: 168,
              bmi: 23.2,
              bodyFat: 28
            }
          })
        }
      ];
    },
    enabled: !!patientId
  });
  
  // Form for medical record
  const form = useForm<MedicalRecordValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: patientId ? parseInt(patientId) : 0,
      recordType: activeTab,
      content: '',
    },
  });
  
  // Update form values when tab changes
  useState(() => {
    form.setValue('recordType', activeTab);
  });
  
  // Create medical record mutation
  const createMedicalRecord = useMutation({
    mutationFn: async (data: MedicalRecordValues) => {
      const res = await apiRequest('POST', '/api/medical-records', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records/patient'] });
      toast({
        title: "Prontuário atualizado",
        description: "As informações foram salvas com sucesso",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: MedicalRecordValues) => {
    createMedicalRecord.mutate(data);
  };
  
  // Loading state
  if (!patientId) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Prontuário</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Selecione um paciente para visualizar o prontuário</p>
          </div>
        </header>
        
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum paciente selecionado</p>
            <Button onClick={() => navigate('/patients')}>
              Ver lista de pacientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoadingPatient) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Prontuário</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Histórico e evolução do paciente</p>
        </div>
      </header>

      {/* Patient Info Card */}
      {patient && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <span className="material-icons-round text-2xl">person</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium text-gray-800 dark:text-white">{patient.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{patient.age} anos · {patient.profession}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap md:ml-auto space-x-2">
                <Button variant="outline" asChild>
                  <a href={`/agenda`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar
                  </a>
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensagem
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={createMedicalRecord.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {createMedicalRecord.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Medical Record Tabs */}
      <Card>
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <Tabs 
            defaultValue="anamnesis" 
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              form.setValue('recordType', value);
            }}
          >
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent overflow-x-auto hide-scrollbar">
              <TabsTrigger 
                value="anamnesis" 
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 rounded-none"
              >
                Anamnese
              </TabsTrigger>
              <TabsTrigger 
                value="evolution" 
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 rounded-none"
              >
                Evolução
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 rounded-none"
              >
                Plano Nutricional
              </TabsTrigger>
              <TabsTrigger 
                value="exams" 
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 rounded-none"
              >
                Exames
              </TabsTrigger>
              <TabsTrigger 
                value="attachments" 
                className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 rounded-none"
              >
                Anexos
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Content - Anamnese */}
            <TabsContent value="anamnesis" className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Informações Pessoais</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data de Nascimento
                      </label>
                      <Input 
                        type="date" 
                        defaultValue={patient?.medicalHistory?.birthDate || "1995-05-15"}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Profissão
                      </label>
                      <Input 
                        type="text" 
                        defaultValue={patient?.profession || ""}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Objetivo
                      </label>
                      <Select defaultValue={patient?.objective || "emagrecimento"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um objetivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                          <SelectItem value="ganho-massa">Ganho de massa</SelectItem>
                          <SelectItem value="saude-geral">Saúde geral</SelectItem>
                          <SelectItem value="restricoes">Restrições alimentares</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Histórico de Saúde</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Doenças Crônicas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="diabetes" />
                          <label htmlFor="diabetes" className="text-sm text-gray-700 dark:text-gray-300">Diabetes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="hipertensao" defaultChecked={patient?.medicalHistory?.chronicDiseases?.includes('Hipertensão')} />
                          <label htmlFor="hipertensao" className="text-sm text-gray-700 dark:text-gray-300">Hipertensão</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="colesterol" />
                          <label htmlFor="colesterol" className="text-sm text-gray-700 dark:text-gray-300">Colesterol alto</label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alergias Alimentares
                      </label>
                      <Input 
                        placeholder="Ex: amendoim, frutos do mar..." 
                        defaultValue={patient?.medicalHistory?.allergies || ""}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Observações
                      </label>
                      <Textarea 
                        rows={3} 
                        defaultValue={patient?.medicalHistory?.notes || ""}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Avaliação Antropométrica</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Peso (kg)
                    </label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      defaultValue={patient?.anthropometry?.weight || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Altura (cm)
                    </label>
                    <Input 
                      type="number" 
                      defaultValue={patient?.anthropometry?.height || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IMC
                    </label>
                    <Input 
                      type="number" 
                      disabled 
                      value={patient?.anthropometry?.bmi || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      % de Gordura
                    </label>
                    <Input 
                      type="number" 
                      defaultValue={patient?.anthropometry?.bodyFat || ""}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab Content - Evolução */}
            <TabsContent value="evolution" className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Evolução Clínica</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data da Consulta
                      </label>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Observações
                      </label>
                      <Textarea 
                        rows={6} 
                        placeholder="Registre aqui as observações da consulta atual..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Histórico de Evoluções</h3>
                  
                  {isLoadingRecords ? (
                    <div className="py-4 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    medicalRecords && medicalRecords.filter(record => record.recordType === 'evolution').length > 0 ? (
                      <div className="space-y-3">
                        {medicalRecords
                          .filter(record => record.recordType === 'evolution')
                          .map((record, index) => (
                            <div key={record.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {new Date(record.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {record.content}
                              </p>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                        Nenhum registro de evolução encontrado.
                      </p>
                    )
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Tab Content - Plano Nutricional */}
            <TabsContent value="plan" className="p-4 md:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Plano Nutricional</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data do Plano
                      </label>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Plano
                      </label>
                      <Select defaultValue="emagrecimento">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de plano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                          <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                          <SelectItem value="restricao">Restrição Alimentar</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diretrizes Gerais
                    </label>
                    <Textarea 
                      rows={3} 
                      placeholder="Orientações gerais para o paciente..."
                    />
                  </div>
                </div>
                
                {/* Refeições */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white">Refeições</h3>
                  
                  {['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'].map((meal, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{meal}</h4>
                      <Textarea 
                        rows={3} 
                        placeholder={`Alimentos recomendados para ${meal.toLowerCase()}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Tab Content - Exames */}
            <TabsContent value="exams" className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Exames</h3>
                  <Button variant="outline" size="sm">
                    <span className="material-icons-round text-sm mr-1">add</span>
                    Adicionar Exame
                  </Button>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo de Exame
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Resultado
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          Nenhum exame registrado
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab Content - Anexos */}
            <TabsContent value="attachments" className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Anexos</h3>
                  <Button variant="outline" size="sm">
                    <span className="material-icons-round text-sm mr-1">add</span>
                    Upload de Arquivo
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <span className="material-icons-round text-4xl text-gray-400 dark:text-gray-500 mb-2">file_upload</span>
                  <p className="text-gray-500 dark:text-gray-400">
                    Arraste e solte arquivos aqui ou clique no botão acima para fazer upload
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Formatos suportados: PDF, JPG, PNG (máx. 10MB)
                  </p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Nome do Arquivo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Data de Upload
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tamanho
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          Nenhum anexo encontrado
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
