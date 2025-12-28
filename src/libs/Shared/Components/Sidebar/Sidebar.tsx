import { cookies } from "next/headers";
import Link from "next/link";
import styles from "./Sidebar.module.css";

export const Sidebar = async () => {
	const cookieStore = await cookies();
	const leagueId = cookieStore.get("fpl_league_id")?.value;
	const managerId = cookieStore.get("fpl_manager_id")?.value;

	// const [isCollapsed, setIsCollapsed] = useState(false);

	const sections = [
		{
			title: "League Analytics",
			items: [
				{ id: "standings", label: "Standings", icon: "leaderboard" },
				{ id: "h2h", label: "Head to Head", icon: "compare_arrows" },
				{ id: "differentials", label: "Differentials", icon: "diamond" },
				{ id: "ownership", label: "Ownership", icon: "pie_chart" },
			],
		},
		{
			title: "Tools & Planning",
			items: [
				{ id: "transfers", label: "Transfer Planner", icon: "swap_horiz" },
				{ id: "dream-team", label: "Dream Team", icon: "hotel_class" },
				{ id: "my-team", label: "My Team", icon: "groups" },
				{ id: "fdr", label: "FDR Planner", icon: "calendar_month" },
				{ id: "chips", label: "Chip Advisor", icon: "confirmation_number" },
			],
		},
		{
			title: "Global Data",
			items: [
				{ id: "top", label: "Top 50 Managers", icon: "public" },
				{ id: "players", label: "Player Comparison", icon: "groups" },
				{ id: "fixtures", label: "Fixture List", icon: "event_note" },
				{ id: "trends", label: "League Trends", icon: "trending_up" },
				{ id: "history", label: "Manager History", icon: "history" },
			],
		},
	] as const;

	return (
		<aside
			// className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
			className={`${styles.sidebar} `}
		>
			<div className={styles.brand}>
				<div className={styles.brandIcon}>
					<span className="material-symbols-sharp" style={{ fontSize: "18px" }}>
						sports_soccer
					</span>
				</div>
				<Link
					href={"/"}
					// className={`${styles.brandText} ${isCollapsed ? styles.brandTextCollapsed : ""}`}
					className={`${styles.brandText} `}
				>
					FPL<span style={{ fontWeight: 400 }}>Alchemy</span>
				</Link>
			</div>

			<nav className={styles.nav}>
				{sections.map((section) => (
					<div key={section.title} className={styles.section}>
						<div className={styles.sectionHeader}>{section.title}</div>

						{section.items.map((item) => (
							<Link
								href={`/league/${leagueId}/${item.id}`}
								key={item.id}
								type="button"
								className={styles.navItem}
								// title={isCollapsed ? item.label : undefined}
							>
								<span className={`${styles.icon} material-symbols-sharp`}>
									{item.icon}
								</span>
								<span
									// className={`${styles.label} ${isCollapsed ? styles.labelCollapsed : ""}`}
									className={`${styles.label}`}
								>
									{item.label}
								</span>
							</Link>
						))}
					</div>
				))}
			</nav>

			<div className={styles.footer}>
				<button
					className={styles.collapseButton}
					type="button"
					// onClick={() => setIsCollapsed(!isCollapsed)}
				>
					{/* <span className="material-symbols-sharp" style={{ fontSize: "20px" }}>
						{isCollapsed ? "chevron_right" : "chevron_left"}
					</span>
					{!isCollapsed && <span>Collapse</span>} */}
				</button>
			</div>
		</aside>
	);
};
