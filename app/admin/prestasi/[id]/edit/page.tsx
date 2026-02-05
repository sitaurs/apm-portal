'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  FileText,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Star,
  Globe,
  AlertCircle,
  Upload,
  Trash2,
  X
} from 'lucide-react';
import Image from 'next/image';
import { BackButton } from '@/components/admin/BackButton';

interface PrestasiData {
  id: number;
  submission_id: number;
  judul: string;
  slug: string;
  nama_lomba: string;
  tingkat: string;
  peringkat: string;
  tahun: number;
  kategori: string | null;
  deskripsi: string | null;
  thumbnail: string | null;
  galeri: string[];
  sertifikat: string | null;
  sertifikat_public: boolean;
  link_berita: string | null;
  link_portofolio: string | null;
  is_featured: boolean;
  is_published: boolean;
  submission?: {
    team_members: Array<{
      nama: string;
      nim: string;
      prodi: string | null;
      is_ketua: boolean;
    }>;
    pembimbing: Array<{
      nama: string;
      nidn: string | null;
    }>;
    documents: Array<{
      id: number;
      type: string;
      file_path: string;
      file_name: string;
    }>;
  };
}

export default function AdminPrestasiEditPage() {
  const router = useRouter();
  const params = useParams();
  const prestasiId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [prestasi, setPrestasi] = useState<PrestasiData | null>(null);
  const [formData, setFormData] = useState({
    judul: '',
    slug: '',
    nama_lomba: '',
    tingkat: '',
    peringkat: '',
    tahun: new Date().getFullYear(),
    kategori: '',
    deskripsi: '',
    thumbnail: '',
    galeri: [] as string[],
    sertifikat: '',
    sertifikat_public: false,
    link_berita: '',
    link_portofolio: '',
    is_featured: false,
    is_published: true,
  });

  // For Cloudinary upload
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGaleri, setUploadingGaleri] = useState(false);
  const [uploadingSertifikat, setUploadingSertifikat] = useState(false);

  // Fetch prestasi data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prestasi/${prestasiId}/edit`);
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Gagal memuat data');
      }
      
      setPrestasi(result.data);
      setFormData({
        judul: result.data.judul || '',
        slug: result.data.slug || '',
        nama_lomba: result.data.nama_lomba || '',
        tingkat: result.data.tingkat || '',
        peringkat: result.data.peringkat || '',
        tahun: result.data.tahun || new Date().getFullYear(),
        kategori: result.data.kategori || '',
        deskripsi: result.data.deskripsi || '',
        thumbnail: result.data.thumbnail || '',
        galeri: result.data.galeri || [],
        sertifikat: result.data.sertifikat || '',
        sertifikat_public: result.data.sertifikat_public || false,
        link_berita: result.data.link_berita || '',
        link_portofolio: result.data.link_portofolio || '',
        is_featured: result.data.is_featured || false,
        is_published: result.data.is_published ?? true,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [prestasiId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from judul
    if (field === 'judul') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'apm_preset');
    cloudinaryFormData.append('folder', 'apm/prestasi');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: cloudinaryFormData }
      );
      const data = await res.json();
      return data.secure_url || null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  // Upload for raw files (PDF, etc)
  const uploadToCloudinaryRaw = async (file: File): Promise<string | null> => {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'apm_preset');
    cloudinaryFormData.append('folder', 'apm/sertifikat');

    try {
      // Use auto resource_type to handle both images and PDFs
      const resourceType = file.type.includes('pdf') ? 'raw' : 'image';
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        { method: 'POST', body: cloudinaryFormData }
      );
      const data = await res.json();
      return data.secure_url || null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({ ...prev, thumbnail: url }));
    } else {
      alert('Gagal upload thumbnail');
    }
    setUploadingThumbnail(false);
  };

  const handleGaleriUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGaleri(true);
    const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(url => url !== null) as string[];
    
    if (validUrls.length > 0) {
      setFormData(prev => ({ ...prev, galeri: [...prev.galeri, ...validUrls] }));
    }
    setUploadingGaleri(false);
  };

  const removeGaleriImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galeri: prev.galeri.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/prestasi/${prestasiId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyimpan perubahan');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/prestasi');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatPeringkat = (peringkat: string) => {
    const peringkatMap: Record<string, string> = {
      'juara_1': 'Juara 1',
      'juara_2': 'Juara 2',
      'juara_3': 'Juara 3',
      'harapan_1': 'Harapan 1',
      'harapan_2': 'Harapan 2',
      'harapan_3': 'Harapan 3',
      'finalis': 'Finalis',
      'best_presenter': 'Best Presenter',
      'best_paper': 'Best Paper',
      'medali_emas': 'Medali Emas',
      'medali_perak': 'Medali Perak',
      'medali_perunggu': 'Medali Perunggu',
    };
    return peringkatMap[peringkat] || peringkat;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error && !prestasi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Prestasi</h1>
          <p className="text-slate-600">Ubah data prestasi yang sudah dipublikasikan</p>
        </div>
        {prestasi?.slug && (
          <a
            href={`/prestasi/${prestasi.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <ExternalLink size={16} />
            <span>Lihat di Website</span>
          </a>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="text-green-600" size={20} />
          <span className="text-green-700">Perubahan berhasil disimpan! Mengarahkan...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Informasi Dasar</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Judul Prestasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => handleChange('judul', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slug URL
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">/prestasi/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Lomba <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_lomba}
                    onChange={(e) => handleChange('nama_lomba', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tahun
                  </label>
                  <input
                    type="number"
                    value={formData.tahun}
                    onChange={(e) => handleChange('tahun', parseInt(e.target.value))}
                    min="2000"
                    max="2100"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tingkat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => handleChange('tingkat', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Tingkat</option>
                    <option value="internasional">Internasional</option>
                    <option value="nasional">Nasional</option>
                    <option value="regional">Regional</option>
                    <option value="provinsi">Provinsi</option>
                    <option value="universitas">Universitas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Peringkat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.peringkat}
                    onChange={(e) => handleChange('peringkat', e.target.value)}
                    placeholder="Juara 1, Finalis, dll"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.kategori}
                  onChange={(e) => handleChange('kategori', e.target.value)}
                  placeholder="Teknologi, Sains, Seni, dll"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => handleChange('deskripsi', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi prestasi..."
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Media</h2>
            
            <div className="space-y-6">
              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thumbnail
                </label>
                <div className="flex items-start gap-4">
                  {formData.thumbnail ? (
                    <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-slate-200">
                      <Image
                        src={formData.thumbnail}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                      <ImageIcon className="text-slate-400" size={24} />
                    </div>
                  )}
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer">
                      {uploadingThumbnail ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>{uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        disabled={uploadingThumbnail}
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-1">Rasio 16:9 direkomendasikan</p>
                  </div>
                </div>
              </div>

              {/* Galeri */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Galeri
                </label>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {formData.galeri.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <Image
                        src={url}
                        alt={`Galeri ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGaleriImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                    {uploadingGaleri ? (
                      <Loader2 className="animate-spin text-slate-400" size={24} />
                    ) : (
                      <>
                        <Upload className="text-slate-400" size={24} />
                        <span className="text-xs text-slate-400 mt-1">Tambah</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGaleriUpload}
                      className="hidden"
                      disabled={uploadingGaleri}
                    />
                  </label>
                </div>
              </div>

              {/* Sertifikat */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sertifikat / Piagam
                </label>
                <div className="space-y-3">
                  {/* Preview */}
                  {formData.sertifikat && (
                    <div className="relative border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="flex items-center gap-3">
                        {formData.sertifikat.toLowerCase().includes('.pdf') ? (
                          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="text-red-600" size={32} />
                          </div>
                        ) : (
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={formData.sertifikat}
                              alt="Sertifikat"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {formData.sertifikat.split('/').pop()}
                          </p>
                          <a 
                            href={formData.sertifikat} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Lihat File
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, sertifikat: '' }))}
                          className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                    {uploadingSertifikat ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Upload size={20} className="text-slate-400" />
                    )}
                    <span className="text-sm text-slate-600">
                      {uploadingSertifikat ? 'Mengupload...' : formData.sertifikat ? 'Ganti Sertifikat' : 'Upload Sertifikat'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingSertifikat(true);
                        const url = await uploadToCloudinaryRaw(file);
                        if (url) {
                          setFormData(prev => ({ ...prev, sertifikat: url }));
                        } else {
                          alert('Gagal upload sertifikat');
                        }
                        setUploadingSertifikat(false);
                        e.target.value = '';
                      }}
                      className="hidden"
                      disabled={uploadingSertifikat}
                    />
                  </label>
                  <p className="text-xs text-slate-500">Format: JPG, PNG, PDF (maks. 10MB)</p>
                </div>
                
                <label className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    checked={formData.sertifikat_public}
                    onChange={(e) => handleChange('sertifikat_public', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-600">Tampilkan sertifikat ke publik</span>
                </label>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Tautan</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Berita
                </label>
                <input
                  type="url"
                  value={formData.link_berita}
                  onChange={(e) => handleChange('link_berita', e.target.value)}
                  placeholder="https://berita.example.com/..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Portofolio
                </label>
                <input
                  type="url"
                  value={formData.link_portofolio}
                  onChange={(e) => handleChange('link_portofolio', e.target.value)}
                  placeholder="https://github.com/... atau https://example.com/..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Globe className="text-slate-500" size={20} />
                  <span className="text-sm font-medium text-slate-700">Publikasikan</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleChange('is_published', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Star className="text-slate-500" size={20} />
                  <span className="text-sm font-medium text-slate-700">Featured</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded"
                />
              </label>
            </div>
          </div>

          {/* Team Info (Read-only from submission) */}
          {prestasi?.submission?.team_members && prestasi.submission.team_members.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Tim</h2>
              <div className="space-y-3">
                {prestasi.submission.team_members.map((member, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-800">
                      {member.nama}
                      {member.is_ketua && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Ketua</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">{member.nim}</p>
                    {member.prodi && <p className="text-sm text-slate-500">{member.prodi}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
