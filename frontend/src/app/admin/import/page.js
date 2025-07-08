import AdminSidebar from '../../../components/AdminSidebar';
import CSVImportExport from '../../../components/CSVImportExport';
import CSVImportExportSiege from '../../../components/CSVImportExportSiege';

export default function AdminImportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-8">Import / Export CSV</h1>
          <div className="mb-8">
            <CSVImportExport />
          </div>
          <div>
            <CSVImportExportSiege />
          </div>
        </div>
      </main>
    </div>
  );
} 