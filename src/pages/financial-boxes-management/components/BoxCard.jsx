import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatCurrencyEnglish, formatDateEnglish } from '../../../utils/localization';

const BoxCard = ({ box, onEdit, onDelete, onView, onStatusChange, showProfitDistribution, setShowProfitDistribution }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20';
      case 'draft':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/20';
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-slate-500/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'draft':
        return 'مسودة';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'غير محدد';
    }
  };

  const formatCurrency = (amount) => {
    return formatCurrencyEnglish(amount || 0);
  };

  const formatDate = (date) => {
    return formatDateEnglish(date);
  };

  const handleDropdownAction = (action, event) => {
    event?.stopPropagation();
    setShowDropdown(false);

    switch (action) {
      case 'view':
        onView?.(box?.id);
        break;
      case 'edit':
        onEdit?.(box);
        break;
      case 'delete':
        onDelete?.(box?.id);
        break;
      default:
        break;
    }
  };

  return (
    <div className="group relative">
      {/* Main Card */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-500 cursor-pointer group-hover:scale-[1.02] backdrop-blur-sm">
        
        {/* Modern Header with Gradient */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1" onClick={() => handleDropdownAction('view')}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 animate-pulse"></div>
              <h3 className="text-xl font-heading font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-teal-600 transition-all duration-300">
                {box?.name}
              </h3>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-slate-500 dark:text-slate-400">
              <Icon name="Calendar" size={16} className="text-blue-500" />
              <span>آخر فاتورة: {box?.lastBillDate ? formatDate(box?.lastBillDate) : 'لا توجد فواتير'}</span>
            </div>
          </div>

          {/* Modern Actions Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e?.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="opacity-60 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">

              <Icon name="MoreVertical" size={18} />
            </Button>

            {showDropdown &&
            <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 py-2 z-20 animate-fade-in">
                <button
                onClick={(e) => handleDropdownAction('view', e)}
                className="w-full px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between rounded-xl mx-1">

                  <span>عرض التفاصيل</span>
                  <Icon name="Eye" size={16} className="text-blue-500" />
                </button>
                
                <button
                onClick={(e) => handleDropdownAction('edit', e)}
                className="w-full px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-between rounded-xl mx-1">

                  <span>تعديل</span>
                  <Icon name="Edit" size={16} className="text-amber-500" />
                </button>
                
                <div className="border-t border-slate-200/60 dark:border-slate-700/60 my-2 mx-2"></div>
                
                <button
                onClick={(e) => handleDropdownAction('delete', e)}
                className="w-full px-4 py-3 text-right text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-between rounded-xl mx-1">

                  <span>حذف</span>
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            }
          </div>
        </div>

        {/* Modern Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${getStatusColor(box?.status)}`}>
            <div className="w-2 h-2 rounded-full bg-white/80 ml-2 animate-pulse"></div>
            {getStatusLabel(box?.status)}
          </span>
        </div>

        {/* Modern Statistics Grid */}
        <div className="space-y-4" onClick={() => handleDropdownAction('view')}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                <Icon name="DollarSign" size={18} className="text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">إجمالي المبلغ</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              {formatCurrency(box?.totalAmount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="FileText" size={16} className="text-emerald-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">الفواتير</span>
              </div>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{box?.invoiceCount || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="Users" size={16} className="text-purple-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">الطاقم</span>
              </div>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{box?.crewCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Modern Profit Distribution Panel */}
        {showProfitDistribution &&
        <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200/60 dark:border-slate-600/60 animate-fade-in">
            <h4 className="text-lg font-heading font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <Icon name="TrendingUp" size={20} className="ml-2 text-emerald-500" />
              توزيع أرباح الصندوق
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">إجمالي الأرباح المتاحة</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency((box?.totalAmount || 0) * 0.7)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">نصيب المالك (50%)</span>
                <span className="text-md font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency((box?.totalAmount || 0) * 0.35)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">حصة الطاقم (50%)</span>
                <span className="text-md font-semibold text-teal-600 dark:text-teal-400">
                  {formatCurrency((box?.totalAmount || 0) * 0.35)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2 rtl:space-x-reverse">
              <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg shadow-lg shadow-emerald-500/25"
              onClick={(e) => {
                e?.stopPropagation();
                // Navigate to box-specific profit distribution
                window.location.href = `/profit-distribution?boxId=${box?.id}`;
              }}>

                <Icon name="Calculator" size={16} className="ml-2" />
                حساب التوزيع
              </Button>
              
              <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                setShowProfitDistribution(false);
              }}
              className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">

                إغلاق
              </Button>
            </div>
          </div>
        }
      </div>
    </div>);

};

export default BoxCard;