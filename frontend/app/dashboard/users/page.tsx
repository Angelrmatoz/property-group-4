import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function UsersListPage() {
  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
        <Link
          href="/dashboard/users/create"
          className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded self-start sm:self-auto"
        >
          crear
        </Link>
      </div>

      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">No hay usuarios aún.</p>

        <Card>
          <CardContent>
            <p className="text-sm text-gray-600 mt-5">
              Usa el botón crear para añadir usuarios.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
