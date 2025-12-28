import { Suspense } from "react";
import { Sidebar } from "@/libs/Shared/Components/Sidebar/Sidebar";

export const SidebarAsync = () => {
	return (
		<Suspense fallback={<SidebarSkeleton />}>
			<SidebarAsyncInner />
		</Suspense>
	);
};

const SidebarSkeleton = () => (
	<div
		style={{
			width: "250px",
			background: "var(--surface)",
			borderRight: "1px solid var(--border)",
		}}
	/>
);

const SidebarAsyncInner = () => {
	return <Sidebar />;
};
