import { useQuery } from '@apollo/client';
import { GET_ALL_USERS, GET_ALL_PARCELLES, GET_MY_SIEGES } from '../../lib/graphql-queries';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboardPage() {
  const { data: usersData } = useQuery(GET_ALL_USERS);
  const { data: parcellesData } = useQuery(GET_ALL_PARCELLES);
  const { data: siegesData } = useQuery(GET_MY_SIEGES);
  const users = usersData?.allUsers || [];
  const parcelles = parcellesData?.allParcelles || [];
  const sieges = siegesData?.mySieges || [];

  const stats = [
    { label: 'Utilisateurs', value: users.length },
    { label: 'Parcelles', value: parcelles.length },
    { label: 'Sièges', value: sieges.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-blue-900 mb-10">Tableau de bord</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-blue-50">
                <div className="text-4xl font-extrabold text-blue-900 mb-2">{stat.value}</div>
                <div className="text-lg font-medium text-gray-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 