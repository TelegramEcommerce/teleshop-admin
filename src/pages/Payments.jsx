import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaymentMethods, createPayment, updatePayment, deletePayment } from '../api/payments';
import { uploadImage } from '../api/products';
import { useSelectedBot } from '../hooks/useSelectedBot';
import LoadingSkeleton from '../components/shared/LoadingSkeleton';
import { 
  Plus, 
  CreditCard, 
  Edit2, 
  Trash2, 
  QrCode, 
  X, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Payments() {
  const { selectedBotId } = useSelectedBot();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    name: '', payment_number: '', description: '', qr_code_url: '', notes: '', is_active: true
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', selectedBotId],
    queryFn: () => getPaymentMethods({ bot_id: selectedBotId }),
    enabled: !!selectedBotId,
  });

  const mutation = useMutation({
    mutationFn: (data) => editingPayment ? updatePayment(editingPayment.id, data) : createPayment({ ...data, bot_id: selectedBotId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries(['payments']),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData({ ...formData, qr_code_url: res.url });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const openModal = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        name: payment.name,
        payment_number: payment.payment_number,
        description: payment.description || '',
        qr_code_url: payment.qr_code_url || '',
        notes: payment.notes || '',
        is_active: payment.is_active
      });
    } else {
      setEditingPayment(null);
      setFormData({ name: '', payment_number: '', description: '', qr_code_url: '', notes: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPayment(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-48" />)
        ) : payments?.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-dashed border-gray-300">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No payment methods</h3>
            <p className="text-gray-500">Add your first payment method to start receiving orders.</p>
          </div>
        ) : (
          payments?.map((payment) => (
            <motion.div 
              layout
              key={payment.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal(payment)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Delete this payment method?')) deleteMutation.mutate(payment.id);
                      }}
                      className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900">{payment.name}</h4>
                <p className="text-sm font-medium text-gray-500 mt-1">{payment.payment_number}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${payment.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {payment.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {payment.qr_code_url && (
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                      <QrCode className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <button 
        onClick={() => openModal()}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-xl shadow-indigo-200 flex items-center justify-center text-white hover:bg-indigo-700 transition-all active:scale-90 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate(formData);
                }}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bank / Wallet Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. KBZPay"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Account Number / Phone</label>
                    <input 
                      type="text" 
                      required
                      placeholder="09xxxxxxxxx"
                      value={formData.payment_number}
                      onChange={(e) => setFormData({ ...formData, payment_number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description / Instructions</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Please send money to this account and upload screenshot."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">QR Code (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {formData.qr_code_url ? (
                        <img src={formData.qr_code_url} alt="QR" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <QrCode className="w-8 h-8 text-gray-200" />
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {formData.qr_code_url ? 'Change QR Code' : 'Upload QR Code'}
                      </div>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Active Status</p>
                      <p className="text-[10px] text-gray-500">Enable this payment method</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Payment Method'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
