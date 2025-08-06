import React from 'react';
import BoxCard from './BoxCard';
import Icon from '../../../components/AppIcon';

const BoxGrid = ({ boxes, loading, onEdit, onDelete, onView, onStatusChange, onProfitDistribution }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)]?.map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 h-80">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded-lg mb-2 w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-lg"></div>
              </div>
              <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded-full w-24 mb-6"></div>
              <div className="space-y-4">
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!boxes || boxes?.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="Briefcase" size={48} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-slate-600 dark:text-slate-300 mb-2">
          لا توجد صناديق مالية
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          لم يتم العثور على أي صناديق مالية. ابدأ بإنشاء صندوق جديد لإدارة أموالك.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {boxes?.map((box) => (
        <BoxCard
          key={box?.id}
          box={box}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onStatusChange={onStatusChange}
          onProfitDistribution={onProfitDistribution}
        />
      ))}
    </div>
  );
};

export default BoxGrid;