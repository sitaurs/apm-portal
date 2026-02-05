'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import ImageUpload from '@/components/admin/ImageUpload';

interface LombaFormData {
  nama_lomba: string;
  slug: string;
  kategori: string;
  tingkat: string;
  penyelenggara: string;
  deadline_pendaftaran: string;
  tanggal_pelaksanaan: string;
  lokasi: string;
  deskripsi: string;
  persyaratan: string;
  hadiah: string;
  link_pendaftaran: string;
  cp_nama: string;
  cp_whatsapp: string;
  biaya_pendaftaran: number;
  is_featured: boolean;
  status: string;
  tipe_pendaftaran: string;
  poster: string;
  thumbnail: string;
  posters: string[];
  additional_fields: Array<{label: string; value: string}>;
}

const kategoriOptions = [
  { value: 'teknologi', label: 'Teknologi' },
  { value: 'bisnis', label: 'Bisnis' },
  { value: 'desain', label: 'Desain' },
  { value: 'sains', label: 'Sains' },
  { value: 'seni', label: 'Seni' },
  { value: 'olahraga', label: 'Olahraga' },
  { value: 'lainnya', label: 'Lainnya' },
];

const tingkatOptions = [
  { value: 'internasional', label: 'Internasional' },
  { value: 'nasional', label: 'Nasional' },
  { value: 'regional', label: 'Regional' },
  { value: 'provinsi', label: 'Provinsi' },
  { value: 'kota', label: 'Kota/Kabupaten' },
  { value: 'kampus', label: 'Kampus' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft (Belum dipublish)' },
  { value: 'open', label: 'Published (Pendaftaran dibuka)' },
  { value: 'closed', label: 'Closed (Pendaftaran ditutup)' },
];

const tipePendaftaranOptions = [
  { value: 'internal', label: 'Internal', desc: 'Pendaftaran melalui form di website ini' },
  { value: 'eksternal', label: 'Eksternal', desc: 'Pendaftaran melalui link website penyelenggara' },
  { value: 'none', label: 'Info Only', desc: 'Hanya informasi, tanpa pendaftaran' },
];

export default function EditLombaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<LombaFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLomba = async () => {
      try {
        const res = await fetch(`/api/admin/lomba/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Gagal memuat data lomba');
        }

        const lomba = data.data;
        setFormData({
          nama_lomba: lomba.nama_lomba || '',
          slug: lomba.slug || '',
          kategori: lomba.kategori || '',
          tingkat: lomba.tingkat || 'nasional',
          penyelenggara: lomba.penyelenggara || '',
          deadline_pendaftaran: lomba.deadline_pendaftaran?.split('T')[0] || '',
          tanggal_pelaksanaan: lomba.tanggal_pelaksanaan?.split('T')[0] || '',
          lokasi: lomba.lokasi || '',
          deskripsi: lomba.deskripsi || '',
          persyaratan: lomba.persyaratan || lomba.syarat_ketentuan || '',
          hadiah: typeof lomba.hadiah === 'string' ? lomba.hadiah : JSON.stringify(lomba.hadiah || ''),
          link_pendaftaran: lomba.link_pendaftaran || '',
          cp_nama: lomba.cp_nama || lomba.kontak_panitia?.nama || '',
          cp_whatsapp: lomba.cp_whatsapp || lomba.kontak_panitia?.whatsapp || '',
          biaya_pendaftaran: lomba.biaya_pendaftaran || lomba.biaya || 0,
          is_featured: lomba.is_featured || false,
          status: lomba.status || 'draft',
          tipe_pendaftaran: lomba.tipe_pendaftaran || 'internal',
          poster: lomba.poster_url || lomba.poster || '',
          thumbnail: lomba.thumbnail || '',
          posters: lomba.posters || [],
          additional_fields: lomba.additional_fields || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLomba();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => prev ? ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value,
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/lomba/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengupdate lomba');
      }

      router.push('/admin/lomba');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Data lomba tidak ditemukan'}</p>
        <Link href="/admin/lomba" className="text-blue-600 hover:underline mt-4 inline-block">
          Kembali ke daftar lomba
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/lomba"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Lomba</h1>
          <p className="text-slate-600">{formData.nama_lomba}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Lomba <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_lomba"
                value={formData.nama_lomba}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Penyelenggara <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="penyelenggara"
                value={formData.penyelenggara}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tingkat <span className="text-red-500">*</span>
              </label>
              <select
                name="tingkat"
                value={formData.tingkat}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tingkatOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Poster Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Poster Lomba</h2>
          <ImageUpload
            value={formData.poster}
            onChange={(value) => setFormData(prev => prev ? ({ ...prev, poster: value as string }) : null)}
            category="lomba"
            label="Upload Poster"
            helperText="Ukuran rekomendasi: 800x1200px (Portrait). Max 5MB."
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Thumbnail (16:9)</h2>
          <ImageUpload
            value={formData.thumbnail}
            onChange={(value) => setFormData(prev => prev ? ({ ...prev, thumbnail: value as string }) : null)}
            category="lomba"
            label="Upload Thumbnail"
            helperText="Thumbnail untuk tampilan card/list. Ukuran: 800x450px (16:9). Max 5MB."
          />
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Thumbnail akan diprioritaskan untuk tampilan card. Jika kosong, akan menggunakan poster utama.
            </p>
          </div>
        </div>

        {/* Multiple Posters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Poster/Flyer Tambahan</h2>
          <div className="space-y-4">
            {formData.posters?.map((poster, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <ImageUpload
                    value={poster}
                    onChange={(value) => {
                      if (!formData) return;
                      const newPosters = [...(formData.posters || [])];
                      newPosters[index] = value as string;
                      setFormData(prev => prev ? ({ ...prev, posters: newPosters }) : null);
                    }}
                    category="lomba"
                    label={`Poster ${index + 1}`}
                    helperText="Max 5MB"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData) return;
                    const newPosters = (formData.posters || []).filter((_, i) => i !== index);
                    setFormData(prev => prev ? ({ ...prev, posters: newPosters }) : null);
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors mb-6"
                >
                  Hapus
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData(prev => prev ? ({ ...prev, posters: [...(prev.posters || []), ''] }) : null)}
              className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + Tambah Poster/Flyer
            </button>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Field Tambahan</h2>
          <p className="text-sm text-slate-600 mb-4">
            Tambahkan informasi tambahan seperti Link Panduan, Link Grup, dll.
          </p>
          <div className="space-y-3">
            {formData.additional_fields?.map((field, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => {
                      if (!formData) return;
                      const newFields = [...(formData.additional_fields || [])];
                      newFields[index].label = e.target.value;
                      setFormData(prev => prev ? ({ ...prev, additional_fields: newFields }) : null);
                    }}
                    placeholder="Label (contoh: Link Panduan)"
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => {
                      if (!formData) return;
                      const newFields = [...(formData.additional_fields || [])];
                      newFields[index].value = e.target.value;
                      setFormData(prev => prev ? ({ ...prev, additional_fields: newFields }) : null);
                    }}
                    placeholder="Value (contoh: https://...)"
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData) return;
                    const newFields = (formData.additional_fields || []).filter((_, i) => i !== index);
                    setFormData(prev => prev ? ({ ...prev, additional_fields: newFields }) : null);
                  }}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                >
                  Hapus
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData(prev => prev ? ({ 
                ...prev, 
                additional_fields: [...(prev.additional_fields || []), { label: '', value: '' }] 
              }) : null)}
              className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + Tambah Field
            </button>
          </div>
        </div>

        {/* Tipe Pendaftaran */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mode Pendaftaran</h2>
          <div className="space-y-3">
            {tipePendaftaranOptions.map(opt => (
              <label 
                key={opt.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.tipe_pendaftaran === opt.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="tipe_pendaftaran"
                  value={opt.value}
                  checked={formData.tipe_pendaftaran === opt.value}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-slate-800">{opt.label}</span>
                  <p className="text-sm text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          
          {formData.tipe_pendaftaran === 'eksternal' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Link Pendaftaran Eksternal <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="link_pendaftaran"
                value={formData.link_pendaftaran}
                onChange={handleChange}
                required={formData.tipe_pendaftaran === 'eksternal'}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://website-penyelenggara.com/daftar"
              />
            </div>
          )}

          {formData.tipe_pendaftaran === 'internal' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Pendaftaran akan menggunakan form bawaan website.
              </p>
            </div>
          )}

          {formData.tipe_pendaftaran === 'none' && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <Info size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                Lomba ini hanya menampilkan informasi tanpa tombol pendaftaran.
              </p>
            </div>
          )}
        </div>

        {/* Date & Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tanggal & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Deadline Pendaftaran
              </label>
              <input
                type="date"
                name="deadline_pendaftaran"
                value={formData.deadline_pendaftaran}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                name="tanggal_pelaksanaan"
                value={formData.tanggal_pelaksanaan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lokasi
              </label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Deskripsi Lomba</h2>
          <RichTextEditor
            content={formData.deskripsi}
            onChange={(content) => setFormData(prev => prev ? { ...prev, deskripsi: content } : null)}
            placeholder="Tulis deskripsi lengkap tentang lomba ini..."
          />
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Persyaratan</h2>
          <RichTextEditor
            content={formData.persyaratan}
            onChange={(content) => setFormData(prev => prev ? { ...prev, persyaratan: content } : null)}
            placeholder="Tulis persyaratan peserta lomba..."
          />
        </div>

        {/* Prizes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Hadiah</h2>
          <RichTextEditor
            content={formData.hadiah}
            onChange={(content) => setFormData(prev => prev ? { ...prev, hadiah: content } : null)}
            placeholder="Tulis informasi hadiah lomba..."
          />
        </div>

        {/* Biaya & Contact */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Biaya & Kontak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Biaya Pendaftaran (Rp)
              </label>
              <input
                type="number"
                name="biaya_pendaftaran"
                value={formData.biaya_pendaftaran}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Contact Person
              </label>
              <input
                type="text"
                name="cp_nama"
                value={formData.cp_nama}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                WhatsApp Contact Person
              </label>
              <input
                type="text"
                name="cp_whatsapp"
                value={formData.cp_whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Opsi</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-slate-800">Tampilkan di Featured</span>
              <p className="text-sm text-slate-500">Lomba akan ditampilkan di halaman utama</p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/lomba"
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Update Lomba</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
