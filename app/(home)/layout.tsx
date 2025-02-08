import { initializeDatabase, prismadb } from "@/lib/prismadb"

export default async function SetupLayout({
    children
}: {
    children: React.ReactNode
}) {
    await initializeDatabase();
    const section = await prismadb.section.findFirst();

    return (
        <main data-section-id={section?.id || ''}>
            {children}
        </main>
    );
}