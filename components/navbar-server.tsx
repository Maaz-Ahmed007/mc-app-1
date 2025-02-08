import { prismadb } from "@/lib/prismadb";

import NavbarClient from "./navbar-client";

const NavbarServer = async () => {
	const sections = await prismadb.section.findMany();

	return <NavbarClient sections={sections} />;
};

export default NavbarServer;
