"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { GET_MY_PARCELLES, CREATE_PARCELLE, DELETE_PARCELLE, TOKEN_AUTH_WITH_USER } from "../lib/graphql-queries";
import { useToast } from "../lib/useToast";
import AuthForm from "../components/AuthForm";
import ParcelleForm from "../components/ParcelleForm";
import { Edit, Trash, Plus} from "lucide-react";
import { useAuth } from "../components/Providers";
import CSVImportExport from "../components/CSVImportExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import ParcellesMap from "../components/ParcellesMap";
import { ChevronDown } from "lucide-react";

export default function HomePage() {
  // Colonnes du tableau
  const columns = [
    { key: "nom", label: "Site de référence" },
    { key: "culture", label: "Culture" },
    { key: "proprietaire", label: "Propriétaire" },
    { key: "superficie", label: "Superficie" },
    { key: "variete", label: "Variété" },
    { key: "typeSol", label: "Type de sol" },
    { key: "irrigation", label: "Irrigation" },
    { key: "certificationBio", label: "Bio" },
    { key: "certificationHve", label: "HVE" },
    { key: "notes", label: "Notes" },
  ];
  const { user, isAuthenticated, login, logout, isLoading, isLoggingOut } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [showMapModal, setShowMapModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [tokenAuth] = useMutation(TOKEN_AUTH_WITH_USER);

  // Queries
  const { data: parcellesData, loading: parcellesLoading, refetch: refetchParcelles } = useQuery(GET_MY_PARCELLES, { skip: !isAuthenticated });
  const [createParcelle] = useMutation(CREATE_PARCELLE);
  const [deleteParcelle] = useMutation(DELETE_PARCELLE);

  // Filtrage et pagination
  const filteredParcelles = useMemo(() => {
    let data = parcellesData?.myParcelles || [];
    if (search) {
      data = data.filter(p =>
        (p.nom || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.culture || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.proprietaire || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [parcellesData?.myParcelles, search]);

  const paginatedParcelles = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredParcelles.slice(start, start + rowsPerPage);
  }, [filteredParcelles, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredParcelles.length / rowsPerPage);

  // Auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  // Handlers d'authentification pour AuthForm
  const handleLogin = async ({ username, password }) => {
    const { data } = await tokenAuth({ variables: { username, password } });
    if (data?.tokenAuthWithUser?.token && data?.tokenAuthWithUser?.user) {
      login(data.tokenAuthWithUser.user, data.tokenAuthWithUser.token);
    } else {
      throw new Error(data?.tokenAuthWithUser?.message || "Erreur de connexion");
    }
  };
  const handleRegister = async (userData) => {
    // À adapter selon ta logique d'inscription
    throw new Error('Inscription non implémentée');
  };
  if (!isAuthenticated || !user) {
    return (
      <AuthForm 
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={isLoading}
      />
    );
  }

  // Handlers
  const handleEditParcelle = (parcelle) => {
    setEditingParcelle(parcelle);
    setShowForm(true);
  };
  const handleDeleteParcelle = async (id) => {
    try {
      const { data } = await deleteParcelle({ variables: { id } });
      if (data.deleteParcelle.success) {
        showSuccess("Site de référence supprimé avec succès");
        refetchParcelles();
      } else {
        showError(data.deleteParcelle.message);
      }
    } catch (error) {
      showError("Erreur lors de la suppression");
    }
    setDeleteId(null);
  };
  const handleParcelleSuccess = () => {
    setShowForm(false);
    setEditingParcelle(null);
    refetchParcelles();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Mes sites de référence</h1>
            <p className="text-gray-600">Gérez vos sites de référence facilement.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter un site
            </Button>
            <Button variant="outline" onClick={() => setShowCSVModal(true)}>
                      Import/Export CSV
            </Button>
            <Button variant="outline" onClick={() => setShowMapModal(true)}>
              Voir la carte
            </Button>
          </div>
        </div>
        {/* Barre de recherche, filtre colonnes et pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Colonnes <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                      {columns.map(col => (
                  <DropdownMenuItem key={col.key} asChild>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                            checked={visibleColumns.includes(col.key)}
                        onCheckedChange={value => setVisibleColumns(v => value ? [...v, col.key] : v.filter(k => k !== col.key))}
                        aria-label={col.label}
                          />
                          {col.label}
                        </label>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-gray-500">{filteredParcelles.length} résultat(s)</span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className="border border-gray-300 px-2 py-1 rounded-md text-sm">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
            <span className="text-sm text-gray-500">par page</span>
                </div>
              </div>
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selected.length === paginatedParcelles.length && paginatedParcelles.length > 0}
                    onCheckedChange={value => setSelected(value ? paginatedParcelles.map(p => p.id) : [])}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                    {visibleColumns.map(colKey => {
                      const col = columns.find(c => c.key === colKey);
                  return <TableHead key={colKey}>{col?.label}</TableHead>;
                })}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedParcelles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 2} className="text-center py-8 text-gray-400">Aucun site de référence trouvé.</TableCell>
                </TableRow>
              ) : (
                paginatedParcelles.map(parcelle => (
                  <TableRow key={parcelle.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(parcelle.id)}
                        onCheckedChange={value => setSelected(value ? [...selected, parcelle.id] : selected.filter(id => id !== parcelle.id))}
                        aria-label="Sélectionner la ligne"
                      />
                    </TableCell>
                      {visibleColumns.map(colKey => (
                      <TableCell key={colKey}>
                        {colKey === "superficie"
                          ? parcelle.superficie ? `${parcelle.superficie} ha` : "-"
                          : colKey === "irrigation"
                          ? parcelle.irrigation ? "Oui" : "Non"
                          : colKey === "certificationBio"
                          ? parcelle.certificationBio ? "Oui" : ""
                          : colKey === "certificationHve"
                          ? parcelle.certificationHve ? "Oui" : ""
                          : parcelle[colKey]}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEditParcelle(parcelle)} title="Modifier">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" title="Supprimer">
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce site de référence ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Voulez-vous vraiment supprimer ce site ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteParcelle(parcelle.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
            </div>
            {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
                Page {page} sur {totalPages}
              </div>
              <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Précédent
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              Suivant
            </Button>
          </div>
        </div>
      </div>
      {/* Modal d'ajout/édition */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditingParcelle(null); }}>
        <DialogContent className="max-w-[600px] w-full p-0 sm:p-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white px-6 pt-6 pb-2 border-b">
            <DialogTitle>{editingParcelle ? "Modifier le site de référence" : "Ajouter un site de référence"}</DialogTitle>
            <DialogDescription>
              {editingParcelle ? "Modifiez les informations du site." : "Remplissez le formulaire pour ajouter un nouveau site."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-4 flex-1">
              <ParcelleForm
                parcelle={editingParcelle}
                onSuccess={handleParcelleSuccess}
                onCancel={() => { setShowForm(false); setEditingParcelle(null); }}
              parcellesCount={parcellesData?.myParcelles?.length || 0}
              />
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal Import/Export CSV */}
      <Dialog open={showCSVModal} onOpenChange={setShowCSVModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import/Export CSV</DialogTitle>
            <DialogDescription>
              Importez ou exportez vos sites de référence au format CSV.
            </DialogDescription>
          </DialogHeader>
            <CSVImportExport onImportSuccess={() => { setShowCSVModal(false); refetchParcelles(); }} />
        </DialogContent>
      </Dialog>
      {/* Modal Voir la carte */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle>Carte de mes sites de référence</DialogTitle>
          </DialogHeader>
          <div className="h-[60vh] w-full">
            <ParcellesMap parcelles={filteredParcelles} sieges={[]} pepinieres={[]} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}