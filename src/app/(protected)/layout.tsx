import { AuthGuard } from "@/components/shared/AuthGuard";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}