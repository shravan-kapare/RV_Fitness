import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  useAdminEvents,
  useCreateEvent,
  useDeleteEvent,
  useAdminGallery,
  useCreateGalleryPost,
  useDeleteGalleryPost,
  useAdminOffers,
  useCreateOffer,
  useDeleteOffer,
  useAdminInquiries,
  useUpdateInquiryStatus,
} from '@/hooks/useCms';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { useTrainers, useUpdateTrainer } from '@/hooks/useTrainers';
import {
  Globe,
  Calendar,
  Image,
  Tag,
  Mail,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  Sparkles,
  Layers,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Phone,
  Layout,
  MessageSquare,
  Users,
  Dumbbell,
  ShieldCheck,
  Building2,
  Award,
  Sliders,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/formatters';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type CmsTab =
  | 'HOMEPAGE'
  | 'ABOUT'
  | 'MEMBERSHIPS'
  | 'FACILITIES'
  | 'TRAINERS'
  | 'EVENTS'
  | 'GALLERY'
  | 'OFFERS'
  | 'CONTACT'
  | 'GLOBAL'
  | 'INQUIRIES';

export const CmsManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Normalize initial tab
  const rawTab = (searchParams.get('tab')?.toUpperCase() as any) || 'HOMEPAGE';
  const tabMap: Record<string, CmsTab> = {
    CONTENT: 'HOMEPAGE',
    HOME: 'HOMEPAGE',
    HOMEPAGE: 'HOMEPAGE',
    ABOUT: 'ABOUT',
    MEMBERSHIPS: 'MEMBERSHIPS',
    PLANS: 'MEMBERSHIPS',
    FACILITIES: 'FACILITIES',
    EQUIPMENT: 'FACILITIES',
    TRAINERS: 'TRAINERS',
    EVENTS: 'EVENTS',
    GALLERY: 'GALLERY',
    OFFERS: 'OFFERS',
    COUPONS: 'OFFERS',
    CONTACT: 'CONTACT',
    GLOBAL: 'GLOBAL',
    SETTINGS: 'GLOBAL',
    INQUIRIES: 'INQUIRIES',
  };

  const activeTab: CmsTab = tabMap[rawTab] || 'HOMEPAGE';

  const handleTabChange = (tab: CmsTab) => {
    setSearchParams({ tab });
  };

  // 1. Settings & Content State
  const { data: settings = {}, isLoading: isLoadingSettings } = useSettings();
  const { mutateAsync: updateSettings, isPending: isSavingSettings } = useUpdateSettings();

  const [formState, setFormState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const s = settings as Record<string, string>;
      setFormState({
        // Hero
        hero_headline_line1: s['hero_headline_line1'] || 'YOUR',
        hero_headline_accent: s['hero_headline_accent'] || 'STRENGTH.',
        hero_headline_line2: s['hero_headline_line2'] || 'YOUR JOURNEY.',
        hero_tagline:
          s['hero_tagline'] ||
          'Train with purpose, work with expert guidance, and make progress at RV Fitness, Narsobawadi.',
        hero_bg_image:
          s['hero_bg_image'] ||
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop',
        hero_cta_primary: s['hero_cta_primary'] || 'Explore Memberships',
        hero_cta_secondary: s['hero_cta_secondary'] || 'Discover Our Gym',

        // Announcement Banner
        announcement_banner: s['announcement_banner'] || 'Diwali Special: Up to 20% off on Annual Memberships!',
        announcement_banner_active: s['announcement_banner_active'] || 'true',

        // About
        about_title: s['about_title'] || 'Built For Those Who Train With Intent',
        about_description:
          s['about_description'] ||
          "RV Fitness is Narsobawadi's dedicated strength and conditioning facility. Founded to bring Olympic-grade barbells, heavy dumbbells, and coaching integrity without gimmicks.",
        about_founder_quote:
          s['about_founder_quote'] || "Strength isn't given; it's earned rep by rep under the bar.",
        about_mission:
          s['about_mission'] ||
          'To cultivate physical resilience, discipline, and sustainable health through evidence-based progressive overload.',
        about_image_url:
          s['about_image_url'] ||
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',

        // Facilities & Equipment
        facilities_heading: s['facilities_heading'] || 'Engineered For Heavy Resistance',
        facilities_description:
          s['facilities_description'] ||
          'Every machine and free-weight station has been curated for anatomical alignment, safety spotters, and heavy progressive overload.',
        facilities_zone1: s['facilities_zone1'] || 'Olympic Barbells & Bumper Plates (2.5kg – 25kg)',
        facilities_zone2: s['facilities_zone2'] || 'Heavy Dumbbell Racks up to 50kg pairs',
        facilities_zone3: s['facilities_zone3'] || 'Commercial Cable Crossover & Lat Pulldown Stations',
        facilities_zone4: s['facilities_zone4'] || 'Post-Workout Steam Bath & Recovery Lounge',

        // Contact & Hours
        gym_phone: s['gym_phone'] || '+91 98765 43210',
        gym_email: s['gym_email'] || 'info@rvfitness.com',
        gym_whatsapp: s['gym_whatsapp'] || '+91 98765 43210',
        gym_address:
          s['gym_address'] ||
          'Near Datta Mandir, Main Road, Narsobawadi, Taluka Shirol, District Kolhapur, Maharashtra 416104',
        gym_operating_hours:
          s['gym_operating_hours'] ||
          'Mon–Sat: 5:30 AM – 10:30 AM & 4:30 PM – 10:00 PM | Sun: 6:00 AM – 11:00 AM',
        gym_map_url:
          s['gym_map_url'] || 'https://maps.google.com/?q=Narsobawadi+Kolhapur+Maharashtra',

        // Global / Brand
        gym_name: s['gym_name'] || 'RV Fitness',
        footer_tagline: s['footer_tagline'] || "Narsobawadi's Premier Strength & Conditioning Facility",
        logo_url: s['logo_url'] || '',
        favicon_url: s['favicon_url'] || '',
        terms_content:
          s['terms_content'] ||
          'Memberships are non-transferable and non-refundable. All athletes must follow gym floor safety guidelines.',
        privacy_content:
          s['privacy_content'] ||
          'Member personal and biometric data is stored securely and never shared with third parties.',
      });
    }
  }, [settings]);

  const handleFieldChange = (key: string, val: string) => {
    setFormState((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formState);
      toast.success('Changes saved and published to MySQL database!');
      queryClient.invalidateQueries({ queryKey: ['public-home'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (err: any) {
      toast.error('Failed to save content: ' + (err.message || 'Unknown error'));
    }
  };

  // 2. Data Hooks
  const { data: plans = [], isLoading: isLoadingPlans } = useMembershipPlans();
  const { data: trainers = [], isLoading: isLoadingTrainers } = useTrainers();
  const { mutateAsync: updateTrainer } = useUpdateTrainer();

  const { data: events = [], isLoading: isLoadingEvents } = useAdminEvents();
  const { mutate: createEvent, isPending: isCreatingEvent } = useCreateEvent();
  const { mutate: deleteEvent } = useDeleteEvent();

  const { data: gallery = [], isLoading: isLoadingGallery } = useAdminGallery();
  const { mutate: createGallery, isPending: isCreatingGallery } = useCreateGalleryPost();
  const { mutate: deleteGallery } = useDeleteGalleryPost();

  const { data: offers = [], isLoading: isLoadingOffers } = useAdminOffers();
  const { mutate: createOffer, isPending: isCreatingOffer } = useCreateOffer();
  const { mutate: deleteOffer } = useDeleteOffer();

  const { data: inquiries = [], isLoading: isLoadingInq } = useAdminInquiries();
  const { mutate: updateInquiryStatus } = useUpdateInquiryStatus();

  // Modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('RV Fitness Gym Floor');
  const [eventBanner, setEventBanner] = useState('');

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<
    'TRANSFORMATION' | 'EQUIPMENT' | 'WORKOUT' | 'FACILITY' | 'COMMUNITY'
  >('EQUIPMENT');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerCode, setOfferCode] = useState('');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('15');
  const [offerType, setOfferType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [offerFrom, setOfferFrom] = useState(new Date().toISOString().split('T')[0]);
  const [offerTo, setOfferTo] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  const handleTogglePlanActive = async (planId: string, currentActive: boolean) => {
    try {
      await api.patch(`/membership-plans/${planId}`, { isActive: !currentActive });
      toast.success(`Plan ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      queryClient.invalidateQueries({ queryKey: ['public-home'] });
    } catch (err: any) {
      toast.error('Failed to update plan status');
    }
  };

  const handleToggleTrainerPublished = async (trainerId: string, currentPublished: boolean) => {
    try {
      await updateTrainer({ id: trainerId, isPublished: !currentPublished });
      toast.success(`Trainer ${!currentPublished ? 'published' : 'hidden'} on public website`);
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['public-home'] });
    } catch (err: any) {
      toast.error('Failed to update trainer visibility');
    }
  };

  const modulesList: { id: CmsTab; label: string; icon: any; count?: number }[] = [
    { id: 'HOMEPAGE', label: '1. Homepage Editor', icon: Layout },
    { id: 'ABOUT', label: '2. About Page Editor', icon: Building2 },
    { id: 'MEMBERSHIPS', label: '3. Memberships & Plans', icon: Tag, count: plans.length },
    { id: 'FACILITIES', label: '4. Facilities & Equipment', icon: Dumbbell },
    { id: 'TRAINERS', label: '5. Certified Trainers', icon: Users, count: trainers.length },
    { id: 'EVENTS', label: '6. Events & Seminars', icon: Calendar, count: events.length },
    { id: 'GALLERY', label: '7. Photo Gallery', icon: Image, count: gallery.length },
    { id: 'OFFERS', label: '8. Offers & Coupons', icon: Sparkles, count: offers.length },
    { id: 'CONTACT', label: '9. Contact & Shift Hours', icon: MapPin },
    { id: 'GLOBAL', label: '10. Global & Legal Settings', icon: Sliders },
    {
      id: 'INQUIRIES',
      label: 'Public Inquiries Desk',
      icon: MessageSquare,
      count: inquiries.filter((i: any) => i.status === 'NEW').length,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header */}
      <div className="bg-[#111111] p-6 rounded-3xl border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#292929] text-[11px] font-mono font-bold text-[#FFC21A] mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>MODULAR WEBSITE CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Website Content & Brand Management
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-1">
            Authoritative control over all public pages, real-time MySQL persistence, and live sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" target="_blank">
            <Button variant="secondary" size="sm" className="text-xs">
              <Eye className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
              <span>Preview Public Site</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Modular Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Module Navigation Selector (3 cols) */}
        <div className="lg:col-span-3 bg-[#111111] p-3 rounded-2xl border border-[#292929] space-y-1">
          <p className="text-[10px] font-mono font-bold text-[#71717A] uppercase px-3 py-2">
            Website Sections
          </p>
          {modulesList.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleTabChange(mod.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  isActive
                    ? 'bg-[#FFC21A] text-black font-bold shadow-md shadow-[#FFC21A]/20'
                    : 'text-[#A5A5A5] hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-[#FFC21A]'}`} />
                  <span className="truncate">{mod.label}</span>
                </div>
                {mod.count !== undefined && mod.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                      isActive ? 'bg-black text-[#FFC21A]' : 'bg-[#1F1F24] text-zinc-300'
                    }`}
                  >
                    {mod.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Module Workspace (9 cols) */}
        <div className="lg:col-span-9 bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6 shadow-xl">
          {/* ======================================================== */}
          {/* 1. HOMEPAGE EDITOR */}
          {/* ======================================================== */}
          {activeTab === 'HOMEPAGE' && (
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">1. Homepage Hero & Banner Editor</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Configure headlines, background visuals, and announcement bar</p>
                </div>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingSettings}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Publish to Website</span>
                </Button>
              </div>

              {/* Announcement Banner */}
              <div className="p-4 rounded-2xl bg-[#171717] border border-[#292929] space-y-3">
                <span className="text-[11px] font-mono font-bold text-[#FFC21A] uppercase tracking-wider block">
                  Top Announcement Ticker
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <div className="md:col-span-3">
                    <Input
                      label="Announcement Banner Text"
                      value={formState['announcement_banner'] || ''}
                      onChange={(e) => handleFieldChange('announcement_banner', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#888] uppercase mb-1.5">
                      Display Banner
                    </label>
                    <select
                      value={formState['announcement_banner_active'] || 'true'}
                      onChange={(e) => handleFieldChange('announcement_banner_active', e.target.value)}
                      className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFC21A]"
                    >
                      <option value="true">Active (Visible)</option>
                      <option value="false">Hidden (Disabled)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Headline Split */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Headline Line 1"
                  value={formState['hero_headline_line1'] || ''}
                  onChange={(e) => handleFieldChange('hero_headline_line1', e.target.value)}
                />
                <Input
                  label="Accent Word (Golden Highlight)"
                  value={formState['hero_headline_accent'] || ''}
                  onChange={(e) => handleFieldChange('hero_headline_accent', e.target.value)}
                />
                <Input
                  label="Headline Line 2"
                  value={formState['hero_headline_line2'] || ''}
                  onChange={(e) => handleFieldChange('hero_headline_line2', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#888] uppercase">
                  Supporting Tagline Copy
                </label>
                <textarea
                  rows={2}
                  value={formState['hero_tagline'] || ''}
                  onChange={(e) => handleFieldChange('hero_tagline', e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              {/* Background Visual & Live Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8">
                  <Input
                    label="Hero Background Image URL (High-Res Gym Photography)"
                    value={formState['hero_bg_image'] || ''}
                    onChange={(e) => handleFieldChange('hero_bg_image', e.target.value)}
                  />
                </div>
                <div className="md:col-span-4">
                  <span className="text-[10px] font-mono text-[#888] uppercase block mb-1">Visual Preview</span>
                  <div className="h-20 rounded-xl overflow-hidden border border-[#333] relative">
                    <img
                      src={formState['hero_bg_image']}
                      alt="Hero background preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Primary Button Text"
                  value={formState['hero_cta_primary'] || ''}
                  onChange={(e) => handleFieldChange('hero_cta_primary', e.target.value)}
                />
                <Input
                  label="Secondary Button Text"
                  value={formState['hero_cta_secondary'] || ''}
                  onChange={(e) => handleFieldChange('hero_cta_secondary', e.target.value)}
                />
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 2. ABOUT PAGE EDITOR */}
          {/* ======================================================== */}
          {activeTab === 'ABOUT' && (
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">2. About Page & Story Editor</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Facility ethos, founder message, and training philosophy</p>
                </div>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingSettings}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Publish to Website</span>
                </Button>
              </div>

              <Input
                label="About Heading"
                value={formState['about_title'] || ''}
                onChange={(e) => handleFieldChange('about_title', e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#888] uppercase">
                  Gym Story & Background Narrative
                </label>
                <textarea
                  rows={4}
                  value={formState['about_description'] || ''}
                  onChange={(e) => handleFieldChange('about_description', e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <Input
                label="Founder / Head Coach Quote"
                value={formState['about_founder_quote'] || ''}
                onChange={(e) => handleFieldChange('about_founder_quote', e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#888] uppercase">
                  Mission Statement & Core Purpose
                </label>
                <textarea
                  rows={2}
                  value={formState['about_mission'] || ''}
                  onChange={(e) => handleFieldChange('about_mission', e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8">
                  <Input
                    label="About Featured Image URL"
                    value={formState['about_image_url'] || ''}
                    onChange={(e) => handleFieldChange('about_image_url', e.target.value)}
                  />
                </div>
                <div className="md:col-span-4">
                  <span className="text-[10px] font-mono text-[#888] uppercase block mb-1">Image Preview</span>
                  <div className="h-20 rounded-xl overflow-hidden border border-[#333] relative">
                    <img
                      src={formState['about_image_url']}
                      alt="About image preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 3. MEMBERSHIPS & BENEFITS (REAL DATABASE RECORDS) */}
          {/* ======================================================== */}
          {activeTab === 'MEMBERSHIPS' && (
            <div className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">3. Membership Plans & Public Pricing</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">
                    Synchronized with authoritative database plans. Toggling status updates the public site instantly.
                  </p>
                </div>
                <Link to="/admin/plans">
                  <Button variant="secondary" size="sm" className="text-xs">
                    <Sliders className="w-3.5 h-3.5 mr-1.5 text-[#FFC21A]" />
                    <span>Manage Plans Full Editor</span>
                  </Button>
                </Link>
              </div>

              {isLoadingPlans ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#A5A5A5]">
                    <thead className="bg-[#171717] text-[10px] uppercase font-mono text-[#888] border-b border-[#292929]">
                      <tr>
                        <th className="py-3 px-4">Plan Name & Description</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Price (₹)</th>
                        <th className="py-3 px-4">Popular Tag</th>
                        <th className="py-3 px-4">Public Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {plans.map((p: any) => (
                        <tr key={p.id} className="hover:bg-[#171717]">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{p.name}</p>
                            <p className="text-[11px] text-[#71717A] max-w-xs truncate">{p.description}</p>
                          </td>
                          <td className="py-3 px-4 font-mono text-white">{p.durationDays} Days</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#FFC21A] text-sm">
                            {formatCurrency(p.pricePaisa)}
                          </td>
                          <td className="py-3 px-4">
                            {p.isPopular ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Featured
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                p.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {p.isActive ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePlanActive(p.id, p.isActive)}
                              className="text-xs text-zinc-400 hover:text-white"
                            >
                              {p.isActive ? 'Unpublish' : 'Publish'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. FACILITIES & EQUIPMENT */}
          {/* ======================================================== */}
          {activeTab === 'FACILITIES' && (
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">4. Facilities & Equipment Highlights</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Showcase strength equipment, squat racks, and recovery amenities</p>
                </div>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingSettings}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Publish to Website</span>
                </Button>
              </div>

              <Input
                label="Facilities Heading"
                value={formState['facilities_heading'] || ''}
                onChange={(e) => handleFieldChange('facilities_heading', e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#888] uppercase">
                  Equipment Philosophy & Specification Description
                </label>
                <textarea
                  rows={3}
                  value={formState['facilities_description'] || ''}
                  onChange={(e) => handleFieldChange('facilities_description', e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Zone 1: Free Weights Equipment"
                  value={formState['facilities_zone1'] || ''}
                  onChange={(e) => handleFieldChange('facilities_zone1', e.target.value)}
                />
                <Input
                  label="Zone 2: Dumbbell & Rack Station"
                  value={formState['facilities_zone2'] || ''}
                  onChange={(e) => handleFieldChange('facilities_zone2', e.target.value)}
                />
                <Input
                  label="Zone 3: Cable & Machine Towers"
                  value={formState['facilities_zone3'] || ''}
                  onChange={(e) => handleFieldChange('facilities_zone3', e.target.value)}
                />
                <Input
                  label="Zone 4: Recovery & Wellness"
                  value={formState['facilities_zone4'] || ''}
                  onChange={(e) => handleFieldChange('facilities_zone4', e.target.value)}
                />
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 5. TRAINERS ROSTER (REAL DATABASE RECORDS) */}
          {/* ======================================================== */}
          {activeTab === 'TRAINERS' && (
            <div className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">5. Certified Coaching Staff</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">
                    Trainer cards rendered on the public coaches page. Toggle visibility directly.
                  </p>
                </div>
                <Link to="/admin/trainers">
                  <Button variant="secondary" size="sm" className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5 text-[#FFC21A]" />
                    <span>Trainers Manager</span>
                  </Button>
                </Link>
              </div>

              {isLoadingTrainers ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainers.map((t: any) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-[#171717] border border-[#292929] flex items-start space-x-4"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                        {t.photoUrl ? (
                          <img src={t.photoUrl} alt={t.user?.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-8 h-8 text-zinc-500 m-auto mt-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-sm">{t.user?.fullName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              t.isPublished
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {t.isPublished ? 'PUBLIC' : 'HIDDEN'}
                          </span>
                        </div>
                        <p className="text-xs text-[#FFC21A] font-medium">{t.specialization}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">{t.experienceYears} Years Exp • {t.certifications}</p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTrainerPublished(t.id, t.isPublished)}
                            className="text-xs text-zinc-400 hover:text-white underline font-semibold"
                          >
                            {t.isPublished ? 'Hide from Website' : 'Publish to Website'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. EVENTS & WORKSHOPS */}
          {/* ======================================================== */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">6. Events & Competitions</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Seminars, powerlifting meets, and community challenges</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowEventModal(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Create Event</span>
                </Button>
              </div>

              {isLoadingEvents ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : events.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p>No gym events scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-xl bg-[#171717] border border-[#292929] flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{ev.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-[#FFC21A]">
                            {ev.location}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono">Date: {formatDate(ev.eventDate)}</p>
                        <p className="text-xs text-zinc-500 max-w-xl">{ev.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEvent(ev.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. GALLERY SHOWCASE */}
          {/* ======================================================== */}
          {activeTab === 'GALLERY' && (
            <div className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">7. Photo Gallery Media</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">High-impact photographs of athletes and heavy stations</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowGalleryModal(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Add Photo</span>
                </Button>
              </div>

              {isLoadingGallery ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {gallery.map((g: any) => (
                    <div
                      key={g.id}
                      className="group rounded-2xl overflow-hidden bg-[#171717] border border-[#292929] relative"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-black">
                        <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-white text-xs truncate">{g.title}</p>
                        <span className="text-[10px] font-mono text-[#FFC21A] block">{g.category}</span>
                      </div>
                      <button
                        onClick={() => deleteGallery(g.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. OFFERS & COUPONS */}
          {/* ======================================================== */}
          {activeTab === 'OFFERS' && (
            <div className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">8. Promotional Offers & Coupons</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Configured promo codes verified by cashier desk</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowOfferModal(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Create Offer</span>
                </Button>
              </div>

              {isLoadingOffers ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : offers.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <Tag className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p>No active promotions configured.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map((off: any) => (
                    <div
                      key={off.id}
                      className="p-4 rounded-xl bg-[#171717] border border-[#292929] flex justify-between items-start"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#FFC21A] text-black">
                            {off.code}
                          </span>
                          <span className="font-bold text-white text-xs">{off.title}</span>
                        </div>
                        <p className="text-xs text-[#FFC21A] font-semibold">
                          Discount: {off.discountValue}
                          {off.discountType === 'PERCENTAGE' ? '%' : ' INR Flat'}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Valid: {formatDate(off.validFrom)} – {formatDate(off.validTo)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOffer(off.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. CONTACT & HOURS */}
          {/* ======================================================== */}
          {activeTab === 'CONTACT' && (
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">9. Contact & Facility Shift Hours</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Physical location in Narsobawadi, direct phone, and WhatsApp</p>
                </div>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingSettings}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Publish to Website</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Official Telephone"
                  value={formState['gym_phone'] || ''}
                  onChange={(e) => handleFieldChange('gym_phone', e.target.value)}
                />
                <Input
                  label="Official Email"
                  value={formState['gym_email'] || ''}
                  onChange={(e) => handleFieldChange('gym_email', e.target.value)}
                />
                <Input
                  label="WhatsApp Helpline"
                  value={formState['gym_whatsapp'] || ''}
                  onChange={(e) => handleFieldChange('gym_whatsapp', e.target.value)}
                />
              </div>

              <Input
                label="Physical Facility Address"
                value={formState['gym_address'] || ''}
                onChange={(e) => handleFieldChange('gym_address', e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#888] uppercase">
                  Operating Shift Hours (Displayed in Header & Footer)
                </label>
                <textarea
                  rows={2}
                  value={formState['gym_operating_hours'] || ''}
                  onChange={(e) => handleFieldChange('gym_operating_hours', e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <Input
                label="Google Maps Location Link"
                value={formState['gym_map_url'] || ''}
                onChange={(e) => handleFieldChange('gym_map_url', e.target.value)}
              />
            </form>
          )}

          {/* ======================================================== */}
          {/* 10. GLOBAL & LEGAL SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'GLOBAL' && (
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">10. Global Website & Legal Settings</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Branding metadata, footer copy, terms of service, and privacy policies</p>
                </div>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingSettings}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Publish to Website</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Gym Legal Name"
                  value={formState['gym_name'] || ''}
                  onChange={(e) => handleFieldChange('gym_name', e.target.value)}
                />
                <Input
                  label="Footer Brand Tagline"
                  value={formState['footer_tagline'] || ''}
                  onChange={(e) => handleFieldChange('footer_tagline', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Logo Image URL (Optional)"
                  placeholder="https://..."
                  value={formState['logo_url'] || ''}
                  onChange={(e) => handleFieldChange('logo_url', e.target.value)}
                />
                <Input
                  label="Favicon URL (Optional)"
                  placeholder="https://..."
                  value={formState['favicon_url'] || ''}
                  onChange={(e) => handleFieldChange('favicon_url', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#888] uppercase">
                  Terms of Service Statement
                </label>
                <textarea
                  rows={3}
                  value={formState['terms_content'] || ''}
                  onChange={(e) => handleFieldChange('terms_content', e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#888] uppercase">
                  Privacy Policy Statement
                </label>
                <textarea
                  rows={3}
                  value={formState['privacy_content'] || ''}
                  onChange={(e) => handleFieldChange('privacy_content', e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#FFC21A] focus:outline-none"
                />
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 11. INQUIRIES DESK */}
          {/* ======================================================== */}
          {activeTab === 'INQUIRIES' && (
            <div className="space-y-6">
              <div className="border-b border-[#222] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">Public Inquiries & Leads Desk</h3>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">Prospect messages submitted through public website contact forms</p>
                </div>
              </div>

              {isLoadingInq ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : inquiries.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <Mail className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p>No new public inquiries submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq: any) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-xl bg-[#171717] border border-[#292929] space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{inq.fullName}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                inq.status === 'NEW'
                                  ? 'bg-amber-500/20 text-[#FFC21A] border border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 font-mono">
                            {inq.phone} • {inq.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {inq.status === 'NEW' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => updateInquiryStatus({ id: inq.id, status: 'RESPONDED' })}
                              className="text-xs"
                            >
                              Mark Responded
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-[#111] rounded-lg border border-white/5 text-xs text-zinc-300">
                        <p className="font-semibold text-[#FFC21A] mb-1">Subject: {inq.subject}</p>
                        <p className="leading-relaxed">{inq.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Event */}
      {showEventModal && (
        <Modal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          title="Create Gym Event / Workshop"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createEvent(
                {
                  title: eventTitle,
                  slug: eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  description: eventDesc,
                  eventDate: new Date(eventDate).toISOString(),
                  location: eventLocation,
                  bannerUrl: eventBanner || undefined,
                },
                {
                  onSuccess: () => {
                    setShowEventModal(false);
                    setEventTitle('');
                    setEventDesc('');
                  },
                }
              );
            }}
            className="space-y-4"
          >
            <Input
              label="Event Title"
              required
              placeholder="e.g. Kolhapur Powerlifting Meet"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1.5">Event Date</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <Input
                label="Location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>
            <Input
              label="Banner Image URL"
              placeholder="https://..."
              value={eventBanner}
              onChange={(e) => setEventBanner(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-[#888] uppercase mb-1.5">Description</label>
              <textarea
                rows={3}
                required
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-xs text-white focus:border-[#FFC21A]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreatingEvent}>
                Publish Event
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Create Gallery Post */}
      {showGalleryModal && (
        <Modal
          isOpen={showGalleryModal}
          onClose={() => setShowGalleryModal(false)}
          title="Add Photo to Gym Showcase"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createGallery(
                {
                  title: galleryTitle,
                  category: galleryCategory,
                  imageUrl: galleryUrl,
                  caption: galleryCaption || undefined,
                },
                {
                  onSuccess: () => {
                    setShowGalleryModal(false);
                    setGalleryTitle('');
                    setGalleryUrl('');
                    setGalleryCaption('');
                  },
                }
              );
            }}
            className="space-y-4"
          >
            <Input
              label="Photo Title"
              required
              placeholder="e.g. Olympic Barbell Zone"
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-[#888] uppercase mb-1.5">Category</label>
              <select
                value={galleryCategory}
                onChange={(e) => setGalleryCategory(e.target.value as any)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFC21A]"
              >
                <option value="EQUIPMENT">Equipment</option>
                <option value="FACILITY">Facility</option>
                <option value="TRANSFORMATION">Transformation</option>
                <option value="COMMUNITY">Community</option>
              </select>
            </div>
            <Input
              label="Image Direct URL"
              required
              placeholder="https://images.unsplash.com/..."
              value={galleryUrl}
              onChange={(e) => setGalleryUrl(e.target.value)}
            />
            <Input
              label="Caption (Optional)"
              value={galleryCaption}
              onChange={(e) => setGalleryCaption(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowGalleryModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreatingGallery}>
                Upload Photo
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Create Offer */}
      {showOfferModal && (
        <Modal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          title="Create Promotional Coupon"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createOffer(
                {
                  code: offerCode.toUpperCase().replace(/\s+/g, ''),
                  title: offerTitle,
                  discountType: offerType,
                  discountValue: parseInt(offerDiscount, 10),
                  validFrom: new Date(offerFrom),
                  validTo: new Date(offerTo),
                },
                {
                  onSuccess: () => {
                    setShowOfferModal(false);
                    setOfferCode('');
                    setOfferTitle('');
                  },
                }
              );
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Coupon Code"
                required
                placeholder="e.g. DIWALI20"
                value={offerCode}
                onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
              />
              <Input
                label="Offer Campaign Title"
                required
                placeholder="e.g. Festive Annual Discount"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1.5">
                  Discount Type
                </label>
                <select
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value as any)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed INR (₹)</option>
                </select>
              </div>
              <Input
                label="Discount Value"
                required
                type="number"
                value={offerDiscount}
                onChange={(e) => setOfferDiscount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1.5">Valid From</label>
                <input
                  type="date"
                  required
                  value={offerFrom}
                  onChange={(e) => setOfferFrom(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1.5">Valid To</label>
                <input
                  type="date"
                  required
                  value={offerTo}
                  onChange={(e) => setOfferTo(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowOfferModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreatingOffer}>
                Create Coupon
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
