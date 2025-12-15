"use client";

import { useState } from "react";
import { useResume } from "@/lib/resume-context";
import {
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  List,
  Folder,
  Plus,
  Trash2,
  X,
  GripVertical,
} from "lucide-react";
import DatePicker from "./DatePicker";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-sm text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

interface SidebarEditorProps {
  width?: number;
}

export default function SidebarEditor({ width = 576 }: SidebarEditorProps) {
  const {
    resumeData,
    updatePersonalInfo,
    updateContact,
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
    addProject,
    updateProject,
    deleteProject,
    updateSectionTitle,
    updateMetadata,
  } = useResume();

  const [expertiseInput, setExpertiseInput] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [draggedBulletIndex, setDraggedBulletIndex] = useState<number | null>(null);
  const [draggedBulletExpId, setDraggedBulletExpId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverExpId, setDragOverExpId] = useState<string | null>(null);
  
  // Drag state for expertise
  const [draggedExpertiseIndex, setDraggedExpertiseIndex] = useState<number | null>(null);
  const [dragOverExpertiseIndex, setDragOverExpertiseIndex] = useState<number | null>(null);
  
  // Drag state for tech stack
  const [draggedTechStackIndex, setDraggedTechStackIndex] = useState<number | null>(null);
  const [dragOverTechStackIndex, setDragOverTechStackIndex] = useState<number | null>(null);

  const addExpertiseItem = () => {
    if (expertiseInput.trim()) {
      updateExpertise([...resumeData.expertise, expertiseInput.trim()]);
      setExpertiseInput("");
    }
  };

  const removeExpertiseItem = (index: number) => {
    updateExpertise(resumeData.expertise.filter((_, i) => i !== index));
  };

  const addTechStackItem = () => {
    if (techStackInput.trim()) {
      updateTechStack([...resumeData.techStack, techStackInput.trim()]);
      setTechStackInput("");
    }
  };

  const removeTechStackItem = (index: number) => {
    updateTechStack(resumeData.techStack.filter((_, i) => i !== index));
  };

  const handleBulletDragStart = (e: React.DragEvent, expId: string, index: number) => {
    setDraggedBulletIndex(index);
    setDraggedBulletExpId(expId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleBulletDragOver = (e: React.DragEvent, expId: string, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedBulletExpId === expId && draggedBulletIndex !== index) {
      setDragOverIndex(index);
      setDragOverExpId(expId);
    }
  };

  const handleBulletDragLeave = () => {
    setDragOverIndex(null);
    setDragOverExpId(null);
  };

  const handleBulletDrop = (e: React.DragEvent, expId: string, targetIndex: number) => {
    e.preventDefault();
    if (draggedBulletIndex !== null && draggedBulletExpId === expId && draggedBulletIndex !== targetIndex) {
      reorderBullets(expId, draggedBulletIndex, targetIndex);
    }
    setDraggedBulletIndex(null);
    setDraggedBulletExpId(null);
    setDragOverIndex(null);
    setDragOverExpId(null);
  };

  return (
    <div 
      className="bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0"
      style={{ width: `${width}px` }}
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Resume Editor
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Target Job Metadata Section */}
        <CollapsibleSection 
          title="Target Job" 
          icon={<Briefcase className="w-4 h-4 text-gray-600" />}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Target Role</label>
              <input
                type="text"
                value={resumeData.metadata?.targetRole || ""}
                onChange={(e) => updateMetadata({ targetRole: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Target Company</label>
              <input
                type="text"
                value={resumeData.metadata?.targetCompany || ""}
                onChange={(e) => updateMetadata({ targetCompany: e.target.value })}
                placeholder="e.g., Google"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Posting Link</label>
              <input
                type="url"
                value={resumeData.metadata?.targetLink || ""}
                onChange={(e) => updateMetadata({ targetLink: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Contact" icon={<User className="w-4 h-4 text-gray-600" />}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={resumeData.contact.location}
                onChange={(e) => updateContact({ location: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={resumeData.contact.phone}
                onChange={(e) => updateContact({ phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={resumeData.contact.email}
                onChange={(e) => updateContact({ email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="text"
                value={resumeData.contact.linkedin}
                onChange={(e) => updateContact({ linkedin: e.target.value })}
                placeholder="/username"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Experience" icon={<Briefcase className="w-4 h-4 text-gray-600" />} defaultOpen>
          <div className="space-y-6">
            <div className="mb-4 pb-3 border-b border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={resumeData.sectionTitles?.experience || "Professional Experience"}
                onChange={(e) => updateSectionTitle("experience", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {resumeData.experience.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-gray-600">Job #{resumeData.experience.indexOf(job) + 1}</span>
                  <button
                    onClick={() => deleteExperience(job.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Delete job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Company</label>
                  <input
                    type="text"
                    value={job.company}
                    onChange={(e) => updateExperience(job.id, { company: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={job.title}
                    onChange={(e) => updateExperience(job.id, { title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date</label>
                    <DatePicker
                      value={job.startDate}
                      onChange={(value) => updateExperience(job.id, { startDate: value })}
                      placeholder="Select date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date</label>
                    <DatePicker
                      value={job.endDate}
                      onChange={(value) => updateExperience(job.id, { endDate: value })}
                      placeholder="Select date"
                      allowPresent={true}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Bullet Points</label>
                  <div className="space-y-2">
                    {job.bullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleBulletDragStart(e, job.id, idx)}
                        onDragOver={(e) => handleBulletDragOver(e, job.id, idx)}
                        onDragLeave={handleBulletDragLeave}
                        onDrop={(e) => handleBulletDrop(e, job.id, idx)}
                        className={`flex gap-2 items-start group ${
                          draggedBulletIndex === idx && draggedBulletExpId === job.id
                            ? "opacity-50"
                            : dragOverIndex === idx && dragOverExpId === job.id
                            ? "bg-blue-50 border-2 border-blue-300 border-dashed"
                            : "hover:bg-gray-50"
                        } rounded-md p-1 -ml-1 transition-colors cursor-move border border-transparent`}
                      >
                        <div
                          className="text-gray-400 group-hover:text-gray-600 flex-shrink-0 self-start mt-2 pointer-events-none"
                          aria-label="Drag handle"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <textarea
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...job.bullets];
                            newBullets[idx] = e.target.value;
                            updateExperience(job.id, { bullets: newBullets });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              updateExperience(job.id, { bullets: [...job.bullets, ""] });
                            }
                          }}
                          rows={3}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white transition-colors"
                          placeholder="Enter bullet point..."
                        />
                        <button
                          onClick={() => {
                            const newBullets = job.bullets.filter((_, i) => i !== idx);
                            updateExperience(job.id, { bullets: newBullets });
                          }}
                          className="text-red-500 hover:text-red-700 flex-shrink-0 self-start mt-2"
                          aria-label="Delete bullet"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        updateExperience(job.id, { bullets: [...job.bullets, ""] });
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 w-full justify-center py-2 border border-dashed border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Bullet
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Education" icon={<GraduationCap className="w-4 h-4 text-gray-600" />}>
          <div className="space-y-4">
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-gray-600">Education #{resumeData.education.indexOf(edu) + 1}</span>
                  <button
                    onClick={() => deleteEducation(edu.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Delete education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Degree/Certification</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date</label>
                    <DatePicker
                      value={edu.startDate}
                      onChange={(value) => updateEducation(edu.id, { startDate: value })}
                      placeholder="Select date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date</label>
                    <DatePicker
                      value={edu.endDate}
                      onChange={(value) => updateEducation(edu.id, { endDate: value })}
                      placeholder="Select date"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Education
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Skills" icon={<List className="w-4 h-4 text-gray-600" />}>
          <div className="space-y-6">
            {/* Expertise Section */}
            <div>
              <div className="mb-3 pb-2 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={resumeData.sectionTitles?.expertise || "Expertise"}
                  onChange={(e) => updateSectionTitle("expertise", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                {resumeData.expertise.map((item, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      setDraggedExpertiseIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedExpertiseIndex !== idx) {
                        setDragOverExpertiseIndex(idx);
                      }
                    }}
                    onDragLeave={() => setDragOverExpertiseIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedExpertiseIndex !== null && draggedExpertiseIndex !== idx) {
                        reorderExpertise(draggedExpertiseIndex, idx);
                      }
                      setDraggedExpertiseIndex(null);
                      setDragOverExpertiseIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedExpertiseIndex(null);
                      setDragOverExpertiseIndex(null);
                    }}
                    className={`flex items-center gap-2 p-1 -ml-1 rounded-md cursor-move transition-colors border border-transparent ${
                      draggedExpertiseIndex === idx ? "opacity-50" : ""
                    } ${dragOverExpertiseIndex === idx ? "bg-blue-50 border-blue-300 border-dashed" : "hover:bg-gray-50"}`}
                  >
                    <div className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newExpertise = [...resumeData.expertise];
                        newExpertise[idx] = e.target.value;
                        updateExpertise(newExpertise);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeExpertiseItem(idx)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addExpertiseItem()}
                    placeholder="Add expertise..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addExpertiseItem}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tech Stack Section */}
            <div>
              <div className="mb-3 pb-2 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={resumeData.sectionTitles?.techStack || "Tech Stack"}
                  onChange={(e) => updateSectionTitle("techStack", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                {resumeData.techStack.map((item, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTechStackIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedTechStackIndex !== idx) {
                        setDragOverTechStackIndex(idx);
                      }
                    }}
                    onDragLeave={() => setDragOverTechStackIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedTechStackIndex !== null && draggedTechStackIndex !== idx) {
                        reorderTechStack(draggedTechStackIndex, idx);
                      }
                      setDraggedTechStackIndex(null);
                      setDragOverTechStackIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedTechStackIndex(null);
                      setDragOverTechStackIndex(null);
                    }}
                    className={`flex items-center gap-2 p-1 -ml-1 rounded-md cursor-move transition-colors border border-transparent ${
                      draggedTechStackIndex === idx ? "opacity-50" : ""
                    } ${dragOverTechStackIndex === idx ? "bg-blue-50 border-blue-300 border-dashed" : "hover:bg-gray-50"}`}
                  >
                    <div className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newTechStack = [...resumeData.techStack];
                        newTechStack[idx] = e.target.value;
                        updateTechStack(newTechStack);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeTechStackItem(idx)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTechStackItem()}
                    placeholder="Add tech..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTechStackItem}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Projects" icon={<Folder className="w-4 h-4 text-gray-600" />}>
          <div className="space-y-4">
            <div className="mb-4 pb-3 border-b border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={resumeData.sectionTitles?.projects || "Key Technical Projects"}
                onChange={(e) => updateSectionTitle("projects", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {resumeData.projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-gray-600">Project #{resumeData.projects.indexOf(project) + 1}</span>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(project.id, { title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, { description: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addProject}
              className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </CollapsibleSection>

      </div>
    </div>
  );
}
