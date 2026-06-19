import React from 'react';

const highlightCards = [
  {
    id: 'contributor',
    eyebrow: 'Lead The Conversation',
    title: 'Become a Top Contributor',
    description:
      'Share your expertise by uploading verified lecture notes and actively guiding subject discussions in the forum.',
    ctaLabel: 'Upload Resources',
    ctaHref: '#upload',
    buttonClasses:
      'bg-[#4C2ED1] hover:bg-[#3A20A9] focus-visible:ring-[#4C2ED1]',
    accentGradient: 'linear-gradient(135deg, #FFE17A 0%, #F9B43C 100%)',
    accentGlow: '0 25px 70px rgba(249, 180, 60, 0.4)',
    accentStyle: {
      width: '260px',
      height: '260px',
      bottom: '-70px',
      right: '-90px',
      borderRadius: '220px 220px 0 220px',
      transform: 'rotate(6deg)',
    },
    image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80',
    imageClass:
      'absolute right-[-10px] bottom-0 w-[280px] lg:w-[320px] drop-shadow-[0_25px_30px_rgba(0,0,0,0.15)]',
  },
  {
    id: 'learning',
    eyebrow: 'Jumpstart Your Learning',
    title: 'Unlock Your Learning Universe',
    description:
      'Start your academic journey with instant access to shared materials and the powerful AI Quiz Generator.',
    ctaLabel: 'Start Learning Now',
    ctaHref: '#start-learning',
    buttonClasses:
      'bg-[#F8485E] hover:bg-[#e23b50] focus-visible:ring-[#F8485E]',
    accentGradient: 'linear-gradient(135deg, #7047FF 0%, #5A1FCC 100%)',
    accentGlow: '0 30px 90px rgba(103, 65, 255, 0.45)',
    accentStyle: {
      width: '260px',
      height: '260px',
      bottom: '-80px',
      right: '-70px',
      borderRadius: '200px 200px 0 200px',
      transform: 'rotate(-4deg)',
    },
    image:
      'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=3948&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageClass:
      'absolute right-[-25px] bottom-0 w-[260px] lg:w-[300px] lg:h-[350px] drop-shadow-[0_25px_30px_rgba(0,0,0,0.2)]',
  },
];

function ContributorCTASection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-[#f8fafc] via-white to-white">
      <div className="absolute inset-x-0 top-16 mx-auto h-[600px] w-[80%] rounded-[60px] bg-white/40 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-8 lg:grid-cols-2">
          {highlightCards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] flex flex-col md:flex-row"
            >
              <div className="flex-1 p-8 md:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                  {card.eyebrow}
                </p>
                <h3 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight mb-4">
                  {card.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  {card.description}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (card.ctaHref.startsWith('#')) {
                      const el = document.querySelector(card.ctaHref);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(0,0,0,0.12)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${card.buttonClasses}`}
                >
                  {card.ctaLabel}
                  <span className="text-lg leading-none">›</span>
                </button>
              </div>

              <div className="relative flex-1 min-h-[260px] md:min-h-[280px] flex items-end justify-center">
                <div
                  className="absolute"
                  style={{
                    background: card.accentGradient,
                    boxShadow: card.accentGlow,
                    ...card.accentStyle,
                  }}
                />
                <img
                  src={card.image}
                  alt={card.title}
                  className={`relative z-10 select-none pointer-events-none ${card.imageClass}`}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContributorCTASection;

