import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LockIcon, CancelIcon } from '../ui/Icons';

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-72 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-blue-50 text-blue-500">
            <LockIcon size={18} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Enter Password</h2>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          placeholder="Password"
          className={`w-full border rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mb-3">Wrong password. Try again.</p>}
        <div className="flex gap-2">
          <button type="submit"
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-full py-2 text-sm hover:bg-blue-700 transition-colors">
            <LockIcon size={13} /> Unlock
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 rounded-full py-2 text-sm hover:bg-gray-200 transition-colors">
            <CancelIcon size={13} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
