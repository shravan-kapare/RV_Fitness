import React, { useState } from 'react';
import { usePublicGallery } from '@/hooks/usePublic';
import { Camera, Image, Filter } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { data: posts = [], isLoading } = usePublicGallery(selectedCategory);

  const categories = [
    { label: 'All Photos', value: undefined },
    { label: 'Transformations', value: 'TRANSFORMATION' },
    { label: 'Equipment', value: 'EQUIPMENT' },
    { label: 'Workouts', value: 'WORKOUT' },
    { label: 'Facility', value: 'FACILITY' },
    { label: 'Community', value: 'COMMUNITY' },
  ];

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Visual Atmosphere & Transformations
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          RV Fitness Gallery
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Witness real client transformations, the heavy lifting atmosphere, and the immaculate equipment floor at our Narsobawadi facility.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              selectedCategory === cat.value
                ? 'bg-[#FFC21A] text-black shadow-md shadow-[#FFC21A]/20'
                : 'bg-[#111111] text-[#A5A5A5] hover:text-[#F5F5F5] border border-[#292929]'
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
            <div key={i} className="h-64 bg-[#111111] rounded-2xl border border-[#292929] animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-3xl border border-[#292929] max-w-xl mx-auto">
          <Camera className="w-12 h-12 text-[#FFC21A] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-[#F5F5F5]">No images in this category yet</h3>
          <p className="text-xs text-[#888888] mt-1">Select another tab to browse our community photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post: any) => (
            <div
              key={post.id}
              className="group bg-[#111111] rounded-2xl border border-[#292929] overflow-hidden hover:border-[#FFC21A]/50 transition duration-300"
            >
              <div className="h-60 bg-[#171717] overflow-hidden relative">
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#444]">
                    <Image className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#FFC21A] uppercase tracking-wider">
                  {post.category}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-[#F5F5F5] group-hover:text-[#FFC21A] transition">
                  {post.title}
                </h4>
                {post.caption && (
                  <p className="text-xs text-[#888888] mt-1 line-clamp-2">{post.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
