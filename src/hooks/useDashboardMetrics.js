import { useState, useEffect } from 'react';
import { crewService } from '../services/crewService';
import { invoiceService } from '../services/invoiceService';
import { financialBoxService } from '../services/financialBoxService';

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalCrewDebts: 0,
    undistributedInvoices: 0,
    boatOwnerBalance: 0,
    monthlyProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all crew members with their debts
      const crewMembers = await crewService?.getAll();
      
      // Calculate total crew debts (sum of all positive debts)
      const totalCrewDebts = crewMembers?.reduce((total, member) => {
        const debt = parseFloat(member?.debt || 0);
        return total + (debt > 0 ? debt : 0); // Only count positive debts
      }, 0) || 0;

      // Fetch invoice statistics
      const invoiceStats = await invoiceService?.getInvoiceStats();
      const undistributedInvoices = invoiceStats?.unpaidAmount || 0;

      // Fetch financial boxes to calculate owner balance
      const financialBoxes = await financialBoxService?.getAll();
      const boatOwnerBalance = financialBoxes?.reduce((total, box) => {
        return total + parseFloat(box?.totalAmount || 0);
      }, 0) || 0;

      // Calculate monthly profit (paid invoices from current month)
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthlyInvoices = await invoiceService?.getInvoicesByDateRange(
        null, 
        startOfMonth?.toISOString()?.split('T')?.[0], 
        endOfMonth?.toISOString()?.split('T')?.[0]
      );
      
      const monthlyProfit = monthlyInvoices?.reduce((total, invoice) => {
        return total + (invoice?.is_paid ? parseFloat(invoice?.amount || 0) : 0);
      }, 0) || 0;

      setMetrics({
        totalCrewDebts,
        undistributedInvoices,
        boatOwnerBalance,
        monthlyProfit
      });
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err?.message || 'Failed to fetch dashboard metrics');
      
      // Set fallback metrics on error
      setMetrics({
        totalCrewDebts: 0,
        undistributedInvoices: 0,
        boatOwnerBalance: 0,
        monthlyProfit: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const refreshMetrics = () => {
    fetchMetrics();
  };

  return {
    metrics,
    loading,
    error,
    refreshMetrics
  };
};