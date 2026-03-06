import { z } from "zod";

export const idSchema = z.string().cuid();
export const optionalUrlSchema = z.string().url().optional().or(z.literal(""));
export const stringArraySchema = z.array(z.string().min(1)).default([]);
export const jsonRecordSchema = z.record(z.string(), z.unknown());

export const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]);
