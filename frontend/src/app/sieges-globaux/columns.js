
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getLogoUrl } from '../../lib/utils';
import SiegeDetailModal from "@/components/SiegeDetailModal";
import { useState } from 'react';

// Composant pour les actions avec le modal
const ActionCell = ({ row }) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowModal(true)}>
            Voir détails
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>

      {showModal && (
        <SiegeDetailModal 
          siege={row.original}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

// Mapping des catégories pour affichage lisible
const CATEGORIE_LABELS = {
  social: "Siège social",
  regional: "Siège régional",
  technique: "Siège technique",
  provisoire: "Siège provisoire",
};

export const siegesColumns = (onViewDetails) => [
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nom <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
    cell: ({ row }) => row.getValue("nom"),
  },
  {
    accessorKey: "adresse",
    header: "Adresse",
    cell: ({ row }) => row.getValue("adresse"),
  },
  {
    id: "membre",
    header: "Membre",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center">
          {user?.logo && (
            <img src={getLogoUrl(user.logo)} alt="Logo" className="w-6 h-6 rounded-full mr-2" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{user?.nomInstitution}</div>
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
    accessorKey: "latitude",
    header: "Latitude",
    cell: ({ row }) => row.original.latitude || "-",
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
    cell: ({ row }) => row.original.longitude || "-",
  },
  {
    accessorKey: "categorie",
    header: "Catégorie",
    cell: ({ row }) => {
      const cat = row.original.categorie;
      return CATEGORIE_LABELS[(cat || '').toLowerCase()] || cat || "-";
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date création",
    cell: ({ row }) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('fr-FR') : "-",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]; 