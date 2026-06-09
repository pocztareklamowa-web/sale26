import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DirectorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any)?.role !== "DIRECTOR") redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Panel Dyrektora</h1>
        <p className="text-gray-500 mt-2">Witaj, {session.user?.name}!</p>
        <p className="text-sm text-gray-400 mt-4">Funkcjonalność dyrektora będzie dostępna wkrótce.</p>
      </div>
    </div>
  );
}
