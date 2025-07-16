import React from 'react';
import ParcelleForm from './ParcelleForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ParcelleModal = ({ open, onClose, parcelle = null, onSuccess }) => {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose && onClose(); }}>
      <DialogContent className="max-w-[600px] w-full p-0 sm:p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-white px-6 pt-6 pb-2 border-b">
          <DialogTitle>{parcelle ? 'Modifier le site de référence' : 'Ajouter un nouveau site de référence'}</DialogTitle>
          <DialogDescription>
            {parcelle ? 'Modifiez les informations du site.' : 'Remplissez le formulaire pour ajouter un nouveau site.'}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <ParcelleForm
            parcelle={parcelle}
            onSuccess={parcelle => {
              onSuccess && onSuccess(parcelle);
              onClose && onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParcelleModal; 