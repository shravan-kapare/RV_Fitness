import React, { useState } from 'react';
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
  useUpdateInquiryStatus
} from '@/hooks/useCms';
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
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CmsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INQUIRIES' | 'EVENTS' | 'GALLERY' | 'OFFERS'>('INQUIRIES');

  // Queries
  const { data: inquiries = [], isLoading: isLoadingInq } = useAdminInquiries();
  const { data: events = [] } = useAdminEvents();
  const { data: gallery = [] } = useAdminGallery();
  const { data: offers = [] } = useAdminOffers();

  // Mutations
  const { mutate: updateInquiryStatus } = useUpdateInquiryStatus();
  const { mutate: createEvent } = useCreateEvent();
  const { mutate: deleteEvent } = useDeleteEvent();
  const { mutate: createGallery } = useCreateGalleryPost();
  const { mutate: deleteGallery } = useDeleteGalleryPost();
  const { mutate: createOffer } = useCreateOffer();
  const { mutate: deleteOffer } = useDeleteOffer();

  // Form states for adding items
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventSlug, setEventSlug] = useState('');
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
    createEvent({
      title: eventTitle,
      slug: eventSlug || eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      eventDate: eventDate as any,
      description: eventDesc,
      isPublished: true,
    }, {
      onSuccess: () => {
        setShowEventModal(false);
        setEventTitle('');
        setEventDesc('');
      }
    });
  };

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    createGallery({
      title: galleryTitle,
      category: galleryCategory,
      imageUrl: galleryUrl,
      isPublished: true,
    }, {
      onSuccess: () => {
        setShowGalleryModal(false);
        setGalleryTitle('');
        setGalleryUrl('');
      }
    });
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer({
      code: offerCode.toUpperCase(),
      title: offerTitle,
      discountType,
      discountValue: discountType === 'PERCENTAGE' ? parseInt(discountValue, 10) : parseInt(discountValue, 10) * 100,
      validFrom: new Date().toISOString(),
      validTo: new Date(validTo || Date.now() + 30 * 86400000).toISOString(),
    }, {
      onSuccess: () => {
        setShowOfferModal(false);
        setOfferCode('');
        setOfferTitle('');
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-wider">
            Web & Marketing Engine
          </span>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase mt-1">
            CMS & Public Communications
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Control website events, transformations gallery, discount coupons, and review lead inquiries.
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'EVENTS' && (
            <button
              onClick={() => setShowEventModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FFC21A] text-black font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}
          {activeTab === 'GALLERY' && (
            <button
              onClick={() => setShowGalleryModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FFC21A] text-black font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photo</span>
            </button>
          )}
          {activeTab === 'OFFERS' && (
            <button
              onClick={() => setShowOfferModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FFC21A] text-black font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'INQUIRIES', label: `Inquiries (${inquiries.length})` },
          { key: 'EVENTS', label: `Events (${events.length})` },
          { key: 'GALLERY', label: `Gallery (${gallery.length})` },
          { key: 'OFFERS', label: `Offers (${offers.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === tab.key
                ? 'bg-[#FFC21A] text-black shadow'
                : 'bg-[#111111] text-[#888] hover:text-[#F5F5F5] border border-[#292929]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. INQUIRIES TAB */}
      {activeTab === 'INQUIRIES' && (
        <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
          <h2 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3 mb-6">
            Website Visitor Inquiries
          </h2>

          {isLoadingInq ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#171717] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#888]">
              <Mail className="w-10 h-10 text-[#FFC21A] mx-auto mb-2 opacity-50" />
              <p>No new website inquiries received.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq: any) => (
                <div
                  key={inq.id}
                  className="bg-[#171717] p-5 rounded-2xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold text-[#F5F5F5]">{inq.fullName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          inq.status === 'NEW'
                            ? 'bg-amber-500/20 text-amber-400'
                            : inq.status === 'CONTACTED'
                              ? 'bg-blue-500/20 text-blue-400'
                              : inq.status === 'RESOLVED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-[#222] text-[#888]'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#FFC21A] font-semibold">{inq.subject}</p>
                    <p className="text-xs text-[#A5A5A5] leading-relaxed">{inq.message}</p>
                    <div className="pt-2 flex items-center space-x-4 text-xs font-mono text-[#888]">
                      <span>📞 {inq.phone}</span>
                      <span>✉️ {inq.email}</span>
                      <span>🕒 {new Date(inq.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {inq.status !== 'CONTACTED' && (
                      <button
                        onClick={() => updateInquiryStatus({ id: inq.id, status: 'CONTACTED' })}
                        className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2c2c2c] text-xs text-[#CCCCCC] font-semibold transition"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {inq.status !== 'RESOLVED' && (
                      <button
                        onClick={() => updateInquiryStatus({ id: inq.id, status: 'RESOLVED' })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. EVENTS TAB */}
      {activeTab === 'EVENTS' && (
        <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev: any) => (
              <div key={ev.id} className="bg-[#171717] p-5 rounded-2xl border border-[#292929] flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-[#FFC21A]">
                    {new Date(ev.eventDate).toLocaleDateString('en-IN')}
                  </span>
                  <h3 className="text-lg font-bold text-[#F5F5F5] mt-1">{ev.title}</h3>
                  <p className="text-xs text-[#A5A5A5] mt-1 line-clamp-2">{ev.description}</p>
                </div>
                <button
                  onClick={() => deleteEvent(ev.id)}
                  className="p-1.5 rounded text-[#666] hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GALLERY TAB */}
      {activeTab === 'GALLERY' && (
        <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((g: any) => (
              <div key={g.id} className="bg-[#171717] rounded-xl overflow-hidden border border-[#292929] relative group">
                <img src={g.imageUrl} alt={g.title} className="w-full h-36 object-cover" />
                <div className="p-2 text-xs">
                  <p className="font-semibold text-[#F5F5F5] truncate">{g.title}</p>
                  <span className="text-[10px] text-[#FFC21A]">{g.category}</span>
                </div>
                <button
                  onClick={() => deleteGallery(g.id)}
                  className="absolute top-2 right-2 p-1 rounded bg-black/80 text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. OFFERS TAB */}
      {activeTab === 'OFFERS' && (
        <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((off: any) => (
              <div key={off.id} className="bg-[#171717] p-5 rounded-2xl border border-[#292929] flex justify-between items-center">
                <div>
                  <span className="text-xs font-mono font-bold text-[#FFC21A]">{off.code}</span>
                  <h3 className="text-base font-bold text-[#F5F5F5]">{off.title}</h3>
                  <p className="text-xs text-[#888] font-mono">
                    Expires: {new Date(off.validTo).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => deleteOffer(off.id)}
                  className="p-1.5 rounded text-[#666] hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add Event */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-[#F5F5F5]">Create Gym Event</h3>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 text-xs text-[#888]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Gallery Photo */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-[#F5F5F5]">Add Gallery Photo</h3>
            <form onSubmit={handleAddGallery} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Category *</label>
                <select
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value as any)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                >
                  <option value="TRANSFORMATION">TRANSFORMATION</option>
                  <option value="EQUIPMENT">EQUIPMENT</option>
                  <option value="WORKOUT">WORKOUT</option>
                  <option value="FACILITY">FACILITY</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="px-4 py-2 text-xs text-[#888]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl">Add Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Promo Offer */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-[#F5F5F5]">Create Promotional Coupon</h3>
            <form onSubmit={handleAddOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI20"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Annual Plan Offer"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-2 py-2 text-xs text-[#F5F5F5]"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED_AMOUNT">FIXED AMOUNT (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-2 py-2 text-xs font-mono text-[#F5F5F5]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowOfferModal(false)} className="px-4 py-2 text-xs text-[#888]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
