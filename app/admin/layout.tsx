import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if ((session.user as any)?.role !== "ADMIN") redirect("/");

  return (
    <AdminLayout userName={session.user?.name ?? undefined}>
      {children}
    </AdminLayout>
  );
}
