'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Info, X } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import ImageUpload from '@/components/admin/ImageUpload';

interface TeamMember {
  nim: string;
  nama: string;
  prodi?: string;
  angkatan?: string;
  whatsapp?: string;
  is_ketua?: boolean;
}

interface Pembimbing {
  nama: string;
  nidn?: string;
  whatsapp?: string;
}

interface Document {
  type: string;
  label?: string;
  file_path: string;
  file_name: string;
}

interface PrestasiFormData {
  // Basic Info
  judul: string;
  nama_lomba: string;
  tingkat: string;
  peringkat: string;
  tahun: number;
  tanggal?: string;
  penyelenggara?: string;
  tempat?: string;
  deskripsi?: string;
  
  // Media (Cloudinary URLs)
  thumbnail: string;
  galeri: string[];
  sertifikat?: string;
  sertifikat_public: boolean;
  
  // Relations
  team_members: TeamMember[];
  pembimbing: Pembimbing[];
  documents: Document[];
  
  // Display Settings
  is_featured: boolean;
  add_to_calendar: boolean;
}

const initialFormData: PrestasiFormData = {
  judul: '',
  nama_lomba: '',
  tingkat: 'nasional',
  peringkat: 'juara_1',
  tahun: new Date().getFullYear(),
  tanggal: '',
  penyelenggara: '',
  tempat: '',
  deskripsi: '',
  thumbnail: '',
  galeri: [],
  sertifikat: '',
  sertifikat_public: false,
  team_members: [{ nim: '', nama: '', prodi: '', angkatan: '', whatsapp: '', is_ketua: true }],
  pembimbing: [],
  documents: [],
  is_featured: false,
  add_to_calendar: true,
};

const tingkatOptions = [
  { value: 'internasional', label: 'Internasional' },
  { value: 'nasional', label: 'Nasional' },
  { value: 'regional', label: 'Regional' },
  { value: 'provinsi', label: 'Provinsi' },
  { value: 'kota', label: 'Kota/Kabupaten' },
  { value: 'kampus', label: 'Kampus' },
];

const peringkatOptions = [
  { value: 'juara_1', label: 'Juara 1' },
  { value: 'juara_2', label: 'Juara 2' },
  { value: 'juara_3', label: 'Juara 3' },
  { value: 'harapan_1', label: 'Harapan 1' },
  { value: 'harapan_2', label: 'Harapan 2' },
  { value: 'harapan_3', label: 'Harapan 3' },
  { value: 'finalis', label: 'Finalis' },
  { value: 'semifinalis', label: 'Semifinalis' },
  { value: 'peserta_terbaik', label: 'Peserta Terbaik' },
  { value: 'honorable_mention', label: 'Honorable Mention' },
  { value: 'best_paper', label: 'Best Paper' },
  { value: 'best_presentation', label: 'Best Presentation' },
  { value: 'lainnya', label: 'Lainnya (Ketik Manual)' },
];

export default function CreatePrestasiPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PrestasiFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customPeringkat, setCustomPeringkat] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Reset custom peringkat when changing from dropdown
    if (name === 'peringkat' && value !== 'lainnya') {
      setCustomPeringkat('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || new Date().getFullYear() : value,
    }));
  };

  // Team Members Management
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [...prev.team_members, { nim: '', nama: '', prodi: '', angkatan: '', whatsapp: '', is_ketua: false }],
    }));
  };

  const removeTeamMember = (index: number) => {
    if (formData.team_members.length > 1) {
      setFormData(prev => ({
        ...prev,
        team_members: prev.team_members.filter((_, i) => i !== index),
      }));
    }
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  // Pembimbing Management
  const addPembimbing = () => {
    setFormData(prev => ({
      ...prev,
      pembimbing: [...prev.pembimbing, { nama: '', nidn: '', whatsapp: '' }],
    }));
  };

  const removePembimbing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pembimbing: prev.pembimbing.filter((_, i) => i !== index),
    }));
  };

  const updatePembimbing = (index: number, field: keyof Pembimbing, value: string) => {
    setFormData(prev => ({
      ...prev,
      pembimbing: prev.pembimbing.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  // Documents Management
  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { type: 'proposal', label: '', file_path: '', file_name: '' }],
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const updateDocument = (index: number, field: keyof Document, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      ),
    }));
  };

  // Galeri Management
  const addGaleriImage = (url: string) => {
    if (formData.galeri.length < 10) {
      setFormData(prev => ({
        ...prev,
        galeri: [...prev.galeri, url],
      }));
    }
  };

  const removeGaleriImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galeri: prev.galeri.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate thumbnail
    if (!formData.thumbnail) {
      setError('Thumbnail wajib diupload');
      return;
    }

    // Filter out empty team members
    const cleanedTeamMembers = formData.team_members.filter(
      member => member.nim && member.nama
    );

    if (cleanedTeamMembers.length === 0) {
      setError('Minimal harus ada 1 anggota tim dengan NIM dan Nama terisi');
      return;
    }

    // Filter out empty pembimbing
    const cleanedPembimbing = formData.pembimbing.filter(p => p.nama);

    // Filter out empty documents
    const cleanedDocuments = formData.documents.filter(d => d.file_path && d.file_name);

    setIsSubmitting(true);

    try {
      const payload = {
        judul: formData.judul,
        nama_lomba: formData.nama_lomba,
        tingkat: formData.tingkat,
        peringkat: formData.peringkat === 'lainnya' && customPeringkat ? customPeringkat : formData.peringkat,
        tahun: formData.tahun,
        penyelenggara: formData.penyelenggara || undefined,
        tanggal: formData.tanggal || undefined,
        kategori: undefined, // Not in form yet
        deskripsi: formData.deskripsi || undefined,
        thumbnail: formData.thumbnail,
        galeri: formData.galeri.length > 0 ? formData.galeri : undefined,
        sertifikat: formData.sertifikat || undefined,
        sertifikat_public: formData.sertifikat_public,
        link_berita: undefined, // Not in form yet
        link_portofolio: undefined, // Not in form yet
        is_featured: formData.is_featured,
        is_published: true,
        team_members: cleanedTeamMembers,
        pembimbing: cleanedPembimbing.length > 0 ? cleanedPembimbing : undefined,
        documents: cleanedDocuments.length > 0 ? cleanedDocuments : undefined,
        add_to_calendar: formData.add_to_calendar,
      };

      console.log('Payload being sent:', JSON.stringify(payload, null, 2));

      const res = await fetch('/api/admin/prestasi/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.error || 'Gagal membuat prestasi');
      }

      router.push('/admin/prestasi');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/prestasi"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Prestasi Baru</h1>
          <p className="text-slate-600">Isi form untuk menambahkan prestasi langsung tanpa melalui form submit</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-3">
            <Info size={20} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Judul Prestasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Juara 1 Hackathon Nasional 2024"
              />
            </div>

            <div>
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
                placeholder="Contoh: Hackathon Nasional 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Penyelenggara
              </label>
              <input
                type="text"
                name="penyelenggara"
                value={formData.penyelenggara}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Kementerian Pendidikan"
              />
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Peringkat <span className="text-red-500">*</span>
              </label>
              <select
                name="peringkat"
                value={formData.peringkat}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {peringkatOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              
              {formData.peringkat === 'lainnya' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customPeringkat}
                    onChange={(e) => setCustomPeringkat(e.target.value)}
                    placeholder="Ketik peringkat custom (misal: Gold Medal, Champion, dll)"
                    required
                    className="w-full px-4 py-2.5 border border-yellow-400 bg-yellow-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <p className="text-xs text-yellow-700 mt-1">
                    💡 Ketik peringkat custom yang tidak ada di pilihan dropdown
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tahun <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                required
                min="2000"
                max="2100"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tempat Pelaksanaan
              </label>
              <input
                type="text"
                name="tempat"
                value={formData.tempat}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Jakarta / Online"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Deskripsi</h2>
          <RichTextEditor
            content={formData.deskripsi || ''}
            onChange={(content) => setFormData(prev => ({ ...prev, deskripsi: content }))}
            placeholder="Tulis deskripsi lengkap tentang prestasi ini..."
          />
        </div>

        {/* Thumbnail Upload - REQUIRED */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-slate-800">Thumbnail</h2>
            <span className="text-red-500 text-sm">* Wajib</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Gambar utama yang akan ditampilkan di halaman prestasi. Ukuran rekomendasi: 1200x800px (Landscape). Max 5MB.
          </p>
          <ImageUpload
            value={formData.thumbnail}
            onChange={(value) => setFormData(prev => ({ ...prev, thumbnail: value as string }))}
            category="prestasi"
            label="Upload Thumbnail"
            helperText="Format: JPG, PNG, WebP. Gambar akan otomatis dioptimasi via Cloudinary."
          />
          {!formData.thumbnail && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Thumbnail wajib diupload sebelum menyimpan prestasi
              </p>
            </div>
          )}
        </div>

        {/* Galeri Upload - OPTIONAL (Max 10) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Galeri Dokumentasi</h2>
              <p className="text-sm text-slate-600 mt-1">
                Foto-foto dokumentasi prestasi (opsional, maksimal 10 foto)
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {formData.galeri.length} / 10 foto
            </span>
          </div>
          
          {/* Galeri Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {formData.galeri.map((url, index) => (
              <div key={index} className="relative group aspect-square border border-slate-200 rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`Galeri ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGaleriImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {formData.galeri.length < 10 && (
            <ImageUpload
              value=""
              onChange={(value) => addGaleriImage(value as string)}
              category="prestasi"
              label={`Tambah Foto Galeri (${10 - formData.galeri.length} slot tersisa)`}
              helperText="Upload satu per satu. Ukuran rekomendasi: 800x600px."
            />
          )}

          {formData.galeri.length >= 10 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Maksimal 10 foto telah tercapai. Hapus foto untuk menambah yang baru.
              </p>
            </div>
          )}
        </div>

        {/* Sertifikat Upload - OPTIONAL */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Sertifikat</h2>
          <p className="text-sm text-slate-600 mb-4">
            Upload sertifikat prestasi (opsional)
          </p>
          <ImageUpload
            value={formData.sertifikat || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, sertifikat: value as string }))}
            category="prestasi"
            label="Upload Sertifikat"
            helperText="Format: JPG, PNG, PDF. Max 5MB."
          />
          {formData.sertifikat && (
            <label className="flex items-center gap-3 mt-4 cursor-pointer">
              <input
                type="checkbox"
                name="sertifikat_public"
                checked={formData.sertifikat_public}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <span className="font-medium text-slate-800">Tampilkan Sertifikat ke Publik</span>
                <p className="text-sm text-slate-500">Jika dicentang, sertifikat dapat dilihat dan diunduh oleh publik</p>
              </div>
            </label>
          )}
        </div>

        {/* Team Members - REQUIRED (Min 1) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Anggota Tim</h2>
              <p className="text-sm text-slate-600 mt-1">Minimal 1 anggota wajib diisi</p>
            </div>
            <button
              type="button"
              onClick={addTeamMember}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Tambah Anggota</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.team_members.map((member, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-slate-700">Anggota {index + 1}</span>
                  {formData.team_members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      NIM <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.nim}
                      onChange={(e) => updateTeamMember(index, 'nim', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 2110101020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.nama}
                      onChange={(e) => updateTeamMember(index, 'nama', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama lengkap mahasiswa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Program Studi
                    </label>
                    <input
                      type="text"
                      value={member.prodi || ''}
                      onChange={(e) => updateTeamMember(index, 'prodi', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Teknik Informatika"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Angkatan
                    </label>
                    <input
                      type="text"
                      value={member.angkatan || ''}
                      onChange={(e) => updateTeamMember(index, 'angkatan', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 2021"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={member.whatsapp || ''}
                      onChange={(e) => updateTeamMember(index, 'whatsapp', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={member.is_ketua || false}
                        onChange={(e) => updateTeamMember(index, 'is_ketua', e.target.checked)}
                        className="w-4 h-4 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      Ketua Tim
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pembimbing - OPTIONAL */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Pembimbing</h2>
              <p className="text-sm text-slate-600 mt-1">Opsional</p>
            </div>
            <button
              type="button"
              onClick={addPembimbing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              <span>Tambah Pembimbing</span>
            </button>
          </div>

          {formData.pembimbing.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-600">
              Belum ada pembimbing. Klik tombol "Tambah Pembimbing" untuk menambahkan.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.pembimbing.map((p, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-slate-700">Pembimbing {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePembimbing(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nama Pembimbing <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={p.nama}
                        onChange={(e) => updatePembimbing(index, 'nama', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama lengkap dosen"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        NIDN
                      </label>
                      <input
                        type="text"
                        value={p.nidn || ''}
                        onChange={(e) => updatePembimbing(index, 'nidn', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="NIDN dosen"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        value={p.whatsapp || ''}
                        onChange={(e) => updatePembimbing(index, 'whatsapp', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents - OPTIONAL */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Dokumen Pendukung</h2>
              <p className="text-sm text-slate-600 mt-1">Opsional (proposal, laporan, dll)</p>
            </div>
            <button
              type="button"
              onClick={addDocument}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
              <span>Tambah Dokumen</span>
            </button>
          </div>

          {formData.documents.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-600">
              Belum ada dokumen. Klik tombol "Tambah Dokumen" untuk menambahkan.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.documents.map((doc, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-slate-700">Dokumen {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tipe Dokumen <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={doc.type}
                          onChange={(e) => updateDocument(index, 'type', e.target.value)}
                          required
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="proposal">Proposal</option>
                          <option value="laporan">Laporan</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Label (Opsional)
                        </label>
                        <input
                          type="text"
                          value={doc.label || ''}
                          onChange={(e) => updateDocument(index, 'label', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Contoh: Proposal Lomba"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        URL File <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={doc.file_path}
                        onChange={(e) => updateDocument(index, 'file_path', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://res.cloudinary.com/..."
                      />
                      <p className="text-xs text-slate-500 mt-1">Upload file ke Cloudinary terlebih dahulu, lalu paste URL-nya di sini</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nama File <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={doc.file_name}
                        onChange={(e) => updateDocument(index, 'file_name', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: proposal-lomba.pdf"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan Tampilan</h2>
          <div className="space-y-4">
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
                <p className="text-sm text-slate-500">Prestasi akan ditampilkan di halaman utama</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="add_to_calendar"
                checked={formData.add_to_calendar}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <span className="font-medium text-slate-800">Tambahkan ke Kalender</span>
                <p className="text-sm text-slate-500">Prestasi akan muncul di halaman kalender (jika ada tanggal pelaksanaan)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/prestasi"
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.thumbnail}
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
                <span>Simpan Prestasi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
