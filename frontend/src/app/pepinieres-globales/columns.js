import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const pepinieresColumns = (onViewDetails) => [
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nom <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
    cell: ({ row }) => row.getValue("nom"),
  },
  {
    accessorKey: "categorie",
    header: "Catégorie",
    cell: ({ row }) => row.getValue("categorie") || "-",
  },
  {
    accessorKey: "adresse",
    header: "Adresse",
    cell: ({ row }) => row.getValue("adresse") || "-",
  },
  {
    accessorKey: "nom_projet",
    header: "Nom du projet",
    cell: ({ row }) => row.getValue("nom_projet") || "-",
  },
  {
    accessorKey: "nom_gestionnaire",
    header: "Nom gestionnaire",
    cell: ({ row }) => row.getValue("nom_gestionnaire") || "-",
  },
  {
    accessorKey: "poste_gestionnaire",
    header: "Poste gestionnaire",
    cell: ({ row }) => row.getValue("poste_gestionnaire") || "-",
  },
  {
    accessorKey: "telephone_gestionnaire",
    header: "Téléphone gestionnaire",
    cell: ({ row }) => row.getValue("telephone_gestionnaire") || "-",
  },
  {
    accessorKey: "email_gestionnaire",
    header: "Email gestionnaire",
    cell: ({ row }) => row.getValue("email_gestionnaire") || "-",
  },
  {
    accessorKey: "especes_produites",
    header: "Espèces produites",
    cell: ({ row }) => row.getValue("especes_produites") || "-",
  },
  {
    accessorKey: "quantite_production_generale",
    header: "Quantité production générale",
    cell: ({ row }) => row.getValue("quantite_production_generale") || "-",
  },
  {
    accessorKey: "createdAt",
    header: "Date création",
    cell: ({ row }) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('fr-FR') : "-",
  },
  {
    id: "membre",
    header: "Membre",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center">
          {user?.logo && (
            <img src={`${process.env.NEXT_PUBLIC_API_URL}/media/${user.logo}`} alt="Logo" className="w-6 h-6 rounded-full mr-2" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "user.abreviation",
    header: "Abréviation",
    cell: ({ row }) => row.original.user?.abreviation || "-",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
            Voir détails
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 