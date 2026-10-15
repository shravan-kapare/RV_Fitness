import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/formatters';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const CmsManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const initialTab = (searchParams.get('tab')?.toUpperCase() as any) || 'CONTENT';
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'OFFERS' | 'EVENTS' | 'GALLERY' | 'INQUIRIES'>(
    ['CONTENT', 'OFFERS', 'EVENTS', 'GALLERY', 'INQUIRIES'].includes(initialTab)
      ? initialTab
      : 'CONTENT'
  );

  // Sync tab with URL search param
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')?.toUpperCase();
    if (tabFromUrl && ['CONTENT', 'OFFERS', 'EVENTS', 'GALLERY', 'INQUIRIES'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'CONTENT' | 'OFFERS' | 'EVENTS' | 'GALLERY' | 'INQUIRIES') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // 1. Settings / Website Content State
  const { data: settings = {}, isLoading: isLoadingSettings } = useSettings();
  const { mutateAsync: updateSettings, isPending: isSavingSettings } = useUpdateSettings();

  const [contentSection, setContentSection] = useState<'HERO' | 'ABOUT' | 'FACILITIES' | 'CONTACT' | 'BANNER'>('HERO');
  const [contentForm, setContentForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const s = settings as Record<string, string>;
      setContentForm({
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

        about_title: s['about_title'] || 'Built For Those Who Train With Intent',
        about_description:
          s['about_description'] ||
          "RV Fitness is Narsobawadi's dedicated strength and conditioning facility. Founded to bring Olympic-grade barbells, heavy dumbbells, and coaching integrity without gimmicks.",
        about_founder_quote: s['about_founder_quote'] || "Strength isn't given; it's earned rep by rep under the bar.",

        facilities_heading: s['facilities_heading'] || 'Engineered For Heavy Resistance',
        facilities_description:
          s['facilities_description'] ||
          'Every machine and free-weight station has been curated for anatomical alignment, safety spotters, and heavy progressive overload.',

        gym_phone: s['gym_phone'] || '+91 98765 43210',
        gym_email: s['gym_email'] || 'info@rvfitness.com',
        gym_address:
          s['gym_address'] ||
          'Near Datta Mandir, Main Road, Narsobawadi, Taluka Shirol, District Kolhapur, Maharashtra 416104',
        gym_operating_hours:
          s['gym_operating_hours'] ||
          'Monday to Saturday: 5:30 AM – 10:30 AM & 4:30 PM – 10:00 PM | Sunday: 6:00 AM – 11:00 AM',
        gym_whatsapp: s['gym_whatsapp'] || '+91 98765 43210',

        footer_tagline: s['footer_tagline'] || "Narsobawadi's Premier Strength & Conditioning Facility",
        announcement_banner: s['announcement_banner'] || 'Diwali Special: Up to 20% off on Annual Memberships!',
        announcement_banner_active: s['announcement_banner_active'] || 'true',
      });
    }
  }, [settings]);

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(contentForm);
      toast.success('Website content published and persisted to MySQL database!');
      queryClient.invalidateQueries({ queryKey: ['public-home'] });
    } catch (err: any) {
      toast.error('Failed to save website content: ' + (err.message || 'Unknown error'));
    }
  };

  // 2. CMS Queries & Mutations
  const { data: inquiries = [], isLoading: isLoadingInq } = useAdminInquiries();
  const { data: events = [] } = useAdminEvents();
  const { data: gallery = [] } = useAdminGallery();
  const { data: offers = [] } = useAdminOffers();

  const { mutate: updateInquiryStatus } = useUpdateInquiryStatus();
  const { mutate: createEvent } = useCreateEvent();
  const { mutate: deleteEvent } = useDeleteEvent();
  const { mutate: createGallery } = useCreateGalleryPost();
  const { mutate: deleteGallery } = useDeleteGalleryPost();
  const { mutate: createOffer } = useCreateOffer();
  const { mutate: deleteOffer } = useDeleteOffer();

  // Modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<'TRANSFORMATION' | 'EQUIPMENT' | 'WORKOUT' | 'FACILITY'>('EQUIPMENT');
  const [galleryUrl, setGalleryUrl] = useState('');

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerCode, setOfferCode] = useState('');
  const [offerTitle, setOfferTitle] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('15');
  const [validTo, setValidTo] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent(
      {
        title: eventTitle,
        slug: eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        eventDate: eventDate as any,
        description: eventDesc,
        isPublished: true,
      },
      {
        onSuccess: () => {
          setShowEventModal(false);
          setEventTitle('');
          setEventDesc('');
        },
      }
    );
  };

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    createGallery(
      {
        title: galleryTitle,
        category: galleryCategory,
        imageUrl: galleryUrl,
        isPublished: true,
      },
      {
        onSuccess: () => {
          setShowGalleryModal(false);
          setGalleryTitle('');
          setGalleryUrl('');
        },
      }
    );
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = discountType === 'PERCENTAGE' ? parseInt(discountValue, 10) : parseInt(discountValue, 10) * 100;
    createOffer(
      {
        code: offerCode.toUpperCase().trim(),
        title: offerTitle,
        discountType,
        discountValue: val,
        validFrom: new Date() as any,
        validTo: new Date(validTo) as any,
      },
      {
        onSuccess: () => {
          setShowOfferModal(false);
          setOfferCode('');
          setOfferTitle('');
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-[#141418] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#1A1A22] border border-white/10 text-[11px] font-mono font-bold text-[#FFC21A] mb-1.5">
            <Globe className="w-3 h-3" />
            <span>DATABASE-BACKED CONTENT MANAGEMENT ENGINE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Website Content & Communications CMS
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Control live public copy, hero visuals, promotional vouchers, events, and gallery media without code modification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#101014] hover:bg-[#1A1A22] border border-white/10 text-xs font-semibold text-white transition"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FFC21A]" />
          </a>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { key: 'CONTENT', label: 'Website Content Editor', icon: Globe },
          { key: 'OFFERS', label: 'Offers & Coupons', icon: Tag, count: offers.length },
          { key: 'EVENTS', label: 'Events & Challenges', icon: Calendar, count: events.length },
          { key: 'GALLERY', label: 'Gallery Media', icon: Image, count: gallery.length },
          { key: 'INQUIRIES', label: 'Contact Inquiries', icon: Mail, count: inquiries.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#FFC21A] text-[#080808] shadow-md shadow-[#FFC21A]/10'
                  : 'bg-[#141418] text-[#A5A5A5] hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-black' : 'bg-[#1C1C24] text-[#A5A5A5]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: DEDICATED WEBSITE CONTENT EDITOR
          ========================================================================= */}
      {activeTab === 'CONTENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Section Selector (4 cols) */}
          <div className="lg:col-span-4 bg-[#141418] rounded-2xl border border-white/10 p-4 space-y-2 shadow-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A] px-2 block mb-2">
              Select Page Section
            </span>

            {[
              { key: 'HERO', label: 'Homepage Hero & Headings', desc: 'Main headline, background visual & CTAs' },
              { key: 'ABOUT', label: 'About & Philosophy', desc: 'Narrative history and founder quote' },
              { key: 'FACILITIES', label: 'Facilities & Floor Copy', desc: 'Zone headings and equipment descriptions' },
              { key: 'CONTACT', label: 'Contact Coordinates & Shifts', desc: 'Operating hours, phone & location' },
              { key: 'BANNER', label: 'Top Announcement Banner', desc: 'Promotional ticker across public pages' },
            ].map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setContentSection(sec.key as any)}
                className={`w-full text-left p-3.5 rounded-xl transition duration-150 cursor-pointer ${
                  contentSection === sec.key
                    ? 'bg-[#1C1C24] border border-[#FFC21A]/50 text-white shadow-sm'
                    : 'hover:bg-white/5 text-[#A5A5A5] border border-transparent'
                }`}
              >
                <div className="font-bold text-xs uppercase flex items-center justify-between">
                  <span className={contentSection === sec.key ? 'text-[#FFC21A]' : 'text-white'}>
                    {sec.label}
                  </span>
                  {contentSection === sec.key && <CheckCircle className="w-3.5 h-3.5 text-[#FFC21A]" />}
                </div>
                <p className="text-[11px] text-[#71717A] mt-1 leading-snug">{sec.desc}</p>
              </button>
            ))}
          </div>

          {/* Right Column: Editable Form Fields & Live Previews (8 cols) */}
          <div className="lg:col-span-8 bg-[#141418] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleSaveContent} className="space-y-6">
              {/* SECTION: HOMEPAGE HERO */}
              {contentSection === 'HERO' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      Homepage Hero Section
                    </h3>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">
                      Updates the main headline, background photograph, and calls-to-action on the public homepage.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Headline Line 1"
                      value={contentForm.hero_headline_line1 || ''}
                      onChange={(e) => setContentForm({ ...contentForm, hero_headline_line1: e.target.value })}
                      placeholder="e.g. YOUR"
                    />
                    <Input
                      label="Headline Accent Word (Yellow)"
                      value={contentForm.hero_headline_accent || ''}
                      onChange={(e) => setContentForm({ ...contentForm, hero_headline_accent: e.target.value })}
                      placeholder="e.g. STRENGTH."
                    />
                    <Input
                      label="Headline Line 2"
                      value={contentForm.hero_headline_line2 || ''}
                      onChange={(e) => setContentForm({ ...contentForm, hero_headline_line2: e.target.value })}
                      placeholder="e.g. YOUR JOURNEY."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                      Supporting Tagline / Description
                    </label>
                    <textarea
                      rows={2}
                      value={contentForm.hero_tagline || ''}
                      onChange={(e) => setContentForm({ ...contentForm, hero_tagline: e.target.value })}
                      className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Background Gym Photography URL"
                      value={contentForm.hero_bg_image || ''}
                      onChange={(e) => setContentForm({ ...contentForm, hero_bg_image: e.target.value })}
                      placeholder="https://..."
                    />
                    {contentForm.hero_bg_image && (
                      <div className="relative h-32 rounded-xl overflow-hidden border border-white/10 mt-2">
                        <img
                          src={contentForm.hero_bg_image}
                          alt="Hero Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs font-bold font-mono text-white">
                          LIVE PREVIEW
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Primary Button Text"
                      value={contentForm.hero_cta_primary || ''}
                      onChange={(e) => setContentForm({ ...contentForm, hero_cta_primary: e.target.value })}
                      placeholder="e.g. Explore Memberships"
                    />
                    <Input
                      label="Secondary Button Text"
                      value={contentForm.hero_cta_secondary || ''}
                      onChange={(e) => setContentForm({ ...contentForm, hero_cta_secondary: e.target.value })}
                      placeholder="e.g. Discover Our Gym"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: ABOUT & PHILOSOPHY */}
              {contentSection === 'ABOUT' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      About & Strength Philosophy
                    </h3>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">
                      Sets the gym's background story, values, and motivational quotes displayed on /about.
                    </p>
                  </div>

                  <Input
                    label="About Section Heading"
                    value={contentForm.about_title || ''}
                    onChange={(e) => setContentForm({ ...contentForm, about_title: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                      Detailed Gym Narrative
                    </label>
                    <textarea
                      rows={4}
                      value={contentForm.about_description || ''}
                      onChange={(e) => setContentForm({ ...contentForm, about_description: e.target.value })}
                      className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] resize-none"
                    />
                  </div>

                  <Input
                    label="Founder / Coaching Ethos Quote"
                    value={contentForm.about_founder_quote || ''}
                    onChange={(e) => setContentForm({ ...contentForm, about_founder_quote: e.target.value })}
                  />
                </div>
              )}

              {/* SECTION: FACILITIES */}
              {contentSection === 'FACILITIES' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      Facilities & Equipment Copy
                    </h3>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">
                      Sets headings and introductory text for the equipment showroom at /facilities.
                    </p>
                  </div>

                  <Input
                    label="Facilities Arena Heading"
                    value={contentForm.facilities_heading || ''}
                    onChange={(e) => setContentForm({ ...contentForm, facilities_heading: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                      Floor Standards Description
                    </label>
                    <textarea
                      rows={3}
                      value={contentForm.facilities_description || ''}
                      onChange={(e) => setContentForm({ ...contentForm, facilities_description: e.target.value })}
                      className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: CONTACT & SHIFTS */}
              {contentSection === 'CONTACT' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      Location Coordinates & Operating Shifts
                    </h3>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">
                      Displayed on the Contact page, footer, and member turnstile desks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Desk Phone Number"
                      value={contentForm.gym_phone || ''}
                      onChange={(e) => setContentForm({ ...contentForm, gym_phone: e.target.value })}
                    />
                    <Input
                      label="Official Email"
                      value={contentForm.gym_email || ''}
                      onChange={(e) => setContentForm({ ...contentForm, gym_email: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Physical Address"
                    value={contentForm.gym_address || ''}
                    onChange={(e) => setContentForm({ ...contentForm, gym_address: e.target.value })}
                  />

                  <Input
                    label="Operating Shifts Schedule"
                    value={contentForm.gym_operating_hours || ''}
                    onChange={(e) => setContentForm({ ...contentForm, gym_operating_hours: e.target.value })}
                  />
                </div>
              )}

              {/* SECTION: BANNER */}
              {contentSection === 'BANNER' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      Top Announcement Banner & Footer
                    </h3>
                    <p className="text-xs text-[#A5A5A5] mt-0.5">
                      Configure high-priority promotional banners visible across all public pages.
                    </p>
                  </div>

                  <Input
                    label="Announcement Banner Text"
                    value={contentForm.announcement_banner || ''}
                    onChange={(e) => setContentForm({ ...contentForm, announcement_banner: e.target.value })}
                  />

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="bannerActive"
                      checked={contentForm.announcement_banner_active === 'true'}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          announcement_banner_active: e.target.checked ? 'true' : 'false',
                        })
                      }
                      className="w-4 h-4 accent-[#FFC21A] rounded"
                    />
                    <label htmlFor="bannerActive" className="text-xs text-white font-bold cursor-pointer">
                      Enable Announcement Banner on Public Header
                    </label>
                  </div>

                  <Input
                    label="Footer Brand Tagline"
                    value={contentForm.footer_tagline || ''}
                    onChange={(e) => setContentForm({ ...contentForm, footer_tagline: e.target.value })}
                  />
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-[11px] font-mono text-[#71717A]">
                  Changes persist directly to MySQL 'gym_settings' table
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingSettings}
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save & Publish Live</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: OFFERS & COUPONS
          ========================================================================= */}
      {activeTab === 'OFFERS' && (
        <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">Active Promotions & Vouchers</h2>
              <p className="text-xs text-[#A5A5A5]">Discounts redeemable on /offers and checkout desk</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowOfferModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Coupon</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {offers.map((offer: any) => (
              <div
                key={offer.id}
                className="bg-[#101014] p-4 rounded-xl border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-black font-mono text-[#FFC21A]">{offer.code}</span>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="text-[#71717A] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{offer.title}</h4>
                  <p className="text-xs text-[#A5A5A5] mt-1">
                    {offer.discountType === 'PERCENTAGE'
                      ? `${offer.discountValue}% OFF`
                      : `₹${(offer.discountValue / 100).toFixed(0)} FLAT DISCOUNT`}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-[#71717A]">
                  Valid: {formatDate(offer.validTo)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: EVENTS & CHALLENGES
          ========================================================================= */}
      {activeTab === 'EVENTS' && (
        <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">Gym Challenges & Events</h2>
              <p className="text-xs text-[#A5A5A5]">Published to /events for athlete registrations</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowEventModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Event</span>
            </Button>
          </div>

          <div className="space-y-3">
            {events.map((ev: any) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-[#101014] border border-white/10 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{ev.title}</h4>
                  <p className="text-xs text-[#A5A5A5] mt-0.5">{ev.description}</p>
                  <span className="text-[11px] font-mono text-[#FFC21A] mt-1 block">
                    Event Date: {formatDate(ev.eventDate)}
                  </span>
                </div>
                <button onClick={() => deleteEvent(ev.id)} className="text-[#71717A] hover:text-rose-400 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: GALLERY MEDIA
          ========================================================================= */}
      {activeTab === 'GALLERY' && (
        <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">Facility & Athlete Gallery</h2>
              <p className="text-xs text-[#A5A5A5]">Photographs shown in the public lightbox arena at /gallery</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowGalleryModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Photograph</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((g: any) => (
              <div key={g.id} className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#101014]">
                <img src={g.imageUrl} alt={g.title} className="w-full h-36 object-cover" />
                <div className="p-2.5">
                  <p className="text-xs font-bold text-white truncate">{g.title}</p>
                  <span className="text-[10px] font-mono text-[#FFC21A]">{g.category}</span>
                </div>
                <button
                  onClick={() => deleteGallery(g.id)}
                  className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: CONTACT INQUIRIES
          ========================================================================= */}
      {activeTab === 'INQUIRIES' && (
        <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">Incoming Contact Inquiries</h2>
              <p className="text-xs text-[#A5A5A5]">Prospective members submitting the form at /contact</p>
            </div>
            <span className="text-xs font-mono text-[#FFC21A] bg-[#101014] px-3 py-1 rounded-lg border border-white/10">
              {inquiries.length} Inquiries Logged
            </span>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71717A]">
              No contact inquiries logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq: any) => (
                <div key={inq.id} className="p-4 rounded-xl bg-[#101014] border border-white/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{inq.fullName}</h4>
                      <p className="text-xs text-[#FFC21A] font-mono">{inq.phone} • {inq.email}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C24] text-[#A5A5A5] border border-white/10">
                      {inq.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#D4D4D8] bg-[#16161B] p-3 rounded-lg border border-white/5">
                    <strong className="text-white block mb-0.5">{inq.subject}</strong>
                    <p>{inq.message}</p>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-[#71717A] pt-1">
                    <span>Received: {formatDate(inq.createdAt)}</span>
                    <button
                      onClick={() => updateInquiryStatus({ id: inq.id, status: 'CONTACTED' })}
                      className="text-xs font-bold text-[#FFC21A] hover:underline"
                    >
                      Mark Contacted
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Offer Modal */}
      {showOfferModal && (
        <Modal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} title="Create Promotional Coupon">
          <form onSubmit={handleAddOffer} className="space-y-4 p-2">
            <Input label="Coupon Code *" required placeholder="e.g. SUMMER2026" value={offerCode} onChange={(e) => setOfferCode(e.target.value)} />
            <Input label="Promotion Title *" required placeholder="e.g. Summer Strength Kickoff" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-[#CCCCCC]">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
                </select>
              </div>
              <Input
                label={discountType === 'PERCENTAGE' ? 'Discount %' : 'Flat Amount (₹)'}
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
            <Input label="Valid Until *" type="date" required value={validTo} onChange={(e) => setValidTo(e.target.value)} />
            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowOfferModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Create Coupon</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Create Gym Event / Challenge">
          <form onSubmit={handleAddEvent} className="space-y-4 p-2">
            <Input label="Event Title *" required placeholder="e.g. Annual Deadlift Championship" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
            <Input label="Event Date *" type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-[#CCCCCC]">Description</label>
              <textarea rows={3} required value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none" />
            </div>
            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowEventModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Publish Event</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Gallery Modal */}
      {showGalleryModal && (
        <Modal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} title="Add Photograph to Lightbox">
          <form onSubmit={handleAddGallery} className="space-y-4 p-2">
            <Input label="Photo Title *" required placeholder="e.g. Olympic Lifting Platforms" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} />
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-[#CCCCCC]">Category</label>
              <select
                value={galleryCategory}
                onChange={(e) => setGalleryCategory(e.target.value as any)}
                className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="EQUIPMENT">Equipment</option>
                <option value="FACILITY">Facility</option>
                <option value="WORKOUT">Workout</option>
                <option value="TRANSFORMATION">Transformation</option>
              </select>
            </div>
            <Input label="Image URL (Unsplash or direct) *" required placeholder="https://images.unsplash.com/..." value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} />
            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowGalleryModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Upload Image</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
