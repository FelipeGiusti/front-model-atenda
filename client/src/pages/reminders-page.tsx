import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MessageSquareShare, Edit, MoreVertical } from 'lucide-react';

// Form schema for WhatsApp template
const whatsappTemplateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
  timeBeforeAppointment: z.string(),
  status: z.string().default("active"),
  requestConfirmation: z.boolean().default(true),
  sendTime: z.string(),
});

type WhatsappTemplateValues = z.infer<typeof whatsappTemplateSchema>;

export default function RemindersPage() {
  const { toast } = useToast();
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  
  // Fetch WhatsApp templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/whatsapp-templates'],
    queryFn: async () => {
      // This would fetch actual templates from the API
      // In a real implementation, use:
      // const res = await fetch('/api/whatsapp-templates');
      // return await res.json();
      
      return [
        {
          id: 1,
          name: "Confirmação de consulta",
          message: "Olá {nome}, tudo bem?\n\nLembrete da sua consulta com Dra. Sofia Mendes amanhã ({data}) às {hora}.\n\nConfirme sua presença respondendo esta mensagem.\n\nDra. Sofia - Nutrição",
          timeBeforeAppointment: "1 day",
          status: "active",
          requestConfirmation: true,
          sendTime: "08:00",
          statistics: {
            sent: 42,
            confirmationRate: 85,
          }
        },
        {
          id: 2,
          name: "Retornos trimestrais",
          message: "Olá {nome}, tudo bem?\n\nPassando para lembrar da sua consulta de retorno agendada para {data} às {hora}.\n\nImportante trazer seus exames recentes.\n\nAté lá!\n\nDra. Sofia - Nutrição",
          timeBeforeAppointment: "1 week",
          status: "active",
          requestConfirmation: true,
          sendTime: "09:00",
          statistics: {
            sent: 18,
            confirmationRate: 72,
          }
        },
      ];
    }
  });
  
  // Setup form for new template
  const form = useForm<WhatsappTemplateValues>({
    resolver: zodResolver(whatsappTemplateSchema),
    defaultValues: {
      name: '',
      message: 'Olá {nome}, tudo bem?\n\nLembrete da sua consulta agendada para {data} às {hora}.\n\nAté breve!',
      timeBeforeAppointment: '1 day',
      status: 'active',
      requestConfirmation: true,
      sendTime: '08:00',
    },
  });
  
  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: WhatsappTemplateValues) => {
      const res = await apiRequest('POST', '/api/whatsapp-templates', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-templates'] });
      setShowNewTemplateForm(false);
      form.reset();
      toast({
        title: "Template criado",
        description: "O novo modelo de mensagem foi criado com sucesso",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: WhatsappTemplateValues) => {
    createTemplate.mutate(data);
  };
  
  // Insert tag into message
  const insertTag = (tag: string) => {
    const currentMessage = form.getValues('message');
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = currentMessage.substring(0, start) + tag + currentMessage.substring(end);
      form.setValue('message', newMessage);
      
      // Focus and set cursor position after the tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      form.setValue('message', currentMessage + tag);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Lembretes WhatsApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure lembretes automáticos</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowNewTemplateForm(!showNewTemplateForm)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo modelo
          </Button>
        </div>
      </header>

      {/* WhatsApp Configuration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <MessageSquareShare className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <h2 className="text-xl font-medium text-gray-800 dark:text-white">Integração WhatsApp</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Conecte sua conta para enviar mensagens automáticas</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800 dark:text-white">Status da conexão</h3>
                  <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Ativo
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conta vinculada: +55 11 98765-4321</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-3">Configurações</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Horário para envio
                    </label>
                    <Input
                      type="time"
                      defaultValue="08:00"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Horário em que os lembretes serão enviados</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirmation-request" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Solicitar confirmação
                      </Label>
                      <Switch id="confirmation-request" defaultChecked />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inclui botões de "Confirmar" e "Remarcar"</p>
                  </div>
                </div>
              </div>
            </div>
            
            {showNewTemplateForm && (
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 dark:text-white mb-3">Template de mensagem</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do template</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Confirmação de consulta"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mb-3">
                      <FormField
                        control={form.control}
                        name="timeBeforeAppointment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quando enviar</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione quando enviar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1 day">1 dia antes</SelectItem>
                                <SelectItem value="2 days">2 dias antes</SelectItem>
                                <SelectItem value="3 days">3 dias antes</SelectItem>
                                <SelectItem value="1 week">1 semana antes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto da mensagem</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={6}
                                placeholder="Escreva sua mensagem aqui..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="text-xs" 
                        size="sm"
                        onClick={() => insertTag('{nome}')}
                      >
                        {'{nome}'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="text-xs" 
                        size="sm"
                        onClick={() => insertTag('{data}')}
                      >
                        {'{data}'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="text-xs" 
                        size="sm"
                        onClick={() => insertTag('{hora}')}
                      >
                        {'{hora}'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="text-xs" 
                        size="sm"
                        onClick={() => insertTag('{tipo}')}
                      >
                        {'{tipo}'}
                      </Button>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button 
                        type="submit"
                        disabled={createTemplate.isPending}
                      >
                        {createTemplate.isPending ? "Salvando..." : "Salvar template"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
            
            {!showNewTemplateForm && (
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 dark:text-white mb-3">Dicas para usar o WhatsApp</h3>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">1.</span> Personalize suas mensagens com o nome do paciente usando a tag {'{nome}'}.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">2.</span> Use as tags {'{data}'} e {'{hora}'} para incluir automaticamente detalhes da consulta.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">3.</span> Crie templates diferentes para diferentes tipos de consulta.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">4.</span> Mantenha suas mensagens concisas e diretas para melhor engajamento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Active Templates */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-4">Templates ativos</h2>
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Antecedência
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estatísticas
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {templates?.length ? (
                    templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{template.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {template.name === "Confirmação de consulta" ? "Lembrete padrão" : "Acompanhamento"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {template.timeBeforeAppointment === "1 day" ? "1 dia antes" : 
                             template.timeBeforeAppointment === "2 days" ? "2 dias antes" : 
                             template.timeBeforeAppointment === "3 days" ? "3 dias antes" : 
                             "1 semana antes"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Ativo
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{template.statistics.sent} enviados</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{template.statistics.confirmationRate}% de confirmação</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                        Nenhum template encontrado. Crie um novo modelo clicando no botão acima.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
