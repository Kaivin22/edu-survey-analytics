import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const INTRO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4';

const NAV_LINKS = [
  { label: 'Trang chủ', href: '#hero' },
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Đối tượng', href: '#stakeholders' },
  { label: 'Liên hệ', href: '#contact' },
];

const STAKEHOLDERS = [
  {
    icon: '🎓',
    title: 'Sinh viên',
    role: 'Student',
    desc: 'Chia sẻ trải nghiệm học tập, phản ánh chất lượng giảng dạy và điều kiện học tập để cùng nhà trường không ngừng cải thiện môi trường giáo dục.',
    color: '#6E9AE0',
    bg: 'rgba(110,154,224,0.12)'
  },
  {
    icon: '📚',
    title: 'Giảng viên',
    role: 'Lecturer',
    desc: 'Đóng góp ý kiến về chương trình đào tạo, phương pháp giảng dạy và nguồn lực hỗ trợ để nâng cao hiệu quả truyền đạt kiến thức.',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.10)'
  },
  {
    icon: '🏢',
    title: 'Cựu sinh viên',
    role: 'Alumnus',
    desc: 'Phản ánh về tính thực tiễn của chương trình đào tạo và mức độ phù hợp với yêu cầu công việc thực tế sau khi tốt nghiệp.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)'
  },
  {
    icon: '💼',
    title: 'Nhà tuyển dụng',
    role: 'Employer',
    desc: 'Đánh giá chất lượng sinh viên tốt nghiệp và đề xuất các kỹ năng, kiến thức cần thiết để sinh viên đáp ứng tốt hơn nhu cầu thị trường lao động.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.10)'
  }
];

const STATS = [
  { number: '500+', label: 'Trường học tham gia', color: '#6E9AE0' },
  { number: '12K+', label: 'Khảo sát hoàn tất', color: '#22c55e' },
  { number: '4', label: 'Nhóm đối tượng', color: '#f59e0b' },
  { number: '98%', label: 'Mức độ hài lòng', color: '#8b5cf6' },
];

function smoothScroll(e, href) {
  e.preventDefault();
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleContact = (e) => {
    e.preventDefault();
    setFormSent(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setFormSent(false), 4000);
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
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: scrolled ? '#6E9AE0' : '#fff', letterSpacing: -0.5 }}>
            🎓 Academic Synergy
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
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
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/login"
              style={{ padding: '8px 20px', borderRadius: 999, border: `2px solid ${scrolled ? '#6E9AE0' : 'rgba(255,255,255,0.5)'}`, color: scrolled ? '#6E9AE0' : '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}>
              Đăng nhập
            </Link>
            <Link to="/login"
              style={{ padding: '8px 20px', borderRadius: 999, background: '#6E9AE0', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 14px rgba(110,154,224,0.4)' }}>
              Tham gia khảo sát →
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION (video background) ─── */}
      <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Video background */}
        <video autoPlay loop muted playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          src={INTRO_VIDEO}
        />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,43,110,0.75) 0%, rgba(110,154,224,0.55) 50%, rgba(0,67,174,0.70) 100%)', zIndex: 1 }} />
        {/* Animated blobs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(110,154,224,0.15)', filter: 'blur(60px)', animation: 'pulse 6s ease-in-out infinite', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(80px)', animation: 'pulse 8s ease-in-out infinite 2s', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', maxWidth: 860, padding: '0 2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '6px 18px', marginBottom: 28, backdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>🔗 Kết Nối Vì Tương Lai</span>
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15, marginBottom: 24, letterSpacing: -1, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            Nâng Tầm Giáo Dục<br />
            <span style={{ color: '#B3C5FF' }}>Qua Tiếng Nói Chung</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 40, color: 'rgba(255,255,255,0.85)', maxWidth: 620, margin: '0 auto 40px' }}>
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
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
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
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(110,154,224,0.12)', color: '#6E9AE0', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Về Chúng Tôi
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#0d1c2f', lineHeight: 1.2, marginBottom: 20 }}>
              Sức Mạnh Của<br />
              <span style={{ color: '#6E9AE0' }}>Sự Gắn Kết</span>
            </h2>
            <p style={{ color: '#718096', lineHeight: 1.8, marginBottom: 20, fontSize: 16 }}>
              <b>Academic Synergy</b> là hệ thống khảo sát trực tuyến được xây dựng nhằm thu thập ý kiến từ các bên liên quan trong giáo dục — bao gồm sinh viên, giảng viên, cựu sinh viên và nhà tuyển dụng — để đánh giá và cải thiện chất lượng đào tạo đại học.
            </p>
            <p style={{ color: '#718096', lineHeight: 1.8, fontSize: 16 }}>
              Hệ thống hỗ trợ 4 loại câu hỏi khảo sát linh hoạt (trắc nghiệm, thang điểm Likert, câu hỏi mở), theo dõi tiến trình phản hồi theo thời gian thực và xuất báo cáo chi tiết dạng Excel, Word và PDF.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
      </section>

      {/* ─── STAKEHOLDERS SECTION ─── */}
      <section id="stakeholders" style={{ padding: '100px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', background: 'rgba(110,154,224,0.12)', color: '#6E9AE0', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Đối Tượng Tham Gia
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#0d1c2f' }}>Các Bên Liên Quan</h2>
            <p style={{ color: '#718096', fontSize: 16, marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
              Mỗi cá nhân đều đóng góp một phần quan trọng vào sự thành công của hệ thống giáo dục.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {STAKEHOLDERS.map(s => (
              <div key={s.title} style={{ background: '#F9FAFD', borderRadius: 20, padding: '32px 24px', border: '1px solid #D2DBEA', transition: 'all 0.3s ease', cursor: 'default' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${s.color}25`; e.currentTarget.style.borderColor = s.color; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#D2DBEA'; }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 18, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2d4771', marginBottom: 12 }}>Dành cho {s.title}</h3>
                <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
                <Link to="/login" style={{ color: s.color, textDecoration: 'none', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Tham gia ngay <span>→</span>
                </Link>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div>
              {[
                { icon: '📍', label: 'Địa chỉ', value: 'Đại học Đà Nẵng, TP. Đà Nẵng' },
                { icon: '📧', label: 'Email', value: 'khaosat@edu.vn' },
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
              {['name', 'email', 'message'].map(field => {
                const isTextArea = field === 'message';
                const labels = { name: 'Họ và tên', email: 'Địa chỉ email', message: 'Nội dung tin nhắn' };
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
              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#6E9AE0', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(110,154,224,0.4)' }}>
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#0d1c2f', color: '#fff', padding: '48px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 48, alignItems: 'start' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#6E9AE0', marginBottom: 12 }}>🎓 Academic Synergy</div>
            <p style={{ color: '#718096', fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
              Nền tảng khảo sát ý kiến các bên liên quan trong giáo dục — Kết nối để nâng cao chất lượng đào tạo.
            </p>
            <p style={{ color: '#555', fontSize: 13, marginTop: 16 }}>© 2026 Academic Synergy. All rights reserved.</p>
          </div>
          {[
            { title: 'Tài Nguyên', links: ['Chính sách bảo mật', 'Điều khoản sử dụng', 'Hỗ trợ'] },
            { title: 'Tính Năng', links: ['Tạo khảo sát', 'Thống kê & Báo cáo', 'Quản lý người dùng'] },
            { title: 'Kết Nối', links: ['Email: khaosat@edu.vn', 'Hỗ trợ kỹ thuật', 'Phản hồi'] },
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

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.05); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes scroll-dot { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(14px); } }
        * { box-sizing: border-box; }
        @media (max-width: 1024px) {
          section > div > div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          section > div > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          section > div > div[style*="grid-template-columns: 1fr auto"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
