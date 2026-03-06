"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { submitPublicContactAction } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
	name: z.string().trim().optional(),
	email: z.email("Enter a valid email"),
	subject: z.string().trim().optional(),
	message: z.string().min(10, "Message should be at least 10 characters"),
	honeypot: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			subject: "",
			message: "",
			honeypot: "",
		},
	});

	const onSubmit = handleSubmit(async (values) => {
		try {
			const formData = new FormData();
			formData.set("name", values.name?.trim() ?? "");
			formData.set("email", values.email);
			formData.set("subject", values.subject?.trim() ?? "");
			formData.set("message", values.message);
			formData.set("honeypot", values.honeypot ?? "");

			const response = await submitPublicContactAction(formData);
			if (!response.success) {
				throw new Error(response.message);
			}
			toast.success("Message sent successfully.");
			reset();
		} catch (error) {
			const detail = error instanceof Error ? error.message : "Unable to send message";
			toast.error(detail);
		}
	});

	return (
		<div className="rounded-3xl border border-border/65 bg-[linear-gradient(135deg,hsl(var(--background)/0.9)_0%,hsl(var(--surface)/0.82)_100%)] p-4 sm:p-5 md:p-6">
			<h2 className="text-2xl font-semibold tracking-tight">Send a Message</h2>

			<form onSubmit={onSubmit} className="mt-5 space-y-3.5" noValidate>
				<div className="sr-only" aria-hidden="true">
					<label htmlFor="website">Website</label>
					<Input id="website" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
				</div>

				<div className="space-y-1">
					<label htmlFor="name" className="text-[0.78rem] uppercase tracking-[0.2em] text-muted">
						Full Name (Optional)
					</label>
					<Input
						id="name"
						placeholder="Your name"
						aria-invalid={!!errors.name}
						disabled={isSubmitting}
						className="h-11 rounded-2xl border-border/70 bg-background/45 text-sm transition-[border-color,box-shadow] duration-300 focus-visible:ring-0 focus-visible:border-border/70 focus-visible:bg-background/45 focus-visible:shadow-none"
						{...register("name")}
					/>
					{errors.name ? <p className="text-xs text-red-400">{errors.name.message}</p> : null}
				</div>

				<div className="space-y-1">
					<label htmlFor="email" className="text-[0.78rem] uppercase tracking-[0.2em] text-muted">
						Email
					</label>
					<Input
						id="email"
						type="email"
						placeholder="your.email@example.com"
						aria-invalid={!!errors.email}
						disabled={isSubmitting}
						className="h-11 rounded-2xl border-border/70 bg-background/45 text-sm transition-[border-color,box-shadow] duration-300 focus-visible:ring-0 focus-visible:border-border/70 focus-visible:bg-background/45 focus-visible:shadow-none"
						{...register("email")}
					/>
					{errors.email ? <p className="text-xs text-red-400">{errors.email.message}</p> : null}
				</div>

				<div className="space-y-1">
					<label htmlFor="subject" className="text-[0.78rem] uppercase tracking-[0.2em] text-muted">
						Subject (Optional)
					</label>
					<Input
						id="subject"
						placeholder="Project or Collaboration Inquiry"
						aria-invalid={!!errors.subject}
						disabled={isSubmitting}
						className="h-11 rounded-2xl border-border/70 bg-background/45 text-sm transition-[border-color,box-shadow] duration-300 focus-visible:ring-0 focus-visible:border-border/70 focus-visible:bg-background/45 focus-visible:shadow-none"
						{...register("subject")}
					/>
					{errors.subject ? <p className="text-xs text-red-400">{errors.subject.message}</p> : null}
				</div>

				<div className="space-y-1">
					<label htmlFor="message" className="text-[0.78rem] uppercase tracking-[0.2em] text-muted">
						Message
					</label>
					<Textarea
						id="message"
						placeholder="Describe your project, objectives, and desired impact."
						aria-invalid={!!errors.message}
						disabled={isSubmitting}
						className="min-h-[136px] rounded-2xl border-border/70 bg-background/45 text-sm transition-[border-color,box-shadow] duration-300 focus-visible:ring-0 focus-visible:border-border/70 focus-visible:bg-background/45 focus-visible:shadow-none"
						{...register("message")}
					/>
					{errors.message ? <p className="text-xs text-red-400">{errors.message.message}</p> : null}
				</div>

				<p className="text-xs text-muted">Typical reply: within 24–48 hours. Message must be at least 10 characters.</p>

				<Button
					type="submit"
					disabled={isSubmitting}
					variant="outline"
					className="h-10 rounded-full px-6 text-base font-medium transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-[0_10px_20px_-16px_hsl(var(--accent)/0.6)]"
				>
					{isSubmitting ? "Sending..." : "Send Message →"}
				</Button>
			</form>
		</div>
	);
}
