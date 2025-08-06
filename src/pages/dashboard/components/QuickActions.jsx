import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'create-box',
      title: 'إنشاء صندوق جديد',
      description: 'إنشاء صندوق مالي جديد لتنظيم الفواتير',
      icon: 'Plus',
      color: 'primary',
      path: '/financial-boxes-management/create'
    },
    {
      id: 'add-invoice',
      title: 'إضافة فاتورة',
      description: 'إضافة فاتورة جديدة إلى أحد الصناديق',
      icon: 'FileText',
      color: 'secondary',
      path: '/invoice-management/new'
    },
    {
      id: 'manage-crew',
      title: 'إدارة الطاقم',
      description: 'إضافة أو تعديل بيانات أعضاء الطاقم',
      icon: 'Users',
      color: 'accent',
      path: '/crew-management'
    },
    {
      id: 'view-reports',
      title: 'عرض التقارير',
      description: 'مراجعة تقارير الأرباح والمدفوعات',
      icon: 'BarChart3',
      color: 'success',
      path: '/reports'
    }
  ];

  const handleActionClick = (path) => {
    navigate(path);
  };

  const handleSettingsClick = () => {
    // تأكد من أن هذا المسار مطابق لما في router الخاص بك
    navigate('/settings'); 
  };

  const handleHelpClick = () => {
    navigate('/help-center'); 
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-6">الإجراءات السريعة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <div 
              key={action.id}
              onClick={() => handleActionClick(action.path)}
              className={`group border border-border rounded-lg p-4 cursor-pointer transition-all hover:border-${action.color} hover:shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${action.color}/10 text-${action.color} mb-3`}>
                  <Icon name={action.icon} size={20} />
                </div>
                <Icon 
                  name="ArrowLeft" 
                  size={18} 
                  className={`text-muted-foreground group-hover:text-${action.color} transition-colors`} 
                />
              </div>
              
              <h4 className="font-medium text-foreground mb-1">
                {action.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettingsClick}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Icon name="Settings" size={18} />
            <span>الإعدادات</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpClick}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Icon name="HelpCircle" size={18} />
            <span>مركز المساعدة</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;