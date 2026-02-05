'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Button, 
  Badge, 
  LombaCard, 
  SearchInput, 
  FilterChip,
  Breadcrumb,
  Pagination,
  Select
} from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  Clock,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import { kategoriLomba, tingkatLomba } from '@/lib/constants';

interface LombaItem {
  id: string;
  slug: string;
  title: string;
  deadline: string | null;
  deadlineDisplay: string | null;
  kategori: string;
  tingkat: string;
  status: 'open' | 'closed' | 'coming-soon';
  isUrgent: boolean;
  isFree: boolean;
  posterUrl: string | null;
  thumbnail?: string | null;
  posters?: string[];
  additionalFields?: Array<{label: string; value: string}> | null;
}

interface LombaPageClientProps {
  initialData: LombaItem[];
}

const viewTabs = [
  { id: 'semua', label: 'Semua' },
  { id: 'mendatang', label: 'Mendatang' },
  { id: 'bergengsi', label: 'Bergengsi' },
];

export default function LombaPageClient({ initialData }: LombaPageClientProps) {
  const [lombaData] = useState<LombaItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('semua');
  const [selectedKategori, setSelectedKategori] = useState<string[]>([]);
  const [selectedTingkat, setSelectedTingkat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter logic (client-side filtering for categories/tingkat)
  const filteredLomba = lombaData.filter((lomba) => {
    const matchSearch = !searchQuery || 
      lomba.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = selectedKategori.length === 0 || 
      selectedKategori.includes(lomba.kategori);
    const matchTingkat = !selectedTingkat || lomba.tingkat === selectedTingkat;
    
    return matchSearch && matchKategori && matchTingkat;
  });

  const toggleKategori = (kategori: string) => {
    setSelectedKategori((prev) =>
      prev.includes(kategori)
        ? prev.filter((k) => k !== kategori)
        : [...prev, kategori]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedKategori([]);
    setSelectedTingkat('');
  };

  const hasActiveFilters = searchQuery || selectedKategori.length > 0 || selectedTingkat;

  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredLomba.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLomba = filteredLomba.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-apm py-6">
          <Breadcrumb items={[{ label: 'Lomba & Kompetisi' }]} />
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main mt-4">
            Lomba & Kompetisi
          </h1>
          <p className="text-text-muted mt-1">
            Temukan berbagai lomba dan kompetisi untuk mengasah kemampuanmu
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="container-apm py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchInput
                placeholder="Cari nama lomba, penyelenggara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                showClearButton
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Kategori */}
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  value=""
                  onChange={(e) => toggleKategori(e.target.value)}
                >
                  <option value="" disabled>Kategori</option>
                  {kategoriLomba.map((kat) => (
                    <option key={kat.id} value={kat.name}>{kat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>

              {/* Tingkat */}
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  value={selectedTingkat}
                  onChange={(e) => setSelectedTingkat(e.target.value)}
                >
                  <option value="">Tingkat</option>
                  {tingkatLomba.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedKategori.map((kat) => (
                <FilterChip
                  key={kat}
                  label={kat}
                  isActive={true}
                  onClick={() => toggleKategori(kat)}
                />
              ))}
              {selectedTingkat && (
                <FilterChip
                  label={selectedTingkat}
                  isActive={true}
                  onClick={() => setSelectedTingkat('')}
                />
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container-apm py-8">
        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-text-muted">
            Menampilkan <span className="font-semibold text-text-main">{filteredLomba.length}</span> lomba
          </p>
        </div>

        {/* Lomba Grid */}
        {paginatedLomba.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">Tidak ada lomba ditemukan</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "flex flex-col gap-4"
            }>
              {paginatedLomba.map((lomba) => (
                <LombaCard key={lomba.id} {...lomba} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
