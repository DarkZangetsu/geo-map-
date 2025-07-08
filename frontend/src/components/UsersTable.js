import React from 'react';

const UsersTable = ({ users }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2 whitespace-nowrap">{user.firstName} {user.lastName}</td>
              <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
              <td className="px-4 py-2 whitespace-nowrap">{user.role}</td>
              <td className="px-4 py-2 whitespace-nowrap">{user.dateJoined ? new Date(user.dateJoined).toLocaleDateString('fr-FR') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable; 