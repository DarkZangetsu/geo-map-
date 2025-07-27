import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getLogoUrl } from '../../lib/utils';

// Ajout du mapping pour les pratiques
const PRATIQUE_LABELS = {
  structure_brise_vent: "Structure Brise-vent",
  structure_pare_feu: "Structure Pare feu",
  structures_antierosives: "Structures antiérosives",
  structure_cultures_couloir: "Structure Cultures en Couloir/allée",
  pratiques_taillage_coupe: "Pratiques de taillage, coupe et application engrais verts",
  pratiques_couverture_sol: "Pratiques couverture du sol",
  pratiques_conservation_eau: "Pratiques/structures conservation d'eau",
  systeme_multi_etage: "Système multi-étage diversifié",
  arbres_autochtones: "Arbres Autochtones",
  production_epices: "Production épices",
  production_bois_energie: "Production Bois énergie",
  production_fruit: "Production fruit",
  integration_cultures_vivrieres: "Intégration cultures vivrières",
  integration_elevage: "Intégration d'élevage",
};

export const parcellesColumns = (onViewDetails) => [
  {
    accessorKey: "Nom site de référence",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nom site de référence <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.nom}</div>
    ),
  },
  {
    accessorKey: "Personne Référente",
    header: "Personne référente",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div>
          <div className="text-sm font-medium">{p.nomPersonneReferente || '-'}</div>
          <div className="text-xs text-gray-500">{p.poste || '-'}</div>
          <div className="text-xs text-gray-500">{p.telephone || '-'}</div>
          <div className="text-xs text-gray-500">{p.email || '-'}</div>
        </div>
      );
    },
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
    accessorKey: "Abreviation",
    header: () => <div className="text-center">Abréviation</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.user?.abreviation || "-"}</div>
    ),
  },
  {
    accessorKey: "superficie",
    header: () => <div className="text-center">Superficie (ha)</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.superficie ? `${row.original.superficie} ha` : "-"}</div>
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