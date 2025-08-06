import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import CrewMemberCard from './components/CrewMemberCard';
import CrewSummaryPanel from './components/CrewSummaryPanel';
import AddCrewMemberModal from './components/AddCrewMemberModal';
import CrewTable from './components/CrewTable';
import DebtUpdateModal from './components/DebtUpdateModal';
import CrewMemberDetail from './components/CrewMemberDetail';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { crewService } from '../../services/crewService';

const ROLE_OPTIONS = [
  { value: 'all', label: 'جميع المناصب' },
  { value: 'captain', label: 'القباطنة فقط' },
  { value: 'crew', label: 'البحارة فقط' }
];

const useCrewManagement = () => {
  const [state, setState] = useState({
    sidebarOpen: false,
    sidebarCollapsed: false,
    viewMode: 'cards',
    searchTerm: '',
    roleFilter: 'all',
    isAddModalOpen: false,
    isDebtModalOpen: false,
    selectedMember: null,
    isDetailModalOpen: false,
    loading: true,
    error: null,
    showMobileSummary: false,
    crewData: []
  });

  const totalProfitDistribution = 50000;

  const loadCrewData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await crewService.getAll();
      setState(prev => ({ ...prev, crewData: data, loading: false }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err?.message || 'Failed to load crew data',
        loading: false
      }));
      console.error('Error loading crew data:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      loadCrewData();
    }

    return () => {
      isMounted = false;
    };
  }, [loadCrewData]);

  const filteredCrewData = useMemo(() => {
    return state.crewData.filter(member => {
      const matchesSearch = member?.name?.toLowerCase()?.includes(state.searchTerm?.toLowerCase());
      const matchesRole = state.roleFilter === 'all' || member?.role === state.roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [state.crewData, state.searchTerm, state.roleFilter]);

  const handleAddCrewMember = useCallback(async (newMember) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const createdMember = await crewService.create(newMember);
      setState(prev => ({
        ...prev,
        crewData: [createdMember, ...prev.crewData],
        loading: false,
        isAddModalOpen: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err?.message || 'Failed to add crew member',
        loading: false
      }));
      console.error('Error adding crew member:', err);
    }
  }, []);

  const handleEditCrewMember = useCallback(async (memberId, updatedData) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const updatedMember = await crewService.update(memberId, updatedData);
      setState(prev => ({
        ...prev,
        crewData: prev.crewData.map(member => 
          member?.id === memberId ? updatedMember : member
        ),
        loading: false,
        selectedMember: updatedMember
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err?.message || 'Failed to update crew member',
        loading: false
      }));
      console.error('Error updating crew member:', err);
    }
  }, []);

  const handleDeleteCrewMember = useCallback(async (memberId) => {
    const member = state.crewData.find(m => m?.id === memberId);
    if (!window.confirm(`هل أنت متأكد من حذف العضو "${member?.name}" نهائياً؟`)) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      await crewService.delete(memberId);
      setState(prev => ({
        ...prev,
        crewData: prev.crewData.filter(member => member?.id !== memberId),
        loading: false,
        isDetailModalOpen: prev.selectedMember?.id === memberId ? false : prev.isDetailModalOpen,
        selectedMember: prev.selectedMember?.id === memberId ? null : prev.selectedMember
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err?.message || 'Failed to delete crew member',
        loading: false
      }));
      console.error('Error deleting crew member:', err);
    }
  }, [state.crewData, state.selectedMember]);

  const handleDebtUpdate = useCallback(async (memberId, newDebtAmount, debtUpdate) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      if (debtUpdate) {
        await crewService.addDebt(memberId, debtUpdate);
      }

      const updatedMember = await crewService.getById(memberId);
      setState(prev => ({
        ...prev,
        crewData: prev.crewData.map(member => 
          member?.id === memberId ? updatedMember : member
        ),
        loading: false,
        isDebtModalOpen: false,
        selectedMember: prev.selectedMember?.id === memberId ? updatedMember : prev.selectedMember
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err?.message || 'Failed to update debt',
        loading: false
      }));
      console.error('Error updating debt:', err);
    }
  }, []);

  const openDebtModal = useCallback((memberId) => {
    const member = state.crewData.find(m => m?.id === memberId);
    setState(prev => ({
      ...prev,
      selectedMember: member,
      isDebtModalOpen: true
    }));
  }, [state.crewData]);

  const openMemberDetail = useCallback(async (memberId) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const member = await crewService.getById(memberId);
      const debtHistory = await crewService.getDebtHistory(memberId);

      setState(prev => ({
        ...prev,
        selectedMember: {
          ...member,
          debtHistory: debtHistory
        },
        isDetailModalOpen: true,
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err?.message || 'Failed to load member details',
        loading: false
      }));
      console.error('Error loading member details:', err);
    }
  }, []);

  return {
    ...state,
    totalProfitDistribution,
    filteredCrewData,
    ROLE_OPTIONS,
    setState,
    loadCrewData,
    handleAddCrewMember,
    handleEditCrewMember,
    handleDeleteCrewMember,
    handleDebtUpdate,
    openDebtModal,
    openMemberDetail
  };
};

const CrewManagement = () => {
  const {
    sidebarOpen,
    sidebarCollapsed,
    viewMode,
    searchTerm,
    roleFilter,
    isAddModalOpen,
    isDebtModalOpen,
    selectedMember,
    isDetailModalOpen,
    loading,
    error,
    showMobileSummary,
    crewData,
    filteredCrewData,
    totalProfitDistribution,
    ROLE_OPTIONS,
    setState,
    loadCrewData,
    handleAddCrewMember,
    handleEditCrewMember,
    handleDeleteCrewMember,
    handleDebtUpdate,
    openDebtModal,
    openMemberDetail
  } = useCrewManagement();

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setState(prev => ({ ...prev, sidebarOpen: false }));
    }
  }, [setState]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  if (loading && crewData.length === 0) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header
          onMenuToggle={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
          isMenuOpen={sidebarOpen}
        />
        <Sidebar
          isCollapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
        />
        <LoadingState message="جاري تحميل بيانات الطاقم..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header
          onMenuToggle={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
          isMenuOpen={sidebarOpen}
        />
        <Sidebar
          isCollapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
        />
        <ErrorState 
          error={error} 
          onRetry={loadCrewData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header
        onMenuToggle={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        isMenuOpen={sidebarOpen}
      />

      <Sidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
      />

      <main className={`transition-all duration-300 ease-smooth ${
        sidebarCollapsed ? 'lg:mr-16' : 'lg:mr-72'} pt-16 pb-20 lg:pb-8`
      }>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="block lg:hidden mb-4">
            <Breadcrumb />
          </div>
          
          <div className="hidden lg:block mb-6">
            <Breadcrumb />
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="AlertCircle" size={18} className="text-destructive shrink-0" />
                <p className="text-destructive font-medium text-sm sm:text-base">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, error: null }))}
                  className="mr-auto rtl:ml-auto shrink-0"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                إدارة الطاقم
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                إدارة أعضاء الطاقم وتتبع الديون وحساب حصص الأرباح
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 rtl:space-x-reverse lg:hidden">
              <Button
                variant="outline"
                size="default"
                onClick={() => setState(prev => ({ ...prev, showMobileSummary: !prev.showMobileSummary }))}
                iconName={showMobileSummary ? 'ChevronUp' : 'ChevronDown'}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                {showMobileSummary ? 'إخفاء الملخص' : 'عرض الملخص'}
              </Button>
              
              <Button
                variant="default"
                onClick={() => setState(prev => ({ ...prev, isAddModalOpen: true }))}
                iconName="UserPlus"
                iconPosition="right"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                إضافة عضو جديد
              </Button>
            </div>
            
            <div className="hidden lg:flex items-center space-x-3 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))}
                iconName={sidebarCollapsed ? 'PanelRightOpen' : 'PanelRightClose'}
              >
                {sidebarCollapsed ? 'توسيع' : 'تصغير'}
              </Button>
              
              <Button
                variant="default"
                onClick={() => setState(prev => ({ ...prev, isAddModalOpen: true }))}
                iconName="UserPlus"
                iconPosition="right"
                disabled={loading}
              >
                إضافة عضو جديد
              </Button>
            </div>
          </div>

          {showMobileSummary && (
            <div className="lg:hidden mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <CrewSummaryPanel
                  crewData={crewData}
                  totalProfitDistribution={totalProfitDistribution}
                />
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                <div className="w-full sm:w-80">
                  <Input
                    type="search"
                    placeholder="البحث عن عضو..."
                    value={searchTerm}
                    onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>
                
                <div className="w-full sm:w-48">
                  <Select
                    options={ROLE_OPTIONS}
                    value={roleFilter}
                    onChange={(value) => setState(prev => ({ ...prev, roleFilter: value }))}
                    placeholder="تصفية حسب المنصب"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'table' }))}
                  iconName="Table"
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">جدول</span>
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'cards' }))}
                  iconName="Grid3X3"
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">بطاقات</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-2">
              {viewMode === 'table' ? (
                <>
                  <div className="hidden sm:block">
                    <CrewTable
                      crewData={filteredCrewData}
                      onEdit={handleEditCrewMember}
                      onDelete={handleDeleteCrewMember}
                      onDebtUpdate={openDebtModal}
                      onMemberClick={openMemberDetail}
                      loading={loading}
                    />
                  </div>
                  
                  <div className="sm:hidden">
                    <div className="space-y-3">
                      {filteredCrewData.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => openMemberDetail(member.id)}
                          className="bg-card border border-border rounded-lg p-4 cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                member.role === 'captain' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                              }`}>
                                <Icon name={member.role === 'captain' ? 'Crown' : 'User'} size={18} />
                              </div>
                              <div>
                                <h3 className="text-base font-medium text-foreground">{member.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  member.role === 'captain' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                                }`}>
                                  {member.role === 'captain' ? 'قبطان' : 'بحار'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">الدين الحالي</span>
                                <span className={`font-medium ${
                                  member.debt > 0 ? 'text-destructive' : 'text-success'
                                }`}>
                                  {new Intl.NumberFormat('ar-SA', {
                                    style: 'currency',
                                    currency: 'SAR',
                                    minimumFractionDigits: 2
                                  }).format(member.debt)}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">الحصة النهائية</span>
                                <span className="font-medium text-primary">
                                  {new Intl.NumberFormat('ar-SA', {
                                    style: 'currency',
                                    currency: 'SAR',
                                    minimumFractionDigits: 2
                                  }).format(member.finalShare)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredCrewData.length === 0 && !loading && (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="Users" size={32} className="text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchTerm || roleFilter !== 'all' ? 'لا توجد نتائج' : 'لا يوجد أعضاء في الطاقم'}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            {searchTerm || roleFilter !== 'all' ? 'جرب تغيير معايير البحث أو التصفية' : 'ابدأ بإضافة أعضاء جدد لإدارة الطاقم والأرباح'}
                          </p>
                          {!searchTerm && roleFilter === 'all' && (
                            <Button
                              variant="default"
                              onClick={() => setState(prev => ({ ...prev, isAddModalOpen: true }))}
                              iconName="UserPlus"
                              iconPosition="right"
                            >
                              إضافة عضو جديد
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                  {filteredCrewData.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => openMemberDetail(member.id)}
                      className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
                    >
                      <CrewMemberCard
                        member={member}
                        onEdit={handleEditCrewMember}
                        onDelete={handleDeleteCrewMember}
                        onDebtUpdate={openDebtModal}
                        clickable={true}
                      />
                    </div>
                  ))}
                  
                  {filteredCrewData.length === 0 && !loading && (
                    <div className="col-span-full p-8 sm:p-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Users" size={32} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm || roleFilter !== 'all' ? 'لا توجد نتائج' : 'لا يوجد أعضاء في الطاقم'}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base mb-4">
                        {searchTerm || roleFilter !== 'all' ? 'جرب تغيير معايير البحث أو التصفية' : 'ابدأ بإضافة أعضاء جدد لإدارة الطاقم والأرباح'}
                      </p>
                      {!searchTerm && roleFilter === 'all' && (
                        <Button
                          variant="default"
                          onClick={() => setState(prev => ({ ...prev, isAddModalOpen: true }))}
                          iconName="UserPlus"
                          iconPosition="right"
                        >
                          إضافة عضو جديد
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden xl:block xl:col-span-1">
              <CrewSummaryPanel
                crewData={crewData}
                totalProfitDistribution={totalProfitDistribution}
              />
            </div>
          </div>
        </div>
      </main>
      
      <AddCrewMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setState(prev => ({ ...prev, isAddModalOpen: false }))}
        onAdd={handleAddCrewMember}
      />

      <DebtUpdateModal
        isOpen={isDebtModalOpen}
        onClose={() => setState(prev => ({ ...prev, isDebtModalOpen: false }))}
        member={selectedMember}
        onUpdate={handleDebtUpdate}
      />

      {isDetailModalOpen && selectedMember && (
        <CrewMemberDetail
          member={selectedMember}
          onClose={() => setState(prev => ({ ...prev, isDetailModalOpen: false }))}
          onUpdateMember={handleEditCrewMember}
          onDeleteMember={handleDeleteCrewMember}
          crewService={crewService}
        />
      )}
    </div>
  );
};

export default React.memo(CrewManagement);