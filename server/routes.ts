import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertPatientSchema, insertAppointmentSchema, 
  insertMedicalRecordSchema, insertWhatsappTemplateSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Patient routes
  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getPatientsByUserId(req.user!.id);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const patient = await storage.getPatient(parseInt(req.params.id));
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      if (patient.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to access this patient" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const patient = await storage.getPatient(parseInt(req.params.id));
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      if (patient.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this patient" });
      }
      
      const validatedData = insertPatientSchema.partial().parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const updatedPatient = await storage.updatePatient(parseInt(req.params.id), validatedData);
      res.json(updatedPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByUserId(req.user!.id);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/date/:date", requireAuth, async (req, res) => {
    try {
      const date = new Date(req.params.date);
      const appointments = await storage.getAppointmentsForDate(req.user!.id, date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments for date" });
    }
  });

  app.get("/api/appointments/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const patient = await storage.getPatient(patientId);
      
      if (!patient || patient.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to access this patient's appointments" });
      }
      
      const appointments = await storage.getAppointmentsByPatientId(patientId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Verify that the patient belongs to this user
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient || patient.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to create appointments for this patient" });
      }
      
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const appointment = await storage.getAppointment(parseInt(req.params.id));
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      if (appointment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }
      
      const validatedData = insertAppointmentSchema.partial().parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const updatedAppointment = await storage.updateAppointment(parseInt(req.params.id), validatedData);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Medical records routes
  app.get("/api/medical-records/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const patient = await storage.getPatient(patientId);
      
      if (!patient || patient.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to access this patient's medical records" });
      }
      
      const records = await storage.getMedicalRecordsByPatientId(patientId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  app.post("/api/medical-records", requireAuth, async (req, res) => {
    try {
      const validatedData = insertMedicalRecordSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Verify that the patient belongs to this user
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient || patient.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to create medical records for this patient" });
      }
      
      const record = await storage.createMedicalRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid medical record data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create medical record" });
    }
  });

  // WhatsApp template routes
  app.get("/api/whatsapp-templates", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getWhatsappTemplatesByUserId(req.user!.id);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp templates" });
    }
  });

  app.post("/api/whatsapp-templates", requireAuth, async (req, res) => {
    try {
      const validatedData = insertWhatsappTemplateSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const template = await storage.createWhatsappTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid WhatsApp template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create WhatsApp template" });
    }
  });

  app.put("/api/whatsapp-templates/:id", requireAuth, async (req, res) => {
    try {
      const template = await storage.getWhatsappTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ message: "WhatsApp template not found" });
      }
      if (template.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this WhatsApp template" });
      }
      
      const validatedData = insertWhatsappTemplateSchema.partial().parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const updatedTemplate = await storage.updateWhatsappTemplate(parseInt(req.params.id), validatedData);
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid WhatsApp template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update WhatsApp template" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
