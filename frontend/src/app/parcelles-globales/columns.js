import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const parcellesColumns = (onViewDetails) => [
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nom <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
    cell: ({ row }) => row.getValue("nom"),
  },
  {
    accessorKey: "culture",
    header: "Culture",
    cell: ({ row }) => row.getValue("culture"),
  },
  {
    accessorKey: "proprietaire",
    header: "Propriétaire",
    cell: ({ row }) => row.getValue("proprietaire"),
  },
  {
    id: "membre",
    header: "Membre",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center">
          {user?.logo && (
            <img src={`http://localhost:8000/media/${user.logo}`} alt="Logo" className="w-6 h-6 rounded-full mr-2" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-gray-500">{user?.username}</div>
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
    accessorKey: "superficie",
    header: "Superficie (ha)",
    cell: ({ row }) => row.original.superficie ? `${row.original.superficie} ha` : "-",
  },
  {
    accessorKey: "variete",
    header: "Variété",
    cell: ({ row }) => row.original.variete || "-",
  },
  {
    accessorKey: "dateSemis",
    header: "Date Semis",
    cell: ({ row }) => row.original.dateSemis ? new Date(row.original.dateSemis).toLocaleDateString('fr-FR') : "-",
  },
  {
    accessorKey: "dateRecoltePrevue",
    header: "Date Récolte",
    cell: ({ row }) => row.original.dateRecoltePrevue ? new Date(row.original.dateRecoltePrevue).toLocaleDateString('fr-FR') : "-",
  },
  {
    accessorKey: "typeSol",
    header: "Type Sol",
    cell: ({ row }) => row.original.typeSol || "-",
  },
  {
    accessorKey: "irrigation",
    header: "Irrigation",
    cell: ({ row }) => row.original.irrigation ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Oui</span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Non</span>
    ),
  },
  {
    id: "certifications",
    header: "Certifications",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.certificationBio && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Bio</span>
        )}
        {row.original.certificationHve && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">HVE</span>
        )}
        {!row.original.certificationBio && !row.original.certificationHve && (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
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
          {/* Ajoute d'autres actions ici si besoin */}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 