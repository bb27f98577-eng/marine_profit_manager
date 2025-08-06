import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { financialBoxService } from '../../../services/financialBoxService';
import { formatCurrencyEnglish, formatDateTimeEnglish, getCurrentTimestampEnglish } from '../../../utils/localization';

const BoxProfitDistribution = ({ box, onClose, onDistribute, setError, crewShare, totalProfit }) => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [loadingCrewMembers, setLoadingCrewMembers] = useState(false);

  const [distributionSettings, setDistributionSettings] = useState({
    ownerPercentage: 50,
    crewPercentage: 50,
    captainExtraShare: 25,
    expensesPercentage: 30
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load actual crew members for this box
  const loadBoxCrewMembers = async () => {
    try {
      setLoadingCrewMembers(true);
      const boxCrewMembers = await financialBoxService?.getBoxCrewMembers(box?.id);
      setCrewMembers(boxCrewMembers);
    } catch (error) {
      console.error('Error loading box crew members:', error);
      setError('فشل في تحميل أعضاء الطاقم');
      // Fallback to empty array if database fails
      setCrewMembers([]);
    } finally {
      setLoadingCrewMembers(false);
    }
  };

  useEffect(() => {
    if (box?.id) {
      loadBoxCrewMembers();
    }
  }, [box?.id]);

  const formatCurrency = (amount) => {
    return formatCurrencyEnglish(amount || 0);
  };

  const formatDateTime = (date) => {
    return formatDateTimeEnglish(date);
  };

  const calculateDistribution = () => {
    const totalAmount = box?.totalAmount || 0;
    
    // User's exact formula: Total amount → Half amount → Individual shares
    const halfAmount = totalAmount / 2;
    
    // Count eligible crew members (excluding those already paid)
    const eligibleCrewMembers = crewMembers?.filter((member) => member?.paymentStatus !== 'paid') || [];
    const crewCount = eligibleCrewMembers?.length || 1;
    
    // Base individual share from half amount (Example: 500 ÷ 4 = 125)
    const individualShare = halfAmount / crewCount;
    
    // Captain gets 1.5 times individual share (Example: 125 × 1.5 = 187.50)
    const captainShare = individualShare * 1.5;
    const regularCrewShare = individualShare;
    
    // Calculate captain's extra amount (0.5 × individual share)
    const captainExtraAmount = individualShare * 0.5;
    
    // Count captains to calculate total extra amount
    const captainCount = eligibleCrewMembers?.filter(member => member?.role === 'captain')?.length || 0;
    const totalCaptainExtraAmount = captainCount * captainExtraAmount;
    
    // Owner gets the other half minus all captain extra amounts
    // Example: 500 - 62.50 = 437.50 (for 1 captain)
    const ownerShare = halfAmount - totalCaptainExtraAmount;
    
    // Calculate total crew share (all individual shares + captain extras)
    const regularCrewCount = crewCount - captainCount;
    const totalCrewShare = (captainCount * captainShare) + (regularCrewCount * regularCrewShare);

    return {
      totalAmount,
      halfAmount,
      ownerShare,
      totalCrewShare,
      individualShare, // Renamed from baseSharePerPerson for clarity
      captainShare,
      regularCrewShare,
      crewCount,
      captainExtraAmount: totalCaptainExtraAmount,
      expenses: 0 // No expenses deduction in this method
    };
  };

  const distribution = calculateDistribution();

  const handleMemberSelect = (memberId) => {
    setSelectedMembers((prev) =>
      prev?.includes(memberId) ?
        prev?.filter((id) => id !== memberId) :
        [...prev, memberId]
    );
  };

  const handlePaySelected = () => {
    if (selectedMembers?.length === 0) return;
    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    const updatedMembers = crewMembers?.map((member) =>
      selectedMembers?.includes(member?.id) ?
        { ...member, paymentStatus: 'paid', currentDebt: 0 } :
        member
    );

    setCrewMembers(updatedMembers);
    setSelectedMembers([]);
    setShowConfirmation(false);

    onDistribute?.({
      boxId: box?.id,
      distribution,
      paidMembers: selectedMembers,
      timestamp: new Date()?.toISOString()
    });
  };

  const handleDistribute = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate distribution process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const distributionData = {
        boxId: box?.id,
        timestamp: getCurrentTimestampEnglish(),
        ownerShare: distribution?.ownerShare,
        crewShare: distribution?.totalCrewShare,
        totalDistributed: distribution?.totalAmount
      };

      onDistribute?.(distributionData);
      setIsLoading(false);
      setSuccess(true);

      // Auto close after success
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (error) {
      console.error('Error distributing profits:', error);
      setError('فشل في توزيع الأرباح. يرجى المحاولة مرة أخرى.');
      setIsLoading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'تم الدفع';
      case 'pending':
        return 'معلق';
      case 'unpaid':
        return 'لم يدفع';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">
                توزيع أرباح - {box?.name}
              </h2>
              <p className="text-blue-100">
                إدارة مستقلة لتوزيع الأرباح داخل هذا الصندوق
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl">
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Loading State */}
          {loadingCrewMembers && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mr-3 text-slate-600 dark:text-slate-300">جاري تحميل أعضاء الطاقم...</span>
            </div>
          )}

          {/* Empty State */}
          {!loadingCrewMembers && crewMembers?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                لا يوجد أعضاء طاقم
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                لم يتم تعيين أعضاء طاقم لهذا الصندوق. يرجى تعديل الصندوق وإضافة أعضاء الطاقم.
              </p>
            </div>
          )}

          {/* Distribution Content */}
          {!loadingCrewMembers && crewMembers?.length > 0 && (
            <>
              {/* Distribution Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="Wallet" size={24} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                      إجمالي
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">المبلغ الإجمالي</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(distribution?.totalAmount)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="Divide" size={24} className="text-purple-600" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-full">
                      مقسوم على 2
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">نصف المبلغ</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(distribution?.halfAmount)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="Crown" size={24} className="text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full">
                      مالك
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">حصة المالك</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(distribution?.ownerShare)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="Users" size={24} className="text-amber-600" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-full">
                      {distribution?.crewCount} عضو
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">حصة الطاقم</h3>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(distribution?.totalCrewShare)}
                  </p>
                </div>
              </div>

              {/* Distribution Method Explanation */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 mb-8">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="Calculator" size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-slate-200 mb-2">
                      طريقة التوزيع الجديدة
                    </h3>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <p>• المبلغ الإجمالي مقسوم على 2 = {formatCurrency(distribution?.halfAmount)}</p>
                      <p>• الحصة الأساسية للفرد = {formatCurrency(distribution?.individualShare)} ({formatCurrency(distribution?.halfAmount)} ÷ {distribution?.crewCount} أفراد)</p>
                      <p>• الكابتن يأخذ 1.5 حصة = {formatCurrency(distribution?.captainShare)} (حصة فرد + نصف حصة إضافية)</p>
                      <p>• حصة المالك = {formatCurrency(distribution?.ownerShare)} (النصف الثاني - الحصص الإضافية للكباتن)</p>
                    </div>
                    <div className="mt-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-indigo-200/30 dark:border-indigo-700/30">
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                        مثال دقيق: إجمالي 1000 ريال → نصف المبلغ 500 ريال → حصة الفرد 125 ريال → كابتن 187.50 ريال → مالك 437.50 ريال
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crew Members Table */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-4 border-b border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-slate-200">
                      أعضاء الطاقم
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        المحدد: {selectedMembers?.length}
                      </span>
                      <Button
                        size="sm"
                        onClick={handlePaySelected}
                        disabled={selectedMembers?.length === 0}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon name="DollarSign" size={16} className="ml-1" />
                        دفع المحدد
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="p-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e?.target?.checked) {
                                setSelectedMembers(crewMembers?.filter((m) => m?.paymentStatus !== 'paid')?.map((m) => m?.id));
                              } else {
                                setSelectedMembers([]);
                              }
                            }}
                            className="rounded border-slate-300 dark:border-slate-600"
                          />
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">العضو</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">المنصب</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الحصة</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الدين</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الصافي</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crewMembers?.map((member, index) => {
                        const memberShare = member?.role === 'captain' ? distribution?.captainShare : distribution?.regularCrewShare;
                        const netAmount = memberShare - member?.currentDebt;

                        return (
                          <tr key={member?.id} className={`border-t border-slate-200 dark:border-slate-700 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/30'}`}>
                            <td className="p-4">
                              {member?.paymentStatus !== 'paid' &&
                                <input
                                  type="checkbox"
                                  checked={selectedMembers?.includes(member?.id)}
                                  onChange={() => handleMemberSelect(member?.id)}
                                  className="rounded border-slate-300 dark:border-slate-600"
                                />
                              }
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {member?.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {member?.name}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    انضم: {member?.joinDate}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${member?.role === 'captain' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                {member?.role === 'captain' ? 'كابتن' : 'طاقم'}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(memberShare)}
                              {member?.role === 'captain' && (
                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                  (1.5 حصة)
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-red-600 dark:text-red-400">
                              {formatCurrency(member?.currentDebt)}
                            </td>
                            <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                              {formatCurrency(Math.max(0, netAmount))}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(member?.paymentStatus)}`}>
                                {getPaymentStatusLabel(member?.paymentStatus)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              إجمالي المبلغ المُوزع: <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(distribution?.totalCrewShare)}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-300 dark:border-slate-600">
                إغلاق
              </Button>
              <Button
                onClick={() => {
                  // Export distribution report
                  console.log('Export distribution report for box:', box?.id);
                }}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                <Icon name="Download" size={16} className="ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Modal */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="DollarSign" size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-slate-200 mb-2">
                  تأكيد الدفع
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  هل أنت متأكد من دفع حصص الأعضاء المحددين؟ ({selectedMembers?.length} عضو)
                </p>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1">
                    إلغاء
                  </Button>
                  <Button
                    onClick={confirmPayment}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                    تأكيد الدفع
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxProfitDistribution;