import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminShellProps = {
	children: ReactNode;
	className?: string;
};

export function AdminShell({ children, className }: AdminShellProps) {
	return <div className={cn("space-y-12 pb-16", className)}>{children}</div>;
}
