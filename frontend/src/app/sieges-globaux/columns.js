
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getLogoUrl } from '../../lib/utils';
import SiegeDetailModal from "@/components/SiegeDetailModal";
import SiegeMapModal from "@/components/SiegeMapModal";
import { useState } from 'react';

// Composant pour les actions avec le modal
const ActionCell = ({ row, onViewDetails, onViewMap }) => {
  const [showModal, setShowModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
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
          <DropdownMenuItem onClick={() => setShowMapModal(true)}>
            Voir sur la carte
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
      {showMapModal && (
        <SiegeMapModal
          open={showMapModal}
          siege={row.original}
          onClose={() => setShowMapModal(false)}
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

export const siegesColumns = (onViewDetails, onViewMap) => [
  {
    accessorKey: "Nom du local",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nom du local <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.nom}</div>
    ),
  },
  {
    accessorKey: "Adresse",
    header: () => <div className="text-center">Adresse</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.adresse}</div>
    ),
  },
   {
    accessorKey: "Projet rattaché",
    header: () => <div className="text-center">Projet rattaché</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.nomProjet || "-"}</div>
    ),
  },
  {
    id: "Institutions",
    header: "Institutions",
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
    accessorKey: "Latitude",
    header: () => <div className="text-center">Latitude</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.latitude || "-"}</div>
    ),
  },
  {
    accessorKey: "Longitude",
    header: () => <div className="text-center">Longitude</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.longitude || "-"}</div>
    ),
  },
  {
    accessorKey: "Catégorie",
    header: () => <div className="text-center">Catégorie</div>,
    cell: ({ row }) => {
      const cat = row.original.categorie;
      return <div className="text-center">{CATEGORIE_LABELS[(cat || '').toLowerCase()] || cat || "-"}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionCell row={row} onViewDetails={onViewDetails} onViewMap={onViewMap} />,
    enableSorting: false,
    enableHiding: false,
  },
]; 