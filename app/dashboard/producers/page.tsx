import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';

export default function ProducersPage() {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Productores</h1>
              <div className="flex gap-2">
                <Link href={ROUTES.PRODUCERS_IMPORT}>
                  <Button variant="outline">Importar</Button>
                </Link>
                <Link href={ROUTES.PRODUCERS_NEW}>
                  <Button>Nuevo Productor</Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground">Lista de productores (pendiente implementar)</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

