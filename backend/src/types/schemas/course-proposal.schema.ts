import { z } from 'zod';

export const lessonProposalSchema = z.object({
  title: z.string().min(5),
  contentOutline: z.string().min(10),
});

export const moduleProposalSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  lessons: z.array(lessonProposalSchema).min(1),
});

export const courseProposalSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  modules: z.array(moduleProposalSchema).min(1),
});

export type LessonProposal = z.infer<typeof lessonProposalSchema>;
export type ModuleProposal = z.infer<typeof moduleProposalSchema>;
export type CourseProposal = z.infer<typeof courseProposalSchema>;
