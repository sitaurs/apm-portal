'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  FileText,
  X,
  Globe,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { BackButton } from '@/components/admin/BackButton';

interface Prestasi {
  id: number;
  namaPrestasi: string;
  namaLomba: string;
  tingkat: string;
  peringkat: string;
  tanggal: string;
  sertifikatUrl: string | null;
  status: string;
  reviewerNotes: string;
  verifiedAt: string;
  submitterName: string;
  submitterNim: string;
  submitterEmail: string;
  dateCreated: string;
  isPublished?: boolean;
  publishedPrestasiId?: number;
  slug?: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminPrestasiPage() {
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<Prestasi[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [tingkat, setTingkat] = useState('');
  
  // Modal state
  const [selectedPrestasi, setSelectedPrestasi] = useState<Prestasi | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', (meta.page).toString());
      params.set('limit', meta.limit.toString());
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (tingkat) params.set('tingkat', tingkat);
      
      // Add timestamp to bust cache
      params.set('_t', Date.now().toString());

      const res = await fetch(`/api/admin/prestasi?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        // API returns { success: true, data: [...], meta: {...} }
        const prestasiData = Array.isArray(result.data) ? result.data : [];
        console.log('Fetched prestasi data:', prestasiData.length, 'items');
        if (prestasiData.length > 0) {
          console.log('First 3 items with status:', prestasiData.slice(0, 3).map((item: any) => ({
            id: item.id,
            nama: item.namaPrestasi,
            status: item.status,
          })));
        }
        setData([...prestasiData]);
        if (result.meta) {
          setMeta(prev => ({ ...prev, ...result.meta }));
        }
      }
    } catch (error) {
      console.error('Error fetching prestasi:', error);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, search, status, tingkat]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const openReviewModal = (prestasi: Prestasi) => {
    setSelectedPrestasi(prestasi);
    setReviewNotes(prestasi.reviewerNotes || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menghapus prestasi "${name}"?\n\nData prestasi dan submission terkait akan dihapus permanen.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/prestasi/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        alert('Prestasi berhasil dihapus');
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus prestasi');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  const handleVerify = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedPrestasi) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/prestasi/${selectedPrestasi.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewer_notes: reviewNotes,
          make_public: true,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Verify result from server:', result);
        
        // Fetch fresh data first
        await fetchData();
        
        // Then close modal after data is refreshed
        setShowModal(false);
        setReviewNotes('');
        setSelectedPrestasi(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal memproses');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800', // Support both verified and approved
      rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      verified: 'Terverifikasi',
      approved: 'Terverifikasi', // Map approved to same label as verified
      rejected: 'Ditolak',
    };
    return { style: styles[status] || 'bg-slate-100 text-slate-800', label: labels[status] || status };
  };

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Verifikasi Prestasi</h1>
          <p className="text-slate-600">Kelola dan verifikasi prestasi yang disubmit mahasiswa</p>
        </div>
        <Link
          href="/admin/prestasi/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Buat Prestasi Baru</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari prestasi, lomba, atau pengisi..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select
            value={tingkat}
            onChange={(e) => {
              setTingkat(e.target.value);
              setMeta(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Tingkat</option>
            <option value="internasional">Internasional</option>
            <option value="nasional">Nasional</option>
            <option value="regional">Regional</option>
            <option value="provinsi">Provinsi</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Prestasi</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Tingkat</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Pengisi</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Tanggal Submit</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada data prestasi
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const statusInfo = getStatusBadge(item.status);
                  return (
                    <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{item.namaPrestasi}</p>
                        <p className="text-sm text-slate-500">{item.namaLomba}</p>
                        <p className="text-xs text-slate-400">{item.peringkat}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-slate-600 capitalize">{item.tingkat}</span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-slate-800">{item.submitterName || '-'}</p>
                        <p className="text-xs text-slate-500">{item.submitterNim}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-slate-600">{formatDate(item.dateCreated)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {item.sertifikatUrl && (
                            <a
                              href={item.sertifikatUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Lihat Sertifikat"
                            >
                              <FileText size={16} />
                            </a>
                          )}
                          <button
                            onClick={() => openReviewModal(item)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Review"
                          >
                            <Eye size={16} />
                          </button>
                          {/* Show Publish button if approved but not published yet */}
                          {(item.status === 'approved' || item.status === 'verified') && !item.isPublished && (
                            <Link
                              href={`/admin/prestasi/${item.id}/publish`}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Publikasikan"
                            >
                              <Globe size={16} />
                            </Link>
                          )}
                          {/* Show Edit button if already published */}
                          {item.isPublished && item.publishedPrestasiId && (
                            <Link
                              href={`/admin/prestasi/${item.publishedPrestasiId}/edit`}
                              className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Prestasi"
                            >
                              <Pencil size={16} />
                            </Link>
                          )}
                          {/* View published */}
                          {item.isPublished && item.slug && (
                            <a
                              href={`/prestasi/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Lihat di Website"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(item.id, item.namaPrestasi)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Menampilkan {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={meta.page <= 1}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-slate-600">
                {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedPrestasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Review Prestasi</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Prestasi Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Nama Prestasi</p>
                  <p className="font-medium text-slate-800">{selectedPrestasi.namaPrestasi}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Nama Lomba</p>
                  <p className="font-medium text-slate-800">{selectedPrestasi.namaLomba}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tingkat</p>
                  <p className="font-medium text-slate-800 capitalize">{selectedPrestasi.tingkat}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Peringkat</p>
                  <p className="font-medium text-slate-800">{selectedPrestasi.peringkat}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tanggal Prestasi</p>
                  <p className="font-medium text-slate-800">{formatDate(selectedPrestasi.tanggal)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status Saat Ini</p>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedPrestasi.status).style}`}>
                    {getStatusBadge(selectedPrestasi.status).label}
                  </span>
                </div>
              </div>

              {/* Submitter Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-2">Disubmit oleh:</p>
                <p className="font-medium text-slate-800">{selectedPrestasi.submitterName}</p>
                <p className="text-sm text-slate-600">{selectedPrestasi.submitterNim} | {selectedPrestasi.submitterEmail}</p>
              </div>

              {/* Certificate */}
              {selectedPrestasi.sertifikatUrl && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Sertifikat:</p>
                  <a
                    href={selectedPrestasi.sertifikatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>Buka Sertifikat</span>
                  </a>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan Reviewer
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tambahkan catatan jika diperlukan..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => handleVerify('rejected')}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XCircle size={18} />
                <span>Tolak</span>
              </button>
              <button
                onClick={() => handleVerify('approved')}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={18} />
                <span>Verifikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

