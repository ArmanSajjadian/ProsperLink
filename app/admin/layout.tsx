import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!isAdminEmail(session?.user?.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <AdminSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
