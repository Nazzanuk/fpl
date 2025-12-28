import { HomePage } from "../libs/Pages/Home/Home.page";

interface PageProps {
	searchParams: Promise<{ leagueId?: string }>;
}

export default function Home(props: PageProps) {
	return <HomePage {...props} />;
}
