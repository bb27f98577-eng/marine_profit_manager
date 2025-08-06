import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import BoxFilters from './components/BoxFilters';
import BoxStats from './components/BoxStats';
import BoxGrid from './components/BoxGrid';
import CreateBoxModal from './components/CreateBoxModal';
import EditBoxModal from './components/EditBoxModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import BoxProfitDistribution from './components/BoxProfitDistribution';
import Icon from '../../components/AppIcon';
import { financialBoxService } from '../../services/financialBoxService';

const FinancialBoxesManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [boxToDelete, setBoxToDelete] = useState(null);

  // New state for profit distribution
  const [profitDistributionBox, setProfitDistributionBox] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [statusFilter, setStatusFilter] = useState('all');

  // Error and success states
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Financial boxes data from Supabase
  const [boxes, setBoxes] = useState([]);

  // Add missing state variables
  const [editingBox, setEditingBox] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load financial boxes from Supabase
  const loadBoxes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await financialBoxService?.getAll();
      setBoxes(data);
    } catch (error) {
      console.error('Error loading financial boxes:', error);
      setError('فشل في تحميل الصناديق المالية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoxes();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Filter and sort boxes
  const filteredAndSortedBoxes = useMemo(() => {
    let filtered = boxes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered?.filter(box =>
        box?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        box?.captainName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        box?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered?.filter(box => box?.status === statusFilter);
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name, 'ar');
        case 'date':
          return new Date(b?.created_at) - new Date(a?.created_at);
        case 'amount':
          return (b?.total_amount || 0) - (a?.total_amount || 0);
        case 'status':
          return a?.status?.localeCompare(b?.status);
        case 'invoiceCount':
          return (b?.invoiceCount || 0) - (a?.invoiceCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [boxes, searchTerm, statusFilter, sortBy]);

  const handleCreateBox = async (newBoxData) => {
    try {
      setError(null);
      const createdBox = await financialBoxService?.create(newBoxData);
      setBoxes(prev => [createdBox, ...prev]);
      setSuccessMessage('تم إنشاء الصندوق المالي بنجاح');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating box:', error);
      setError('فشل في إنشاء الصندوق المالي. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSubmitCreate = async (formData) => {
    try {
      const newBox = await financialBoxService?.create(formData);
      
      // Assign crew members to the new box if selected
      if (formData?.selectedCrewMembers?.length > 0) {
        await financialBoxService?.assignCrewMembers(newBox?.id, formData?.selectedCrewMembers);
      }
      
      setBoxes((prev) => [newBox, ...prev]);
      setIsCreateModalOpen(false);
      
      setSuccessMessage('تم إنشاء الصندوق المالي بنجاح');
    } catch (error) {
      console.error('Error creating box:', error);
      setError('فشل في إنشاء الصندوق المالي. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleEditBox = (box) => {
    setSelectedBox(box);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (formData) => {
    try {
      setError(null);
      const updatedBox = await financialBoxService?.update(selectedBox?.id, formData);
      setBoxes(prev => prev?.map(box => 
        box?.id === selectedBox?.id ? updatedBox : box
      ));
      setSuccessMessage('تم تحديث الصندوق المالي بنجاح');
      setIsEditModalOpen(false);
      setSelectedBox(null);
    } catch (error) {
      console.error('Error updating box:', error);
      setError('فشل في تحديث الصندوق المالي. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDeleteBox = (boxId) => {
    const box = boxes?.find(b => b?.id === boxId);
    setBoxToDelete(box);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setError(null);
      await financialBoxService?.delete(boxToDelete?.id);
      setBoxes(prev => prev?.filter(box => box?.id !== boxToDelete?.id));
      setSuccessMessage('تم حذف الصندوق المالي بنجاح');
      setIsDeleteModalOpen(false);
      setBoxToDelete(null);
    } catch (error) {
      console.error('Error deleting box:', error);
      setError('فشل في حذف الصندوق المالي. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleViewBox = (boxId) => {
    // Navigate to invoice management with box filter
    navigate(`/invoice-management?boxId=${boxId}`);
  };

  const handleStatusChange = async (boxId, newStatus) => {
    try {
      setError(null);
      await financialBoxService?.updateStatus(boxId, newStatus);
      setBoxes(prev => prev?.map(box => 
        box?.id === boxId ? { ...box, status: newStatus } : box
      ));
      setSuccessMessage('تم تحديث حالة الصندوق بنجاح');
    } catch (error) {
      console.error('Error updating box status:', error);
      setError('فشل في تحديث حالة الصندوق. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleProfitDistribution = (box) => {
    setProfitDistributionBox(box);
  };

  const handleDistributionComplete = (distributionData) => {
    // Update box with distribution data
    setBoxes(prev => prev?.map(box => 
      box?.id === distributionData?.boxId 
        ? { ...box, last_distribution: distributionData?.timestamp, distribution_status: 'completed' }
        : box
    ));
    
    // Close profit distribution modal
    setProfitDistributionBox(null);
    setSuccessMessage('تم توزيع الأرباح بنجاح');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" dir="rtl">
      <Header 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="lg:mr-72 pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Modern Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Icon name="Briefcase" size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                  إدارة الصناديق المالية
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  نظام متطور لإدارة الصناديق المالية مع توزيع مستقل للأرباح
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400" />
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  كل صندوق مالي له نظام توزيع أرباح مستقل ومنفصل - إدارة محسنة وحديثة
                </p>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Icon name="CheckCircle" size={20} className="text-green-600 dark:text-green-400" />
                <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          <BoxStats boxes={boxes} />

          <BoxFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onCreateNew={() => setIsCreateModalOpen(true)}
          />

          <BoxGrid
            boxes={filteredAndSortedBoxes}
            loading={isLoading}
            onEdit={handleEditBox}
            onDelete={handleDeleteBox}
            onView={handleViewBox}
            onStatusChange={handleStatusChange}
            onProfitDistribution={handleProfitDistribution}
          />
        </div>
      </main>

      {/* Modals */}
      <CreateBoxModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBox}
      />

      <EditBoxModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBox(null);
        }}
        onSubmit={handleSubmitEdit}
        box={selectedBox}
        setError={setError}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBoxToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        boxName={boxToDelete?.name}
      />

      {/* New Profit Distribution Modal */}
      {profitDistributionBox && (
        <BoxProfitDistribution
          box={profitDistributionBox}
          onClose={() => setProfitDistributionBox(null)}
          onDistribute={handleDistributionComplete}
        />
      )}
    </div>
  );
};

export default FinancialBoxesManagement;