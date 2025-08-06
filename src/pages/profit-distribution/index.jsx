import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import SourceInvoiceSelector from './components/SourceInvoiceSelector';
import DistributionCalculator from './components/DistributionCalculator';
import CrewAllocationTable from './components/CrewAllocationTable';
import PaymentConfirmationDialog from './components/PaymentConfirmationDialog';
import DistributionSummary from './components/DistributionSummary';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { financialBoxService } from '../../services/financialBoxService';
import { crewService } from '../../services/crewService';

const ProfitDistribution = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState('');
  const [calculationResults, setCalculationResults] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState({ isOpen: false, data: null });
  const [financialBoxes, setFinancialBoxes] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [crewCountMismatch, setCrewCountMismatch] = useState(false);

  // Load financial boxes on component mount
  useEffect(() => {
    loadFinancialBoxes();
    loadCrewMembers();
  }, []);

  const loadFinancialBoxes = async () => {
    try {
      setLoading(true);
      const boxes = await financialBoxService?.getAll();
      setFinancialBoxes(boxes);
    } catch (err) {
      setError('فشل في تحميل الصناديق المالية: ' + err?.message);
      console.error('Error loading financial boxes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCrewMembers = async () => {
    try {
      const members = await crewService?.getAll();
      // Transform crew service data to match UI expectations
      const transformedMembers = members?.map(member => ({
        id: member?.id,
        name: member?.name,
        role: member?.role,
        currentDebt: member?.debt || 0,
        paymentStatus: 'unpaid',
        joinDate: member?.joinDate,
        email: member?.email,
        phone: member?.phone,
        profitShare: member?.profitShare || 0
      }));
      setCrewMembers(transformedMembers);
    } catch (err) {
      setError('فشل في تحميل بيانات الطاقم: ' + err?.message);
      console.error('Error loading crew members:', err);
    }
  };

  const validateCrewCount = (selectedBoxData) => {
    if (!selectedBoxData || !crewMembers?.length) return false;
    
    const actualCrewCount = crewMembers?.filter(member => member?.role !== 'captain')?.length;
    const captainCount = crewMembers?.filter(member => member?.role === 'captain')?.length;
    const totalActualCount = actualCrewCount + captainCount;
    const expectedCrewCount = selectedBoxData?.crewCount;
    
    return totalActualCount === expectedCrewCount;
  };

  const calculateDistribution = (crewCount = null) => {
    const selectedBoxData = financialBoxes?.find(box => box?.id === selectedBox);
    if (!selectedBoxData) return;

    // Validate crew count against box settings
    const isValidCrewCount = validateCrewCount(selectedBoxData);
    setCrewCountMismatch(!isValidCrewCount);

    if (!isValidCrewCount) {
      const actualCrewCount = crewMembers?.filter(member => member?.role !== 'captain')?.length;
      const captainCount = crewMembers?.filter(member => member?.role === 'captain')?.length;
      const totalActualCount = actualCrewCount + captainCount;
      
      setError(
        `عدد الطاقم الفعلي (${totalActualCount}) لا يتوافق مع إعدادات الصندوق (${selectedBoxData?.crewCount}). ` +
        `يرجى تحديث إعدادات الصندوق أو إضافة/حذف أفراد الطاقم للمطابقة.`
      );
      return;
    }

    // Clear any previous errors
    setError(null);
    setCrewCountMismatch(false);

    const totalAmount = selectedBoxData?.totalAmount;
    const useCrewCount = crewCount || crewMembers?.length;
    
    // Fixed calculation logic to match the formula in the image
    // Total amount is split 50/50 between owner and crew
    const totalCrewShare = totalAmount * 0.5; // 50% for crew
    const individualShare = totalCrewShare / useCrewCount; // Individual crew member share
    const captainExtraShare = individualShare * 0.5; // Captain gets extra half share
    const captainShare = individualShare + captainExtraShare; // Total captain share (1.5x individual)
    
    // Owner gets 50% minus the captain's extra half share
    const baseOwnerShare = totalAmount * 0.5;
    const ownerShare = baseOwnerShare - captainExtraShare;

    setCalculationResults({
      totalAmount,
      ownerShare,
      totalCrewShare,
      individualShare,
      captainShare,
      captainExtraShare,
      crewCount: useCrewCount
    });
  };

  const handleBoxSelect = (boxId) => {
    setSelectedBox(boxId);
    setCalculationResults(null);
    setError(null);
    setCrewCountMismatch(false);
  };

  const handleCalculateDistribution = () => {
    calculateDistribution();
  };

  const handleRecalculate = (newCrewCount) => {
    calculateDistribution(newCrewCount);
  };

  const handleDebtDeduction = async (memberId) => {
    try {
      // Update crew member debt in database
      const member = crewMembers?.find(m => m?.id === memberId);
      if (!member) return;

      // Add debt deduction record
      await crewService?.addDebt(memberId, {
        amount: member?.currentDebt,
        description: 'خصم دين من توزيع الأرباح',
        type: 'subtract'
      });

      // Refresh crew members data
      await loadCrewMembers();
      
      setCrewMembers(prev => prev?.map(member => 
        member?.id === memberId 
          ? { ...member, currentDebt: 0, paymentStatus: 'pending' }
          : member
      ));
    } catch (err) {
      setError('فشل في خصم الدين: ' + err?.message);
      console.error('Error deducting debt:', err);
    }
  };

  const handlePaymentConfirm = (memberId) => {
    const member = crewMembers?.find(m => m?.id === memberId);
    if (!member) return;

    const baseShare = member?.role === 'captain' 
      ? calculationResults?.captainShare || 0
      : calculationResults?.individualShare || 0;

    setPaymentDialog({
      isOpen: true,
      data: {
        type: 'individual',
        members: [{ ...member, amount: baseShare }],
        totalAmount: baseShare
      }
    });
  };

  const handleBatchPayment = (selectedMemberIds) => {
    const selectedMembers = crewMembers?.filter(member => 
      selectedMemberIds?.includes(member?.id)
    );

    const membersWithAmounts = selectedMembers?.map(member => {
      const baseShare = member?.role === 'captain' 
        ? calculationResults?.captainShare || 0
        : calculationResults?.individualShare || 0;
      return { ...member, amount: baseShare };
    });

    const totalAmount = membersWithAmounts?.reduce((sum, member) => sum + member?.amount, 0);

    setPaymentDialog({
      isOpen: true,
      data: {
        type: 'batch',
        members: membersWithAmounts,
        totalAmount
      }
    });
  };

  const handlePaymentDialogConfirm = async (paymentData) => {
    // Update crew members payment status
    const memberIds = paymentData?.members?.map(m => m?.id);
    setCrewMembers(prev => prev?.map(member => 
      memberIds?.includes(member?.id)
        ? { ...member, paymentStatus: 'paid' }
        : member
    ));

    // Close dialog
    setPaymentDialog({ isOpen: false, data: null });
  };

  const handleConfirmFinalPayment = async (totalAmount) => {
    try {
      setLoading(true);
      
      // Confirm payment and complete the financial box
      const updatedBox = await financialBoxService?.confirmPaymentAndComplete(selectedBox, totalAmount);
      
      // Update the financial boxes state
      setFinancialBoxes(prev => prev?.map(box => 
        box?.id === selectedBox ? updatedBox : box
      ));
      
      // Show success message
      setError(null);
      
      // Reset the calculation and crew payment status
      setCalculationResults(null);
      setCrewMembers(prev => prev?.map(member => ({
        ...member,
        paymentStatus: 'unpaid'
      })));
      
      // Show success notification (you could use a toast notification here)
      alert(`تم تأكيد الدفع بنجاح! تم خصم ${totalAmount?.toLocaleString('ar-SA')} ريال من الصندوق وتم تحديث حالته إلى مكتمل.`);
      
    } catch (err) {
      setError('فشل في تأكيد الدفع النهائي: ' + err?.message);
      console.error('Error confirming final payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Mock export functionality
    const reportData = {
      selectedBox: financialBoxes?.find(box => box?.id === selectedBox),
      calculationResults,
      crewMembers,
      exportDate: new Date()?.toISOString()
    };
    
    console.log('Exporting report:', reportData);
    // In real implementation, this would generate and download a PDF/Excel file
  };

  const handleResetCalculation = () => {
    setSelectedBox('');
    setCalculationResults(null);
    setError(null);
    setCrewCountMismatch(false);
    setCrewMembers(prev => prev?.map(member => ({
      ...member,
      paymentStatus: 'unpaid'
    })));
  };

  const selectedBoxData = financialBoxes?.find(box => box?.id === selectedBox);
  const totalAmount = selectedBoxData?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:mr-72 pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  توزيع الأرباح
                </h1>
                <p className="text-muted-foreground">
                  حساب وتوزيع الأرباح على الطاقم ومالك القارب
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="right"
                onClick={handleResetCalculation}
              >
                إعادة تعيين
              </Button>
              {calculationResults && (
                <Button
                  variant="default"
                  iconName="Download"
                  iconPosition="right"
                  onClick={handleExportReport}
                >
                  تصدير التقرير
                </Button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Icon name="AlertCircle" size={20} className="text-destructive" />
                <div>
                  <h3 className="font-medium text-destructive">خطأ في التحقق من البيانات</h3>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  {crewCountMismatch && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>العدد الفعلي للطاقم: {crewMembers?.length}</p>
                      <p>العدد المطلوب في الصندوق: {selectedBoxData?.crewCount}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Source Invoice Selector */}
            <SourceInvoiceSelector
              financialBoxes={financialBoxes}
              selectedBox={selectedBox}
              onBoxSelect={handleBoxSelect}
              totalAmount={totalAmount}
              onCalculateDistribution={handleCalculateDistribution}
              loading={loading}
            />

            {/* Distribution Calculator */}
            <DistributionCalculator
              totalAmount={totalAmount}
              crewMembers={crewMembers}
              calculationResults={calculationResults}
              onRecalculate={handleRecalculate}
              crewCountMismatch={crewCountMismatch}
            />

            {/* Crew Allocation Table */}
            <CrewAllocationTable
              crewMembers={crewMembers}
              calculationResults={calculationResults}
              onDebtDeduction={handleDebtDeduction}
              onPaymentConfirm={handlePaymentConfirm}
              onBatchPayment={handleBatchPayment}
              crewCountMismatch={crewCountMismatch}
            />

            {/* Distribution Summary */}
            {calculationResults && !crewCountMismatch && (
              <DistributionSummary
                calculationResults={calculationResults}
                selectedBox={selectedBox}
                crewMembers={crewMembers}
                onExportReport={handleExportReport}
                onResetCalculation={handleResetCalculation}
                onConfirmFinalPayment={handleConfirmFinalPayment}
              />
            )}
          </div>
        </div>
      </main>
      {/* Payment Confirmation Dialog */}
      <PaymentConfirmationDialog
        isOpen={paymentDialog?.isOpen}
        onClose={() => setPaymentDialog({ isOpen: false, data: null })}
        paymentData={paymentDialog?.data}
        onConfirm={handlePaymentDialogConfirm}
      />
    </div>
  );
};

export default ProfitDistribution;