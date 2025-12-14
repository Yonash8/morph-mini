"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ResumeData, defaultResumeData } from "./types";

interface ResumeContextType {
  resumeData: ResumeData;
  updatePersonalInfo: (updates: Partial<ResumeData["personalInfo"]>) => void;
  updateContact: (updates: Partial<ResumeData["contact"]>) => void;
  reorderContactFields: (fromIndex: number, toIndex: number) => void;
  updateExpertise: (expertise: string[]) => void;
  reorderExpertise: (fromIndex: number, toIndex: number) => void;
  updateTechStack: (techStack: string[]) => void;
  reorderTechStack: (fromIndex: number, toIndex: number) => void;
  addEducation: () => void;
  updateEducation: (id: string, updates: Partial<ResumeData["education"][0]>) => void;
  deleteEducation: (id: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, updates: Partial<ResumeData["experience"][0]>) => void;
  deleteExperience: (id: string) => void;
  reorderBullets: (experienceId: string, fromIndex: number, toIndex: number) => void;
  reorderExperience: (fromIndex: number, toIndex: number) => void;
  reorderProject: (fromIndex: number, toIndex: number) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addProject: () => void;
  updateProject: (id: string, updates: Partial<ResumeData["projects"][0]>) => void;
  deleteProject: (id: string) => void;
  updateSectionTitle: (section: keyof ResumeData["sectionTitles"], title: string) => void;
  importResumeData: (data: ResumeData) => void;
  updateMetadata: (updates: Partial<ResumeData["metadata"]>) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    // Ensure backward compatibility - add sectionTitles if missing
    // Create a deep copy to avoid mutating the default
    const data = JSON.parse(JSON.stringify(defaultResumeData));
    if (!data.sectionTitles) {
      data.sectionTitles = {
        experience: "Professional Experience",
        projects: "Key Technical Projects",
        expertise: "Expertise",
        techStack: "Tech Stack",
      };
    } else {
      // Ensure new section titles exist
      if (!data.sectionTitles.expertise) {
        data.sectionTitles.expertise = "Expertise";
      }
      if (!data.sectionTitles.techStack) {
        data.sectionTitles.techStack = "Tech Stack";
      }
    }
    if (!data.contactOrder) {
      data.contactOrder = ['location', 'phone', 'email', 'linkedin'];
    }
    if (!data.sectionOrder) {
      data.sectionOrder = ['experience', 'projects'];
    }
    if (!data.metadata) {
      data.metadata = {
        dateCreated: new Date().toISOString(),
        targetRole: "",
        targetCompany: "",
        targetLink: "",
      };
    }
    return data;
  });

  const updatePersonalInfo = (updates: Partial<ResumeData["personalInfo"]>) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updates },
    }));
  };

  const updateContact = (updates: Partial<ResumeData["contact"]>) => {
    setResumeData((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...updates },
    }));
  };

  const reorderContactFields = (fromIndex: number, toIndex: number) => {
    setResumeData((prev) => {
      const newOrder = [...prev.contactOrder];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return { ...prev, contactOrder: newOrder };
    });
  };

  const updateExpertise = (expertise: string[]) => {
    setResumeData((prev) => ({ ...prev, expertise }));
  };

  const reorderExpertise = (fromIndex: number, toIndex: number) => {
    setResumeData((prev) => {
      const newExpertise = [...prev.expertise];
      const [removed] = newExpertise.splice(fromIndex, 1);
      newExpertise.splice(toIndex, 0, removed);
      return { ...prev, expertise: newExpertise };
    });
  };

  const updateTechStack = (techStack: string[]) => {
    setResumeData((prev) => ({ ...prev, techStack }));
  };

  const reorderTechStack = (fromIndex: number, toIndex: number) => {
    setResumeData((prev) => {
      const newTechStack = [...prev.techStack];
      const [removed] = newTechStack.splice(fromIndex, 1);
      newTechStack.splice(toIndex, 0, removed);
      return { ...prev, techStack: newTechStack };
    });
  };

  const addEducation = () => {
    const newEducation = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  };

  const updateEducation = (id: string, updates: Partial<ResumeData["education"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    }));
  };

  const deleteEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: `exp-${Date.now()}`,
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const updateExperience = (id: string, updates: Partial<ResumeData["experience"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }));
  };

  const deleteExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const reorderBullets = (experienceId: string, fromIndex: number, toIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id === experienceId) {
          const newBullets = [...exp.bullets];
          const [removed] = newBullets.splice(fromIndex, 1);
          newBullets.splice(toIndex, 0, removed);
          return { ...exp, bullets: newBullets };
        }
        return exp;
      }),
    }));
  };

  const reorderExperience = (fromIndex: number, toIndex: number) => {
    setResumeData((prev) => {
      const newExperience = [...prev.experience];
      const [removed] = newExperience.splice(fromIndex, 1);
      newExperience.splice(toIndex, 0, removed);
      return { ...prev, experience: newExperience };
    });
  };

  const reorderProject = (fromIndex: number, toIndex: number) => {
    setResumeData((prev) => {
      const newProjects = [...prev.projects];
      const [removed] = newProjects.splice(fromIndex, 1);
      newProjects.splice(toIndex, 0, removed);
      return { ...prev, projects: newProjects };
    });
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    setResumeData((prev) => {
      const newOrder = [...prev.sectionOrder];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return { ...prev, sectionOrder: newOrder };
    });
  };

  const addProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      title: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProject = (id: string, updates: Partial<ResumeData["projects"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
    }));
  };

  const deleteProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  };

  const updateSectionTitle = (section: keyof ResumeData["sectionTitles"], title: string) => {
    setResumeData((prev) => ({
      ...prev,
      sectionTitles: { ...prev.sectionTitles, [section]: title },
    }));
  };

  const importResumeData = (data: ResumeData) => {
    // Validate and normalize the imported data
    const normalizedData: ResumeData = {
      personalInfo: {
        name: data.personalInfo?.name || "",
        role: data.personalInfo?.role || "",
        summary: data.personalInfo?.summary || "",
      },
      contact: {
        location: data.contact?.location || "",
        phone: data.contact?.phone || "",
        email: data.contact?.email || "",
        linkedin: data.contact?.linkedin || "",
      },
      contactOrder: data.contactOrder || ['location', 'phone', 'email', 'linkedin'],
      expertise: Array.isArray(data.expertise) ? data.expertise : [],
      techStack: Array.isArray(data.techStack) ? data.techStack : [],
      education: Array.isArray(data.education) ? data.education : [],
      experience: Array.isArray(data.experience) ? data.experience : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      sectionTitles: {
        experience: data.sectionTitles?.experience || "Professional Experience",
        projects: data.sectionTitles?.projects || "Key Technical Projects",
        expertise: data.sectionTitles?.expertise || "Expertise",
        techStack: data.sectionTitles?.techStack || "Tech Stack",
      },
      sectionOrder: Array.isArray(data.sectionOrder) ? data.sectionOrder : ['experience', 'projects'],
      metadata: {
        dateCreated: data.metadata?.dateCreated || new Date().toISOString(),
        targetRole: data.metadata?.targetRole || "",
        targetCompany: data.metadata?.targetCompany || "",
        targetLink: data.metadata?.targetLink || "",
      },
    };
    setResumeData(normalizedData);
  };

  const updateMetadata = (updates: Partial<ResumeData["metadata"]>) => {
    setResumeData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        dateCreated: prev.metadata?.dateCreated || new Date().toISOString(),
        targetRole: prev.metadata?.targetRole || "",
        targetCompany: prev.metadata?.targetCompany || "",
        targetLink: prev.metadata?.targetLink || "",
        ...updates,
      },
    }));
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        updatePersonalInfo,
        updateContact,
        reorderContactFields,
        updateExpertise,
        reorderExpertise,
        updateTechStack,
        reorderTechStack,
        addEducation,
        updateEducation,
        deleteEducation,
        addExperience,
        updateExperience,
        deleteExperience,
        reorderBullets,
        reorderExperience,
        reorderProject,
        reorderSections,
        addProject,
        updateProject,
        deleteProject,
        updateSectionTitle,
        importResumeData,
        updateMetadata,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}
