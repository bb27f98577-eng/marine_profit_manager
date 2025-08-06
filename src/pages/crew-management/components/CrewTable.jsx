import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CrewTable = ({ crewData, onEdit, onDelete, onDebtUpdate, onMemberClick, loading }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...crewData].sort((a, b) => {
    let aVal = a?.[sortField];
    let bVal = b?.[sortField];
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const handleSelectMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedMembers(selectedMembers.length === crewData.length ? [] : crewData.map((m) => m.id));
  };

  const handleDeleteSingle = (id, name) => {
    if (window.confirm(`هل تريد حذف "${name}" مع ديونه؟`)) onDelete(id);
  };

  const handleDeleteSelected = async () => {
    if (
      window.confirm(`هل تريد حذف ${selectedMembers.length} عضو مع ديونهم؟`)
    ) {
      for (const id of selectedMembers) {
        await onDelete(id);
      }
      setSelectedMembers([]);
    }
  };

  // عند بدء التعديل نملأ الحقل باسم العضو الحالي
  const startEditing = (member) => {
    setEditingId(member.id);
    setEditName(member.name);
  };

  // حفظ التعديل، يستدعي دالة onEdit مع الاسم الجديد
  const saveEdit = (id) => {
    if (editName.trim() === '') {
      alert('الاسم لا يمكن أن يكون فارغاً');
      return;
    }
    onEdit(id, { name: editName.trim() });
    setEditingId(null);
    setEditName('');
  };

  // إلغاء التعديل
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {selectedMembers.length > 0 && (
        <div className="p-3 bg-primary/5 border-b flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>تم تحديد {selectedMembers.length} عضو</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => selectedMembers.forEach(id => onDebtUpdate(id))}>
              <Icon name="Calculator" size={16} /> تحديث الدين
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
              <Icon name="Trash2" size={16} /> حذف
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-right">
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={selectedMembers.length === crewData.length && crewData.length > 0}
                  onChange={handleSelectAll}
                  disabled={loading}
                />
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('name')}>اسم</th>
              <th className="p-2 hidden sm:table-cell cursor-pointer" onClick={() => handleSort('debt')}>الدين</th>
              <th className="p-2 hidden md:table-cell cursor-pointer" onClick={() => handleSort('role')}>المنصب</th>
              <th className="p-2 hidden lg:table-cell cursor-pointer" onClick={() => handleSort('finalShare')}>الحصة النهائية</th>
              <th className="p-2">...</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((member) => (
              <tr
                key={member.id}
                className="border-b hover:bg-muted/30 transition cursor-pointer"
                onClick={() => onMemberClick?.(member.id)}
              >
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    disabled={loading}
                  />
                </td>
                <td className="p-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={member.role === 'captain' ? 'Crown' : 'User'}
                      size={18}
                      className={member.role === 'captain' ? 'text-primary' : 'text-secondary'}
                    />
                    {editingId === member.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(member.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="border px-1 rounded text-black"
                        autoFocus
                      />
                    ) : (
                      <span>{member.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">ID: {member.id.slice(0, 6)}</p>
                </td>
                <td className="p-2 hidden sm:table-cell font-medium">
                  <span
                    className={member.debt > 0 ? 'text-destructive' : 'text-success'}
                  >
                    {formatCurrency(member.debt)}
                  </span>
                </td>
                <td className="p-2 hidden md:table-cell">
                  {member.role === 'captain' ? 'قبطان' : 'بحار'}
                </td>
                <td className="p-2 hidden lg:table-cell text-primary font-semibold">
                  {formatCurrency(member.finalShare)}
                </td>
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {editingId === member.id ? (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => saveEdit(member.id)}>
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}>
                          <Icon name="X" size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => startEditing(member)}>
                          <Icon name="Edit2" size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => onDebtUpdate(member.id)}>
                          <Icon name="Calculator" size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteSingle(member.id, member.name)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && crewData.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm">
          <Icon name="Users" size={32} className="mx-auto mb-2" />
          لا يوجد أعضاء في الطاقم
        </div>
      )}

      {loading && (
        <div className="p-8 text-center text-muted-foreground text-sm">
          <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
          جاري تحميل البيانات...
        </div>
      )}
    </div>
  );
};

export default CrewTable;
