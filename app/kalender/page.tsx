'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Badge, Button, SearchInput, FilterChip, Breadcrumb } from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Filter,
  List,
  Grid3X3,
  Trophy,
  Users,
  Ticket,
  ExternalLink,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Types
interface CalendarEvent {
  id: string;
  title: string;
  type: 'lomba' | 'expo' | 'deadline' | 'event';
  startDate: string;
  endDate?: string;
  time?: string;
  lokasi?: string;
  description?: string;
  link?: string;
  kategori?: string;
  isUrgent?: boolean;
}

const eventTypeColors: Record<string, { bg: string; text: string; dot: string }> = {
  lomba: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  expo: { bg: 'bg-secondary/10', text: 'text-secondary', dot: 'bg-secondary' },
  deadline: { bg: 'bg-error/10', text: 'text-error', dot: 'bg-error' },
  event: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
};

const eventTypeLabels: Record<string, string> = {
  lomba: 'Lomba',
  expo: 'Expo',
  deadline: 'Deadline',
  event: 'Event',
};

export default function KalenderPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from API when month changes
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const month = currentMonth.getMonth() + 1; // 1-based month
        const year = currentMonth.getFullYear();
        const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
        const data = await res.json();

        if (data.success && data.data && Array.isArray(data.data.events)) {
          // Transform snake_case from API to camelCase for frontend
          const transformedEvents = data.data.events.map((event: Record<string, unknown>) => ({
            id: event.id,
            title: event.title,
            type: event.type,
            startDate: event.start_date,
            endDate: event.end_date,
            time: event.time,
            lokasi: event.lokasi,
            description: event.description,
            link: event.link,
            kategori: event.kategori,
            isUrgent: event.is_urgent,
          }));
          setEvents(transformedEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [currentMonth]);

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get start day of week (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event: CalendarEvent) => {
      // Type filter
      if (activeFilters.length > 0 && !activeFilters.includes(event.type)) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.kategori?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeFilters, searchQuery, events]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return filteredEvents.filter((event: CalendarEvent) => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
      return date >= eventStart && date <= eventEnd;
    });
  };

  // Get events for selected date or upcoming events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = filteredEvents
    .filter((event: CalendarEvent) => parseISO(event.startDate) >= new Date())
    .slice(0, 5);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev =>
      prev.includes(type)
        ? prev.filter(f => f !== type)
        : [...prev, type]
    );
  };

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white py-8">
        <div className="container-apm">
          <Breadcrumb
            items={[{ label: 'Kalender Event' }]}
            className="mb-4 text-white/80"
          />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-heading mb-2">
                Kalender Event
              </h1>
              <p className="text-white/80">
                Lihat semua jadwal lomba, expo, dan event penting dalam satu kalender
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold">{events.filter((e: CalendarEvent) => e.type === 'lomba' || e.type === 'deadline').length}</p>
                <p className="text-xs text-white/70">Lomba Bulan Ini</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold">{events.filter((e: CalendarEvent) => e.type === 'expo' || e.type === 'event').length}</p>
                <p className="text-xs text-white/70">Event Bulan Ini</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-100 py-4 sticky top-0 z-10">
        <div className="container-apm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Event Type Filters */}
              <span className="text-sm text-text-muted flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter:
              </span>
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <FilterChip
                  key={type}
                  label={label}
                  isActive={activeFilters.includes(type)}
                  onClick={() => toggleFilter(type)}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="w-64">
                <SearchInput
                  placeholder="Cari event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'calendar'
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-muted hover:bg-gray-50'
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-muted hover:bg-gray-50'
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-apm py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar / List View */}
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? (
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-text-main">
                    {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date())}
                    >
                      Hari Ini
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                  {/* Week Days Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-text-muted py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-32 bg-gray-50 rounded-lg" />
                    ))}

                    {/* Days of the month */}
                    {daysInMonth.map(day => {
                      const events = getEventsForDate(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isCurrentDay = isSameDay(day, new Date()); // Real current day

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            'h-32 p-2 rounded-lg transition-all text-left flex flex-col border border-gray-100',
                            isSelected
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-gray-50 hover:shadow-md',
                            isCurrentDay && 'bg-primary/10 border-primary/30'
                          )}
                        >
                          <span className={cn(
                            'text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1',
                            isCurrentDay && 'bg-primary text-white',
                            isSelected && !isCurrentDay && 'text-primary font-bold'
                          )}>
                            {format(day, 'd')}
                          </span>

                          {/* Event Items */}
                          <div className="flex-1 flex flex-col gap-1 mt-0.5 overflow-hidden">
                            {events.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                className={cn(
                                  'text-[10px] leading-tight px-1.5 py-1 rounded font-medium truncate',
                                  eventTypeColors[event.type].bg,
                                  eventTypeColors[event.type].text
                                )}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {events.length > 3 && (
                              <span className="text-[9px] text-text-muted font-medium px-1">+{events.length - 3} lagi</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-text-muted">Legenda:</span>
                    {Object.entries(eventTypeLabels).map(([type, label]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <div className={cn('w-3 h-3 rounded-full', eventTypeColors[type].dot)} />
                        <span className="text-sm text-text-main">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text-main">
                  Semua Event ({filteredEvents.length})
                </h2>
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-card p-5">
                <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {format(selectedDate, 'd MMMM yyyy', { locale: idLocale })}
                </h3>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <EventListItem key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">Tidak ada event pada tanggal ini.</p>
                )}
              </div>
            )}

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Event Mendatang
              </h3>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <EventListItem key={event.id} event={event} />
                ))}
              </div>
              <Link
                href="/lomba"
                className="mt-4 text-sm text-primary hover:text-primary-600 flex items-center gap-1"
              >
                Lihat semua lomba <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-primary to-primary-600 rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-4">Akses Cepat</h3>
              <div className="space-y-2">
                <Link
                  href="/lomba"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  <span>Jelajahi Lomba</span>
                </Link>
                <Link
                  href="/expo"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>Lihat Expo</span>
                </Link>
                <Link
                  href="/submission"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Ticket className="w-5 h-5" />
                  <span>Submit Prestasi</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: CalendarEvent }) {
  const colors = eventTypeColors[event.type];

  return (
    <div className="bg-white rounded-xl shadow-card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-4">
        {/* Date Badge */}
        <div className="flex-shrink-0 w-16 text-center">
          <div className="bg-primary/10 rounded-lg p-2">
            <p className="text-2xl font-bold text-primary">
              {format(parseISO(event.startDate), 'd')}
            </p>
            <p className="text-xs text-primary uppercase">
              {format(parseISO(event.startDate), 'MMM', { locale: idLocale })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={event.type === 'deadline' ? 'error' : event.type === 'expo' ? 'secondary' : 'primary'} size="sm">
              {eventTypeLabels[event.type]}
            </Badge>
            {event.isUrgent && (
              <Badge variant="error" size="sm">Mendesak</Badge>
            )}
            {event.kategori && (
              <Badge variant="outline" size="sm">{event.kategori}</Badge>
            )}
          </div>

          <h3 className="font-semibold text-text-main mb-1">{event.title}</h3>
          <p className="text-sm text-text-muted mb-2 line-clamp-2">{event.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {event.time}
              </span>
            )}
            {event.lokasi && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.lokasi}
              </span>
            )}
            {event.endDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                s.d. {format(parseISO(event.endDate), 'd MMM yyyy', { locale: idLocale })}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {event.link && (
          <Link href={event.link}>
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
              Detail
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Event List Item Component
function EventListItem({ event }: { event: CalendarEvent }) {
  const colors = eventTypeColors[event.type];

  return (
    <Link
      href={event.link || '#'}
      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-2 h-2 rounded-full mt-2', colors.dot)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-main text-sm group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
            <span>{format(parseISO(event.startDate), 'd MMM', { locale: idLocale })}</span>
            {event.time && (
              <>
                <span>â€¢</span>
                <span>{event.time}</span>
              </>
            )}
          </div>
        </div>
        <Badge
          variant={event.type === 'deadline' ? 'error' : event.type === 'expo' ? 'secondary' : 'default'}
          size="sm"
        >
          {eventTypeLabels[event.type]}
        </Badge>
      </div>
    </Link>
  );
}

