import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CrewMemberCard = ({ member, onEdit, onDelete, onDebtUpdate, clickable = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: member?.name,
    role: member?.role,
    debt: member?.debt
  });

  const handleSave = () => {
    onEdit(member?.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: member?.name,
      role: member?.role,
      debt: member?.debt
    });
    setIsEditing(false);
  };

  const handleDelete = (e) => {
    e?.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف العضو "${member?.name}" نهائياً؟ سيتم حذف جميع بيانات الديون المرتبطة به.`)) {
      onDelete(member?.id);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCardClick = (e) => {
    // Prevent card click when clicking on action buttons
    if (e?.target?.closest('button') || isEditing) return;
    // Card click handler will be handled by parent component
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg p-3 sm:p-4 transition-all duration-200 ${
      clickable ?
      'hover:elevation-2 hover:border-primary/30 cursor-pointer' : 'hover:elevation-1'}`
      }
      onClick={clickable ? handleCardClick : undefined}>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
          member?.role === 'captain' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`
          }>
            <Icon name={member?.role === 'captain' ? 'Crown' : 'User'} size={16} sm:size={20} className="border-[rgba(255,251,240,1)]" />
          </div>
          
          <div className="min-w-0 flex-1">
            {isEditing ?
            <Input
              type="text"
              value={editData?.name}
              onChange={(e) => setEditData({ ...editData, name: e?.target?.value })}
              className="text-sm sm:text-base font-medium mb-1"
              onClick={(e) => e?.stopPropagation()} /> :


            <h3 className="text-sm sm:text-base font-medium text-foreground truncate">{member?.name}</h3>
            }
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              member?.role === 'captain' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`
              }>
                {member?.role === 'captain' ? 'قبطان' : 'بحار'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse shrink-0">
          {isEditing ?
          <>
              <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e?.stopPropagation();
                handleSave();
              }}
              className="h-6 w-6 sm:h-8 sm:w-8">

                <Icon name="Check" size={14} sm:size={16} />
              </Button>
              <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e?.stopPropagation();
                handleCancel();
              }}
              className="h-6 w-6 sm:h-8 sm:w-8">

                <Icon name="X" size={14} sm:size={16} />
              </Button>
            </> :

          <>
              <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e?.stopPropagation();
                setIsEditing(true);
              }}
              className="h-6 w-6 sm:h-8 sm:w-8">

                <Icon name="Edit2" size={14} sm:size={16} />
              </Button>
              <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-6 w-6 sm:h-8 sm:w-8 text-destructive hover:text-destructive">

                <Icon name="Trash2" size={14} sm:size={16} />
              </Button>
            </>
          }
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">الدين الحالي</span>
            <span className={`text-xs sm:text-sm font-medium ${
            member?.debt > 0 ? 'text-destructive' : 'text-success'}`
            }>
              {formatCurrency(member?.debt)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">تاريخ الانضمام</span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {formatDate(member.joinDate)}
            </span>
          </div>
        </div>
      </div>
      
      {clickable &&
      <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-center">
            <span className="text-xs text-primary font-medium flex items-center space-x-1 rtl:space-x-reverse">
              <Icon name="MousePointer2" size={14} />
              <span>اضغط لإدارة الديون</span>
            </span>
          </div>
        </div>
      }
      
      {!clickable && member?.debt > 0 &&
      <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <span className="text-xs text-muted-foreground">
              آخر تحديث للدين: {formatDate(member.lastDebtUpdate)}
            </span>
            <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e?.stopPropagation();
              onDebtUpdate(member?.id);
            }}
            iconName="Calculator"
            iconPosition="right"
            className="text-xs w-full sm:w-auto">

              تحديث الدين
            </Button>
          </div>
        </div>
      }
    </div>);
};

export default CrewMemberCard;