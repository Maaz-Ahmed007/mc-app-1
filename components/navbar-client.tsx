"use client";

import { useEffect, useState } from "react";
import { Section } from "@prisma/client";

import SectionSwitcher from "./section-switcher";
import { MainNav } from "./main-nav";
import { NavSettings } from "./nav-settings";

interface NavbarClientProps {
	sections: Section[];
}

const NavbarClient: React.FC<NavbarClientProps> = ({ sections }) => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<div
			className={`fixed top-0 left-0 right-0 bg-white transition-all duration-300 z-50 ${
				isScrolled ? "h-14" : "h-16"
			}`}>
			<div className="container mx-auto h-full">
				<div className="flex items-center justify-between px-4 h-full">
					<div className="flex items-center space-x-4">
						<SectionSwitcher items={sections} />
						<MainNav className={isScrolled ? "m-4" : "m-6"} />
					</div>
					<div className="ml-auto flex items-center space-x-4">
						<NavSettings />
					</div>
				</div>
			</div>
		</div>
	);
};

export default NavbarClient;
