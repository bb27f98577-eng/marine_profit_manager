import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import InvoiceSummaryCards from './components/InvoiceSummaryCards';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceTable from './components/InvoiceTable';
import InvoiceFormModal from './components/InvoiceFormModal';
import ProfitCalculator from './components/ProfitCalculator';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { invoiceService } from '../../services/invoiceService';
import { financialBoxService } from '../../services/financialBoxService';

const InvoiceManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boxSettings, setBoxSettings] = useState(null);
  const [availableBoxes, setAvailableBoxes] = useState([]);

  // Get selected box from URL params
  const selectedBoxId = searchParams?.get('boxId');
  const selectedBoxName = searchParams?.get('boxName') || 'صندوق مالي';

  // Load invoices and box settings
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all available financial boxes for dropdown
        const allBoxes = await financialBoxService?.getAll();
        if (isMounted) {
          // Filter out completed boxes for invoice creation
          const activeBoxes = allBoxes?.filter(box => box?.status !== 'completed') || [];
          const boxOptions = activeBoxes?.map(box => ({
            value: box?.id,
            label: `${box?.name} (${box?.captainName || 'بدون كابتن'})`,
            data: box
          })) || [];
          setAvailableBoxes(boxOptions);
        }

        // Load box settings if boxId is provided
        if (selectedBoxId) {
          const boxData = await financialBoxService?.getById(selectedBoxId);
          if (isMounted) {
            setBoxSettings({
              id: boxData?.id,
              name: boxData?.name,
              crewCount: boxData?.crewCount || 4,
              captainId: boxData?.captainId,
              captainName: boxData?.captainName
            });
          }
        }
        
        // Load invoices
        const invoicesData = await invoiceService?.getAll(selectedBoxId);
        if (isMounted) {
          setInvoices(invoicesData || []);
          setFilteredInvoices(invoicesData || []);
        }
      } catch (err) {
        console.error('Error loading invoice data:', err);
        if (isMounted) {
          setError(err?.message || 'حدث خطأ أثناء تحميل البيانات');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedBoxId]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleFilterChange = (filters) => {
    let filtered = [...invoices];

    // Search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(invoice =>
        (invoice?.observations && invoice?.observations?.toLowerCase()?.includes(searchTerm)) ||
        invoice?.amount?.toString()?.includes(searchTerm) ||
        (invoice?.invoiceNumber && invoice?.invoiceNumber?.toLowerCase()?.includes(searchTerm))
      );
    }

    // Date range filter
    if (filters?.dateRange?.start) {
      filtered = filtered?.filter(invoice => 
        new Date(invoice.date) >= new Date(filters.dateRange.start)
      );
    }
    if (filters?.dateRange?.end) {
      filtered = filtered?.filter(invoice => 
        new Date(invoice.date) <= new Date(filters.dateRange.end)
      );
    }

    // Amount range filter
    if (filters?.amountRange?.min) {
      filtered = filtered?.filter(invoice => 
        invoice?.amount >= parseFloat(filters?.amountRange?.min)
      );
    }
    if (filters?.amountRange?.max) {
      filtered = filtered?.filter(invoice => 
        invoice?.amount <= parseFloat(filters?.amountRange?.max)
      );
    }

    // Sorting
    filtered?.sort((a, b) => {
      let aValue = a?.[filters?.sortBy];
      let bValue = b?.[filters?.sortBy];

      if (filters?.sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (filters?.sortBy === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (aValue < bValue) return filters?.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters?.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredInvoices(filtered);
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setIsFormModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setIsFormModalOpen(true);
  };

  const handleDeleteInvoice = (invoiceId) => {
    const invoice = invoices?.find(inv => inv?.id === invoiceId);
    setDeletingInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (invoiceData) => {
    try {
      setError(null);
      
      if (editingInvoice) {
        // Update existing invoice
        const updatedInvoice = await invoiceService?.update(editingInvoice?.id, {
          ...invoiceData,
          financialBoxId: invoiceData?.financialBoxId
        });
        
        setInvoices(prev => prev?.map(inv => 
          inv?.id === editingInvoice?.id ? updatedInvoice : inv
        ));
      } else {
        // Add new invoice
        const newInvoice = await invoiceService?.create({
          ...invoiceData,
          financialBoxId: invoiceData?.financialBoxId
        });
        
        setInvoices(prev => [newInvoice, ...prev]);
      }
      
      setIsFormModalOpen(false);
      setEditingInvoice(null);
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError(err?.message || 'حدث خطأ أثناء حفظ الفاتورة');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    
    try {
      setError(null);
      
      // Delete from database
      await invoiceService?.delete(deletingInvoice?.id);
      
      // Update local state
      setInvoices(prev => prev?.filter(inv => inv?.id !== deletingInvoice?.id));
      setFilteredInvoices(prev => prev?.filter(inv => inv?.id !== deletingInvoice?.id));
      
      setIsDeleteModalOpen(false);
      setDeletingInvoice(null);
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err?.message || 'حدث خطأ أثناء حذف الفاتورة');
    }
  };

  const handleBackToBoxes = () => {
    navigate('/financial-boxes-management');
  };

  const breadcrumbItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: 'Home' },
    { path: '/financial-boxes-management', label: 'إدارة الصناديق المالية', icon: 'Package' },
    { path: '/invoice-management', label: `فواتير ${selectedBoxName}`, icon: 'FileText' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header onMenuToggle={handleMenuToggle} isMenuOpen={isSidebarOpen} />
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        
        <main className="lg:mr-72 pt-16 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">جارٍ تحميل البيانات...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header onMenuToggle={handleMenuToggle} isMenuOpen={isSidebarOpen} />
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        <main className="lg:mr-72 pt-16 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <Icon name="AlertCircle" size={32} className="text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location?.reload()}>
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <main className="lg:mr-72 pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb customItems={breadcrumbItems} />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBackToBoxes}
                className="shrink-0"
              >
                <Icon name="ArrowRight" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                  إدارة فواتير {selectedBoxName}
                </h1>
                <p className="text-muted-foreground mt-1">
                  إدارة وتتبع جميع الفواتير والحسابات المالية للصندوق
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setShowProfitCalculator(!showProfitCalculator)}
                iconName="Calculator"
                iconPosition="right"
              >
                {showProfitCalculator ? 'إخفاء الحاسبة' : 'حاسبة الأرباح'}
              </Button>
              <Button
                variant="default"
                onClick={handleAddInvoice}
                iconName="Plus"
                iconPosition="right"
              >
                إضافة فاتورة
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="AlertCircle" size={20} className="text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <InvoiceSummaryCards invoices={filteredInvoices} selectedBox={selectedBoxName} />

          {/* Main Content Grid */}
          <div className={`grid gap-8 ${showProfitCalculator ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
            {/* Invoices Section */}
            <div className={showProfitCalculator ? 'lg:col-span-2' : 'lg:col-span-1'}>
              {/* Filters */}
              <InvoiceFilters 
                onFilterChange={handleFilterChange}
                onAddInvoice={handleAddInvoice}
              />

              {/* Invoice Table */}
              <InvoiceTable
                invoices={filteredInvoices}
                onEditInvoice={handleEditInvoice}
                onDeleteInvoice={handleDeleteInvoice}
              />
            </div>

            {/* Profit Calculator */}
            {showProfitCalculator && boxSettings && (
              <div className="lg:col-span-1">
                <ProfitCalculator 
                  invoices={filteredInvoices}
                  selectedBox={selectedBoxName}
                  boxSettings={boxSettings}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={handleFormSubmit}
        editingInvoice={editingInvoice}
        boxSettings={boxSettings}
        availableBoxes={availableBoxes}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingInvoice(null);
        }}
        onConfirm={handleConfirmDelete}
        invoiceData={deletingInvoice}
      />
    </div>
  );
};

export default InvoiceManagement;