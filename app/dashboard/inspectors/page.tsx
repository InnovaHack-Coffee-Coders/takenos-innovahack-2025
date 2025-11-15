import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function InspectorsPage() {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Inspectores</h1>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground">Lista de inspectores (pendiente implementar)</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

