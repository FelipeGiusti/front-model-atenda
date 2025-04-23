import { users, patients, appointments, medicalRecords, whatsappTemplates } from "@shared/schema";
import { type User, type InsertUser, type Patient, type InsertPatient, 
         type Appointment, type InsertAppointment, type MedicalRecord, 
         type InsertMedicalRecord, type WhatsappTemplate, type InsertWhatsappTemplate } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Define the storage interface with CRUD operations for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientsByUserId(userId: number): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;
  getAppointmentsByPatientId(patientId: number): Promise<Appointment[]>;
  getAppointmentsForDate(userId: number, date: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  // Medical record operations
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPatientId(patientId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  
  // WhatsApp template operations
  getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined>;
  getWhatsappTemplatesByUserId(userId: number): Promise<WhatsappTemplate[]>;
  createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate>;
  updateWhatsappTemplate(id: number, template: Partial<InsertWhatsappTemplate>): Promise<WhatsappTemplate | undefined>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private patientsStore: Map<number, Patient>;
  private appointmentsStore: Map<number, Appointment>;
  private medicalRecordsStore: Map<number, MedicalRecord>;
  private whatsappTemplatesStore: Map<number, WhatsappTemplate>;
  
  private userIdCounter: number;
  private patientIdCounter: number;
  private appointmentIdCounter: number;
  private medicalRecordIdCounter: number;
  private whatsappTemplateIdCounter: number;
  
  public sessionStore: session.SessionStore;
  
  constructor() {
    this.usersStore = new Map();
    this.patientsStore = new Map();
    this.appointmentsStore = new Map();
    this.medicalRecordsStore = new Map();
    this.whatsappTemplatesStore = new Map();
    
    this.userIdCounter = 1;
    this.patientIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.medicalRecordIdCounter = 1;
    this.whatsappTemplateIdCounter = 1;
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.usersStore.set(id, user);
    return user;
  }
  
  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patientsStore.get(id);
  }
  
  async getPatientsByUserId(userId: number): Promise<Patient[]> {
    return Array.from(this.patientsStore.values()).filter(
      (patient) => patient.userId === userId
    );
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientIdCounter++;
    const patient: Patient = { ...insertPatient, id };
    this.patientsStore.set(id, patient);
    return patient;
  }
  
  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = await this.getPatient(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...updates };
    this.patientsStore.set(id, updatedPatient);
    return updatedPatient;
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointmentsStore.get(id);
  }
  
  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointmentsStore.values()).filter(
      (appointment) => appointment.userId === userId
    );
  }
  
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointmentsStore.values()).filter(
      (appointment) => appointment.patientId === patientId
    );
  }
  
  async getAppointmentsForDate(userId: number, date: Date): Promise<Appointment[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.appointmentsStore.values()).filter(
      (appointment) => 
        appointment.userId === userId && 
        appointment.date.toString() === dateString
    );
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointmentsStore.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointmentsStore.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Medical record operations
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecordsStore.get(id);
  }
  
  async getMedicalRecordsByPatientId(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecordsStore.values()).filter(
      (record) => record.patientId === patientId
    );
  }
  
  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.medicalRecordIdCounter++;
    const record: MedicalRecord = { ...insertRecord, id };
    this.medicalRecordsStore.set(id, record);
    return record;
  }
  
  // WhatsApp template operations
  async getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined> {
    return this.whatsappTemplatesStore.get(id);
  }
  
  async getWhatsappTemplatesByUserId(userId: number): Promise<WhatsappTemplate[]> {
    return Array.from(this.whatsappTemplatesStore.values()).filter(
      (template) => template.userId === userId
    );
  }
  
  async createWhatsappTemplate(insertTemplate: InsertWhatsappTemplate): Promise<WhatsappTemplate> {
    const id = this.whatsappTemplateIdCounter++;
    const template: WhatsappTemplate = { ...insertTemplate, id };
    this.whatsappTemplatesStore.set(id, template);
    return template;
  }
  
  async updateWhatsappTemplate(id: number, updates: Partial<InsertWhatsappTemplate>): Promise<WhatsappTemplate | undefined> {
    const template = await this.getWhatsappTemplate(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...updates };
    this.whatsappTemplatesStore.set(id, updatedTemplate);
    return updatedTemplate;
  }
}

export const storage = new MemStorage();
