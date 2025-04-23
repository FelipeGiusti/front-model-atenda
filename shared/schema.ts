import { pgTable, text, serial, integer, date, time, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  profession: text("profession"),
  role: text("role").notNull().default("practitioner"),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  birthDate: date("birth_date"),
  profession: text("profession"),
  status: text("status").default("active"), // active, inactive
  userId: integer("user_id").notNull().references(() => users.id),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  type: text("type").notNull(), // initial, followup, etc.
  status: text("status").default("confirmed"), // confirmed, pending, canceled
  notes: text("notes"),
});

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  recordType: text("record_type").notNull(), // anamnesis, evolution, plan, etc.
  content: text("content").notNull(),
});

export const whatsappTemplates = pgTable("whatsapp_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  message: text("message").notNull(),
  timeBeforeAppointment: text("time_before_appointment").notNull(), // 1 day, 2 days, 1 week
  status: text("status").default("active"), // active, inactive
  requestConfirmation: boolean("request_confirmation").default(true),
  sendTime: time("send_time").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ id: true });
export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplates).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

export type InsertWhatsappTemplate = z.infer<typeof insertWhatsappTemplateSchema>;
export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;
