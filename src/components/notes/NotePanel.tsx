import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { AddIcon, EditIcon, DeleteIcon, SaveIcon, CancelIcon, ExternalLinkIcon } from '../ui/Icons';

export default function NotePanel() {
  const { selectedTrip, addNote, updateNote, removeNote } = useTripContext();
  const { isAuthorized } = useAuth();
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newLink, setNewLink] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editLink, setEditLink] = useState('');

  if (!selectedTrip) return null;

  const notes = selectedTrip.notes || [];

  const handleAdd = () => {
    if (!newText.trim()) return;
    addNote(selectedTrip.id, {
      text: newText.trim(),
      link: newLink.trim() || undefined,
    });
    setNewText('');
    setNewLink('');
    setAdding(false);
  };

  const startEditing = (note: { id: string; text: string; link?: string }) => {
    setEditingId(note.id);
    setEditText(note.text);
    setEditLink(note.link || '');
  };

  const handleSaveEdit = () => {
    if (!editingId || !editText.trim()) return;
    updateNote(selectedTrip.id, editingId, {
      text: editText.trim(),
      link: editLink.trim() || undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Notes</h3>
        {isAuthorized && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full hover:bg-green-600 transition-colors"
            title="Add Note"
          >
            <AddIcon size={11} />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {adding && (
        <div className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
          <input
            type="text" value={newText} onChange={e => setNewText(e.target.value)}
            placeholder="Note text"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="url" value={newLink} onChange={e => setNewLink(e.target.value)}
            placeholder="Link (optional)"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white rounded-full py-1.5 text-xs hover:bg-green-600 transition-colors">
              <AddIcon size={12} /> Add
            </button>
            <button onClick={() => { setAdding(false); setNewText(''); setNewLink(''); }}
              className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-600 rounded-full py-1.5 text-xs hover:bg-gray-300 transition-colors">
              <CancelIcon size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 && !adding ? (
        <p className="text-gray-400 text-xs text-center py-2">No notes yet.</p>
      ) : (
        <div className="space-y-1">
          {notes.map(note => (
            editingId === note.id ? (
              <div key={note.id} className="p-2 border border-gray-200 rounded text-xs space-y-2">
                <input value={editText} onChange={e => setEditText(e.target.value)}
                  placeholder="Note text"
                  className="w-full border border-gray-300 rounded px-2 py-1"
                  onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                />
                <input value={editLink} onChange={e => setEditLink(e.target.value)}
                  placeholder="Link (optional)"
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
                <div className="flex gap-1.5">
                  <button onClick={handleSaveEdit}
                    className="flex items-center gap-1 bg-cyan-500 text-white px-2.5 py-1 rounded-full hover:bg-cyan-600 transition-colors">
                    <SaveIcon size={11} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-300 transition-colors">
                    <CancelIcon size={11} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={note.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 group text-xs">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-purple-400" />
                <div className="flex-1 min-w-0">
                  {note.link ? (
                    <a href={note.link} target="_blank" rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1">
                      <span className="truncate">{note.text}</span>
                      <ExternalLinkIcon size={10} className="flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-gray-700 truncate">{note.text}</p>
                  )}
                </div>
                {isAuthorized && (
                  <div className="hidden group-hover:flex gap-1">
                    <button onClick={() => startEditing(note)}
                      className="p-1 rounded-full bg-cyan-50 text-cyan-500 hover:bg-cyan-100 transition-colors"
                      title="Edit">
                      <EditIcon size={10} />
                    </button>
                    <button onClick={() => removeNote(selectedTrip.id, note.id)}
                      className="p-1 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="Delete">
                      <DeleteIcon size={10} />
                    </button>
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
