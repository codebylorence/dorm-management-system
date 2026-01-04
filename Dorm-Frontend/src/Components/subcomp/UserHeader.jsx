import { useAuth } from '../../context/AuthContext';

const UserHeader = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleDisplay = (role) => {
    return role === 'admin' ? 'Administrator' : 'Staff Member';
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {user.fullName}
            </h2>
            <p className={`text-sm font-medium ${getRoleColor(user.role)}`}>
              {getRoleDisplay(user.role)}
            </p>
          </div>
        </div>
        
        <div className="text-right text-sm text-gray-500">
          <div>Logged in as: {user.username}</div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;