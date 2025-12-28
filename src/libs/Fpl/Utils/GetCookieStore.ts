"use server";

import { cookies } from "next/headers";

export const getCookieStore = async () => {
	const cookieStore = await cookies();

	return cookieStore;
};
