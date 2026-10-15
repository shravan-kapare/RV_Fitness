import React, { useState } from 'react';
import { usePublicGallery } from '@/hooks/usePublic';
import { Camera, Image, Filter, X, MapPin } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [activeLightboxImage, setActiveLightboxImage] = useState<any | null>(null);
  const { data: posts = [], isLoading } = usePublicGallery(selectedCategory);

  const categories = [
    { label: 'All Photos', value: undefined },
    { label: 'Equipment Floor', value: 'EQUIPMENT' },
    { label: 'Facility Zones', value: 'FACILITY' },
    { label: 'Workouts', value: 'WORKOUT' },
    { label: 'Transformations', value: 'TRANSFORMATION' },
  ];

  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 bg-[#111114]">
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/75 text-white hover:text-[#FFC21A] transition z-10 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeLightboxImage.imageUrl}
              alt={activeLightboxImage.title}
              className="w-full h-auto max-h-[75vh] object-contain"
            />
            <div className="p-6 bg-[#141418] border-t border-white/10 text-left">
              <span className="text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-wider">
                {activeLightboxImage.category}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{activeLightboxImage.title}</h3>
              {activeLightboxImage.caption && (
                <p className="text-xs text-[#A5A5A5] mt-1">{activeLightboxImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO: GALLERY & ATMOSPHERE
          ========================================================================= */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#222222]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center brightness-[0.3]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161616]/85 border border-white/10 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span className="text-xs font-semibold tracking-wider text-[#D4D4D4] uppercase font-mono">
                Visual Showcase • Narsobawadi Floor
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              GYM <span className="text-[#FFC21A]">GALLERY</span> & FLOOR.
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed">
              Witness the heavy resistance atmosphere, Olympic platforms, and real physical conditioning at our Narsobawadi strength center.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: FILTER BAR & PHOTO GRID (Dark Charcoal #0D0D10)
          ========================================================================= */}
      <section className="bg-[#0D0D10] text-[#F5F5F5] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#222222]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-[#FFC21A] text-black shadow-md shadow-[#FFC21A]/20 scale-105'
                    : 'bg-[#141418] text-[#A5A5A5] hover:text-[#F5F5F5] border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-[#141418] rounded-3xl border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-[#141418] rounded-3xl border border-white/10 max-w-xl mx-auto shadow-xl">
              <Camera className="w-12 h-12 text-[#FFC21A] mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-bold text-white uppercase">No images in this category</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">Select another filter or check back as new session photos are uploaded.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any, idx: number) => (
                <ScrollReveal key={post.id} direction="up" delay={idx * 0.08}>
                  <div
                    onClick={() => setActiveLightboxImage(post)}
                    className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#141418] shadow-lg group cursor-pointer hover:border-[#FFC21A]/50 transition duration-300"
                  >
                    <div className="h-72 overflow-hidden relative">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-[#FFC21A] uppercase">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-base font-bold text-white uppercase">{post.title}</h4>
                      {post.caption && (
                        <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2 leading-relaxed">
                          {post.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
