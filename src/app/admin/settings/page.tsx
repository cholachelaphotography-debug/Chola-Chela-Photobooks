import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-orange-800 text-orange-50 text-xs py-1.5 text-center">
        Chola Chela Photo Book Studio · Administrator
      </div>

      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/admin"
            className="text-sm text-stone-500 hover:text-orange-700"
          >
            ← Admin dashboard
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-stone-500 hover:text-orange-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold">
            CC
          </div>
          <div>
            <div className="font-semibold text-stone-900">Chola Chela</div>
            <div className="text-[10px] uppercase tracking-widest text-orange-700">
              Admin settings
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mb-2">Settings</h1>
        <p className="text-sm text-stone-500 mb-8">
          Manage your administrator account for Chola Chela Photo Book Studio.
        </p>

        <AdminSettingsClient
          name={user.name}
          email={user.email}
          role={user.role}
          memberSince={user.createdAt.toISOString()}
        />
      </main>
    </div>
  );
}
