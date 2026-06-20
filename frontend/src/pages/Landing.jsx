import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const INTRO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4';

const NAV_LINKS = [
  { label: 'Trang chủ', href: '#hero' },
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Đối tượng', href: '#stakeholders' },
  { label: 'Liên hệ', href: '#contact' },
];

const SURVEY_TEMPLATES = [
  {
    id: 'student_course',
    icon: '🎓',
    title: 'Khảo sát ý kiến Sinh viên về môn học',
    target: 'Sinh viên',
    desc: 'Khảo sát nhằm thu thập ý kiến phản hồi của sinh viên về chất lượng giảng dạy, tài liệu và nội dung học phần nhằm cải tiến chất lượng đào tạo.',
    color: '#6E9AE0',
    bg: 'rgba(110,154,224,0.12)',
    questions: [
      'Giảng viên lên lớp đúng giờ và thực hiện đầy đủ thời gian quy định.',
      'Phương pháp giảng dạy của giảng viên giúp sinh viên dễ tiếp thu bài học.',
      'Giảng viên nhiệt tình giải đáp thắc mắc và hỗ trợ sinh viên trong quá trình học.',
      'Tài liệu học tập, giáo trình môn học được cung cấp đầy đủ và có ích.',
      'Nội dung học phần thiết thực, bổ ích cho chuyên ngành của bạn.',
      'Góp ý hoặc đề xuất khác của bạn để cải tiến môn học này.'
    ]
  },
  {
    id: 'lecturer_facilities',
    icon: '📚',
    title: 'Khảo sát ý kiến Giảng viên về điều kiện giảng dạy',
    target: 'Giảng viên',
    desc: 'Thu thập ý kiến của giảng viên về cơ sở vật chất giảng đường, trang thiết bị kỹ thuật hỗ trợ và môi trường làm việc tại trường.',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.10)',
    questions: [
      'Phòng học được vệ sinh sạch sẽ, đủ ánh sáng và thoáng mát.',
      'Thiết bị giảng dạy (máy chiếu, âm thanh, Wi-Fi, bảng viết) hoạt động ổn định.',
      'Công tác hỗ trợ kỹ thuật tại các khu giảng đường nhanh chóng và kịp thời.',
      'Các chính sách hỗ trợ nghiên cứu khoa học và giảng dạy của nhà trường phù hợp.',
      'Ý kiến đóng góp hoặc đề xuất cải thiện cơ sở vật chất phòng học của giảng viên.'
    ]
  },
  {
    id: 'alumni_program',
    icon: '🏢',
    title: 'Khảo sát Cựu sinh viên về chất lượng chương trình đào tạo',
    target: 'Cựu sinh viên',
    desc: 'Khảo sát đánh giá mức độ phù hợp và hữu ích của chương trình đào tạo đối với công việc thực tế của cựu sinh viên sau khi tốt nghiệp.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
    questions: [
      'Kiến thức chuyên môn được trang bị giúp bạn nhanh chóng tiếp cận và làm quen với công việc.',
      'Các kỹ năng thực hành nghề nghiệp được đào tạo đáp ứng tốt yêu cầu công việc.',
      'Các kỹ năng mềm (giao tiếp, làm việc nhóm, thuyết trình) được rèn luyện tốt khi học tại trường.',
      'Hoạt động hỗ trợ giới thiệu việc làm và hướng nghiệp của nhà trường có hiệu quả.',
      'Đóng góp ý kiến của cựu sinh viên để cải tiến và phát triển chương trình đào tạo tốt hơn.'
    ]
  },
  {
    id: 'employer_evaluation',
    icon: '💼',
    title: 'Khảo sát Nhà tuyển dụng về chất lượng sinh viên tốt nghiệp',
    target: 'Nhà tuyển dụng',
    desc: 'Ý kiến đánh giá từ phía doanh nghiệp về năng lực chuyên môn, thái độ làm việc và kỹ năng thích ứng của sinh viên tốt nghiệp khi được tuyển dụng.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.10)',
    questions: [
      'Kiến thức chuyên môn của sinh viên tốt nghiệp đáp ứng yêu cầu công việc thực tế tại cơ quan/doanh nghiệp.',
      'Khả năng ứng dụng công nghệ thông tin và ngoại ngữ của sinh viên trong công việc tốt.',
      'Sinh viên có ý thức tổ chức kỷ luật, tác phong làm việc chuyên nghiệp và tuân thủ quy định.',
      'Khả năng làm việc nhóm, kỹ năng giao tiếp và giải quyết vấn đề của sinh viên tốt.',
      'Doanh nghiệp mong muốn nhà trường bổ sung hoặc tập trung đào tạo thêm các kỹ năng/kiến thức nào?'
    ]
  }
];

const STATS = [
  { number: '4', label: 'Khoa đào tạo chính', color: '#6E9AE0' },
  { number: '10K+', label: 'Lượt khảo sát hoàn tất', color: '#22c55e' },
  { number: '4', label: 'Nhóm đối tượng', color: '#f59e0b' },
  { number: '95%', label: 'Tỷ lệ phản hồi trực tuyến', color: '#8b5cf6' },
];

function smoothScroll(e, href) {
  e.preventDefault();
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Landing({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactError, setContactError] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleContact = async (e) => {
    e.preventDefault();
    setLoadingContact(true);
    setContactError('');
    setFormSent(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tickets/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: formData.name,
          guestEmail: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFormSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormSent(false), 5000);
    } catch (err) {
      setContactError(err.message || 'Lỗi gửi yêu cầu hỗ trợ.');
    } finally {
      setLoadingContact(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", color: '#0d1c2f', background: '#F9FAFD' }}>
      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(248,249,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? '1px solid rgba(210,219,234,0.6)' : 'none'
      }}>
        <div className="px-4 md:px-10" style={{ maxWidth: 1280, margin: '0 auto', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="text-lg sm:text-xl md:text-2xl" style={{ fontWeight: 800, color: scrolled ? '#6E9AE0' : '#fff', letterSpacing: -0.5, textDecoration: 'none' }}>
            🎓 ĐBCL - Đại học Kiến trúc Đà Nẵng
          </Link>
          <div className="hidden lg:flex" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} onClick={e => smoothScroll(e, link.href)}
                style={{
                  color: scrolled ? '#434654' : 'rgba(255,255,255,0.85)',
                  textDecoration: 'none', fontWeight: 500, fontSize: 15,
                  transition: 'color 0.2s', cursor: 'pointer'
                }}
                onMouseOver={e => e.target.style.color = scrolled ? '#6E9AE0' : '#fff'}
                onMouseOut={e => e.target.style.color = scrolled ? '#434654' : 'rgba(255,255,255,0.85)'}
              >{link.label}</a>
            ))}
          </div>
          <div className="flex gap-2 sm:gap-3 items-center">
            {user ? (
              <>
                <span className="hidden sm:inline" style={{ color: scrolled ? '#2d4771' : '#fff', fontWeight: 600, fontSize: 14, textShadow: scrolled ? 'none' : '0 1px 4px rgba(0,0,0,0.5)' }}>
                  Xin chào, {user.fullName}
                </span>
                <Link to="/dashboard"
                  style={{ padding: '8px 16px', borderRadius: 999, background: '#6E9AE0', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 14px rgba(110,154,224,0.4)' }}>
                  Dashboard
                </Link>
                <button onClick={onLogout}
                  style={{ padding: '8px 14px', borderRadius: 999, border: `2px solid ${scrolled ? '#ef4444' : 'rgba(239,68,68,0.5)'}`, color: scrolled ? '#ef4444' : '#fff', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = scrolled ? '#ef4444' : '#fff'; }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  style={{ padding: '8px 16px', borderRadius: 999, border: `2px solid ${scrolled ? '#6E9AE0' : 'rgba(255,255,255,0.5)'}`, color: scrolled ? '#6E9AE0' : '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
                  Đăng nhập
                </Link>
                <Link to="/login" className="hidden sm:inline-block"
                  style={{ padding: '8px 20px', borderRadius: 999, background: '#6E9AE0', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 14px rgba(110,154,224,0.4)' }}>
                  Tham gia khảo sát →
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION (video background) ─── */}
      <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px' }}>
        {/* Video background */}
        <video autoPlay loop muted playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          src={INTRO_VIDEO}
        />
        {/* Animated blobs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(110,154,224,0.15)', filter: 'blur(60px)', animation: 'pulse 6s ease-in-out infinite', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(80px)', animation: 'pulse 8s ease-in-out infinite 2s', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', maxWidth: 860, padding: '0 2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '6px 18px', marginBottom: 28, backdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>🔗 Kết Nối Vì Tương Lai</span>
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15, marginBottom: 24, letterSpacing: -1, textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}>
            Nâng Tầm Giáo Dục<br />
            <span style={{ color: '#B3C5FF' }}>Qua Tiếng Nói Chung</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 40, color: 'rgba(255,255,255,0.95)', maxWidth: 620, margin: '0 auto 40px', textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95)' }}>
            Nền tảng kết nối nhà trường, giảng viên, sinh viên và doanh nghiệp để xây dựng môi trường học tập vì tương lai. Kiến tạo không gian cho sự thấu hiểu và phát triển bền vững.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ padding: '14px 36px', borderRadius: 14, background: '#6E9AE0', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 8px 24px rgba(110,154,224,0.5)', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Tham gia khảo sát →
            </Link>
            <a href="#about" onClick={e => smoothScroll(e, '#about')} style={{ padding: '14px 36px', borderRadius: 14, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 16, border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
              Tìm hiểu thêm
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 2, animation: 'bounce 2s infinite' }}>
          <div style={{ width: 28, height: 44, borderRadius: 14, border: '2px solid rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <div style={{ width: 4, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.8)', animation: 'scroll-dot 2s infinite' }} />
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section style={{ background: '#fff', padding: '48px 0', borderBottom: '1px solid #D2DBEA' }}>
        <div className="stats-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.number}</div>
              <div style={{ fontSize: 13, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ABOUT SECTION ─── */}
      <section id="about" style={{ padding: '100px 0', background: '#F9FAFD' }}>
        <div className="about-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(110,154,224,0.12)', color: '#6E9AE0', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Về Chúng Tôi
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#0d1c2f', lineHeight: 1.2, marginBottom: 20 }}>
              Sức Mạnh Của<br />
              <span style={{ color: '#6E9AE0' }}>Sự Gắn Kết</span>
            </h2>
            <p style={{ color: '#718096', lineHeight: 1.8, marginBottom: 20, fontSize: 16 }}>
              <b>Cổng Khảo sát ĐBCL</b> là hệ thống khảo sát trực tuyến chính thức của Trường Đại học Kiến trúc Đà Nẵng, được xây dựng nhằm thu thập ý kiến từ các bên liên quan — bao gồm sinh viên, giảng viên, cựu sinh viên và nhà tuyển dụng — để phục vụ công tác kiểm định và liên tục nâng cao chất lượng đào tạo của nhà trường.
            </p>
            <p style={{ color: '#718096', lineHeight: 1.8, fontSize: 16 }}>
              Hệ thống hỗ trợ 4 loại câu hỏi khảo sát linh hoạt (trắc nghiệm, thang điểm Likert, câu hỏi mở), theo dõi tiến trình phản hồi theo thời gian thực và xuất báo cáo chi tiết dạng Excel, Word và PDF.
            </p>
          </div>
          <div className="about-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: '📊', title: 'Dashboard thời gian thực', desc: 'Xem thống kê và phân tích phản hồi ngay lập tức.' },
              { icon: '🔒', title: 'Bảo mật dữ liệu', desc: 'JWT Authentication và phân quyền vai trò chặt chẽ.' },
              { icon: '📄', title: 'Xuất báo cáo đa dạng', desc: 'Excel, Word, PDF — tải về dễ dàng, định dạng chuẩn.' },
              { icon: '🔔', title: 'Hệ thống thông báo', desc: 'Nhận lời mời tham gia và nhắc nhở deadline tự động.' },
            ].map(card => (
              <div key={card.title} style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', border: '1px solid #D2DBEA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(110,154,224,0.15)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#2d4771' }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>      {/* ─── SURVEY TEMPLATES SECTION ─── */}
      <section id="stakeholders" style={{ padding: '100px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', background: 'rgba(110,154,224,0.12)', color: '#6E9AE0', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Biểu mẫu Khảo sát
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#0d1c2f' }}>Các Biểu Mẫu Khảo Sát Theo Đối Tượng</h2>
            <p style={{ color: '#718096', fontSize: 16, marginTop: 12, maxWidth: 580, margin: '12px auto 0', lineHeight: 1.6 }}>
              Hệ thống khảo sát phục vụ ĐBCL được thiết kế dựa trên các biểu mẫu chuẩn hóa dành riêng cho từng nhóm đối tượng liên quan.
            </p>
          </div>
          <div className="stakeholders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
            {SURVEY_TEMPLATES.map(s => (
              <div key={s.id} style={{ background: '#F9FAFD', borderRadius: 24, padding: '32px 28px', border: '1px solid #D2DBEA', transition: 'all 0.3s ease', cursor: 'default' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${s.color}15`; e.currentTarget.style.borderColor = s.color; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#D2DBEA'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{s.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: s.color, background: `${s.color}15`, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase' }}>
                    Dành cho {s.target}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#2d4771', marginBottom: 10, lineHeight: 1.4, minHeight: 44 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6, marginBottom: 24, minHeight: 76 }}>{s.desc}</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={() => setSelectedTemplate(s)} style={{ background: 'transparent', border: 'none', color: s.color, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                    Xem câu hỏi mẫu <span>📋</span>
                  </button>
                  <span style={{ color: '#D2DBEA' }}>|</span>
                  <Link to="/login" style={{ color: '#2d4771', textDecoration: 'none', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Tham gia ngay <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ─── CTA SECTION ─── */}
      <section style={{ padding: '80px 0', background: '#F9FAFD' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a5ad7, #6E9AE0)', borderRadius: 32, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16, position: 'relative' }}>
              Sẵn Sàng Thay Đổi Tương Lai Giáo Dục?
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 36, maxWidth: 540, margin: '0 auto 36px', position: 'relative', lineHeight: 1.7 }}>
              Bắt đầu hành trình kết nối và xây dựng niềm tin giữa các bên liên quan ngay hôm nay. Chỉ mất vài phút để hoàn thành khảo sát đầu tiên.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', position: 'relative' }}>
              <Link to="/login" style={{ padding: '14px 36px', borderRadius: 14, background: '#fff', color: '#6E9AE0', textDecoration: 'none', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                Bắt đầu ngay
              </Link>
              <a href="#stakeholders" onClick={e => smoothScroll(e, '#stakeholders')} style={{ padding: '14px 36px', borderRadius: 14, border: '2px solid rgba(255,255,255,0.5)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                Xem thêm
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section id="contact" style={{ padding: '100px 0', background: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(110,154,224,0.12)', color: '#6E9AE0', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Liên Hệ
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#0d1c2f' }}>Kết Nối Với Chúng Tôi</h2>
            <p style={{ color: '#718096', fontSize: 16, marginTop: 12 }}>Có câu hỏi hoặc phản hồi? Chúng tôi luôn sẵn sàng lắng nghe.</p>
          </div>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div>
              {[
                { icon: '📍', label: 'Địa chỉ', value: 'Đại học Đà Nẵng, TP. Đà Nẵng' },
                { icon: '📧', label: 'Email', value: 'trankimlien31072004@gmail.com' },
                { icon: '📞', label: 'Hotline', value: '0236-xxxx-xxx' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(110,154,224,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#6E9AE0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontSize: 15, color: '#2d4771', fontWeight: 500 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleContact}>
              {formSent && (
                <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#065f46', fontWeight: 600, fontSize: 14 }}>
                  ✅ Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất có thể.
                </div>
              )}
              {contactError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
                  ❌ {contactError}
                </div>
              )}
              {['name', 'email', 'subject', 'message'].map(field => {
                const isTextArea = field === 'message';
                const labels = { 
                  name: 'Họ và tên *', 
                  email: 'Địa chỉ email *', 
                  subject: 'Tiêu đề sự cố / Chủ đề *', 
                  message: 'Nội dung chi tiết sự cố *' 
                };
                const Tag = isTextArea ? 'textarea' : 'input';
                return (
                  <div key={field} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2d4771', marginBottom: 6 }}>{labels[field]}</label>
                    <Tag
                      type={field === 'email' ? 'email' : 'text'}
                      required
                      rows={isTextArea ? 4 : undefined}
                      value={formData[field]}
                      onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D2DBEA', background: '#F9FAFD', fontSize: 14, outline: 'none', resize: isTextArea ? 'vertical' : undefined, boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                      onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                    />
                  </div>
                );
              })}
              <button type="submit" disabled={loadingContact} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loadingContact ? 'not-allowed' : 'pointer', opacity: loadingContact ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)' }}>
                {loadingContact ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#0d1c2f', color: '#fff', padding: '48px 0' }}>
        <div className="footer-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 48, alignItems: 'start' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#6E9AE0', marginBottom: 12 }}>🎓 Khảo sát ĐBCL - DAU</div>
            <p style={{ color: '#718096', fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
              Cổng khảo sát trực tuyến lấy ý kiến các bên liên quan phục vụ đảm bảo chất lượng và cải tiến đào tạo - Trường Đại học Kiến trúc Đà Nẵng.
            </p>
            <p style={{ color: '#555', fontSize: 13, marginTop: 16 }}>© 2026 Đại học Kiến trúc Đà Nẵng. All rights reserved.</p>
          </div>
          {[
            { title: 'Tài Nguyên', links: ['Chính sách bảo mật', 'Điều khoản sử dụng', 'Hỗ trợ'] },
            { title: 'Tính Năng', links: ['Tạo khảo sát', 'Thống kê & Báo cáo', 'Quản lý người dùng'] },
            { title: 'Kết Nối', links: ['Email: trankimlien31072004@gmail.com', 'Hỗ trợ kỹ thuật', 'Phản hồi'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ color: '#6E9AE0', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>{col.title}</p>
              {col.links.map(link => (
                <p key={link} style={{ color: '#718096', fontSize: 14, marginBottom: 8, cursor: 'pointer' }}
                  onMouseOver={e => e.target.style.color = '#fff'}
                  onMouseOut={e => e.target.style.color = '#718096'}
                >{link}</p>
              ))}
            </div>
          ))}
        </div>
      </footer>

      {/* ─── TEMPLATE DETAIL MODAL ─── */}
      {selectedTemplate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,28,47,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setSelectedTemplate(null)}
        >
          <div style={{ background: '#fff', borderRadius: 24, padding: '36px 30px', width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(110,154,224,0.3)', border: '1px solid #D2DBEA', animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: selectedTemplate.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {selectedTemplate.icon}
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: selectedTemplate.color, background: `${selectedTemplate.color}15`, padding: '3px 8px', borderRadius: 8, textTransform: 'uppercase' }}>
                    Dành cho {selectedTemplate.target}
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2d4771', marginTop: 4 }}>{selectedTemplate.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedTemplate(null)} style={{ background: '#F9FAFD', border: '1px solid #D2DBEA', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#EEF4FD'}
                onMouseOut={e => e.currentTarget.style.background = '#F9FAFD'}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6, marginBottom: 20 }}>
              {selectedTemplate.desc}
            </p>

            <div style={{ background: '#F9FAFD', border: '1px solid #D2DBEA', borderRadius: 16, padding: '16px 20px', maxHeight: 260, overflowY: 'auto' }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#487bc9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Danh sách câu hỏi mẫu ({selectedTemplate.questions.length}):</p>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedTemplate.questions.map((q, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#2d4771', lineHeight: 1.5 }}>
                    <span style={{ color: selectedTemplate.color, fontWeight: 700 }}>{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setSelectedTemplate(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', color: '#718096', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Đóng
              </button>
              <Link to="/login" style={{ flex: 1.5, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(110,154,224,0.35)' }}>
                Tham gia Khảo sát
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.05); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes scroll-dot { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(14px); } }
        * { box-sizing: border-box; }
        
        @media (max-width: 768px) {
          #hero h1 {
            font-size: 32px !important;
          }
          #hero p {
            font-size: 15px !important;
            margin-bottom: 24px !important;
          }
        }

        @media (max-width: 1024px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .stakeholders-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
            padding: 0 1.5rem !important;
          }
          .contact-grid, .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }

        @media (max-width: 640px) {
          .stakeholders-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .stats-grid, .about-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
