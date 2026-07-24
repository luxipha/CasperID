import React from 'react';
import { UserProfile, Experience, Education, Skill, Project, Certification, Award, Volunteer, Language as LanguageType } from '../types';
import ProfileDisplay from './ProfileDisplay.tsx';
import { notifyError, notifySuccess } from '../utils/notify';

interface ProfilePreviewProps {
  onBack: () => void;
  data: {
    profile: UserProfile | null;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
    awards: Award[];
    volunteers: Volunteer[];
    languages: LanguageType[];
  }
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ onBack, data }) => {
  const { profile, experiences, education, skills, projects, certifications, awards, volunteers, languages } = data;

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'User';
  const headline = profile?.headline || 'Blockchain Enthusiast';

  const handleShare = () => {
    if (!profile) return;

    // Determine the identifier (slug) - prioritize human_id, then wallet
    const identifier = profile.human_id || profile.wallet;
    if (!identifier) return;

    // Construct the public URL
    const publicUrl = `${window.location.protocol}//${window.location.host}/${identifier}`;

    // Copy to clipboard
    navigator.clipboard.writeText(publicUrl).then(() => {
      notifySuccess('Profile link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy profile link:', err);
    });
  };

  const handleExportCV = () => {
    if (!profile) return;

    const city = profile.city || '';
    const country = profile.country || '';
    const location = city && country ? `${city}, ${country}` : city || country || 'Global';
    const email = profile.email || '';
    const about = profile.about || '';

    // Date formatting helper
    const formatDate = (date: any) => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      const { month, year } = date;
      if (!month && !year) return '';
      if (!month) return year.toString();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const m = typeof month === 'number' ? monthNames[month - 1] : month;
      return `${m} ${year}`;
    };

    const experiencesHtml = experiences && experiences.length > 0 
      ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${experiences.map(exp => `
            <div class="item">
              <div class="item-header">
                <div>${exp.job_title}</div>
                <div style="font-weight: 500; font-size: 12px; color: #626D85;">
                  ${formatDate(exp.start_date)} - ${exp.end_date?.is_current ? 'Present' : formatDate(exp.end_date)}
                </div>
              </div>
              <div class="item-sub">${exp.company_name}</div>
              ${exp.description ? `<p class="item-desc">${exp.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `
      : '';

    const educationHtml = education && education.length > 0 
      ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map(edu => `
            <div class="item">
              <div class="item-header">
                <div>${edu.school_name || (edu as any).school}</div>
                <div style="font-weight: 500; font-size: 12px; color: #626D85;">
                  ${formatDate(edu.start_date)} - ${formatDate(edu.end_date)}
                </div>
              </div>
              <div class="item-sub">${edu.degree}</div>
              ${(edu as any).description ? `<p class="item-desc">${(edu as any).description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `
      : '';

    const projectsHtml = projects && projects.length > 0
      ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${projects.map(proj => `
            <div class="item">
              <div class="item-header">
                <div>${proj.project_name}</div>
                ${proj.project_url ? `<div style="font-weight: 500; font-size: 12px; color: #8652E2;">${proj.project_url}</div>` : ''}
              </div>
              ${proj.description ? `<p class="item-desc" style="margin-top: 4px;">${proj.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `
      : '';

    const skillsHtml = skills && skills.length > 0
      ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-container">
            ${skills.map(skill => `
              <span class="skill-tag">${skill.skill_name}${skill.proficiency ? ` (${skill.proficiency})` : ''}</span>
            `).join('')}
          </div>
        </div>
      `
      : '';

    const certificationsHtml = certifications && certifications.length > 0
      ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${certifications.map(cert => `
            <div class="item" style="margin-bottom: 10px;">
              <div class="item-header">
                <div>${cert.name}</div>
                <div style="font-weight: 500; font-size: 12px; color: #626D85;">${cert.issue_date ? formatDate(cert.issue_date) : ''}</div>
              </div>
              <div class="item-sub" style="margin-bottom: 2px;">${cert.issuing_organization}</div>
            </div>
          `).join('')}
        </div>
      `
      : '';

    const awardsHtml = awards && awards.length > 0
      ? `
        <div class="section">
          <div class="section-title">Awards & Honors</div>
          ${awards.map(award => `
            <div class="item" style="margin-bottom: 10px;">
              <div class="item-header">
                <div>${award.title}</div>
                <div style="font-weight: 500; font-size: 12px; color: #626D85;">${award.issue_date ? formatDate(award.issue_date) : ''}</div>
              </div>
              <div class="item-sub" style="margin-bottom: 2px;">${award.issuing_organization}</div>
              ${award.description ? `<p class="item-desc">${award.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `
      : '';

    const volunteersHtml = volunteers && volunteers.length > 0
      ? `
        <div class="section">
          <div class="section-title">Volunteering</div>
          ${volunteers.map(vol => `
            <div class="item">
              <div class="item-header">
                <div>${vol.role}</div>
                <div style="font-weight: 500; font-size: 12px; color: #626D85;">
                  ${formatDate(vol.start_date)} - ${vol.end_date?.is_current ? 'Present' : formatDate(vol.end_date)}
                </div>
              </div>
              <div class="item-sub">${vol.organization}</div>
              ${vol.description ? `<p class="item-desc">${vol.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `
      : '';

    const languagesHtml = languages && languages.length > 0
      ? `
        <div class="section">
          <div class="section-title">Languages</div>
          <div class="skills-container">
            ${languages.map(lang => `
              <span class="skill-tag">${lang.language_name} (${lang.proficiency})</span>
            `).join('')}
          </div>
        </div>
      `
      : '';

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${fullName} - CV</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1A1A2E;
      margin: 40px;
      line-height: 1.6;
    }
    .header {
      margin-bottom: 30px;
      border-bottom: 2px solid #8652E2;
      padding-bottom: 20px;
    }
    .name {
      font-size: 32px;
      font-weight: 850;
      color: #1A1A2E;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .headline {
      font-size: 18px;
      color: #8652E2;
      font-weight: 700;
      margin: 5px 0 10px 0;
    }
    .contact-info {
      font-size: 13px;
      color: #626D85;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      font-weight: 500;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8652E2;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 6px;
      margin-bottom: 15px;
    }
    .item {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      font-weight: 800;
      font-size: 15px;
      color: #1A1A2E;
    }
    .item-sub {
      color: #8652E2;
      font-weight: 700;
      font-size: 13px;
      margin: 2px 0 6px 0;
    }
    .item-desc {
      color: #626D85;
      font-size: 13px;
      margin: 0;
      white-space: pre-wrap;
      font-weight: 500;
    }
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .skill-tag {
      background: #F3F4F6;
      color: #1A1A2E;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid #E5E7EB;
    }
    .footer {
      margin-top: 50px;
      border-top: 1px solid #E5E7EB;
      padding-top: 15px;
      font-size: 11px;
      color: #9CA3AF;
      text-align: center;
      font-weight: 500;
    }
    @media print {
      body {
        margin: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="name">${fullName}</h1>
    <div class="headline">${headline}</div>
    <div class="contact-info">
      ${location ? `<div>📍 ${location}</div>` : ''}
      ${email ? `<div>✉️ ${email}</div>` : ''}
      ${profile.socials?.linkedin ? `<div>🔗 linkedin.com/in/${profile.socials.linkedin.split('/').pop()}</div>` : ''}
    </div>
  </div>

  ${about ? `
    <div class="section">
      <div class="section-title">About</div>
      <p class="item-desc" style="font-size: 14px; line-height: 1.6;">${about}</p>
    </div>
  ` : ''}

  ${experiencesHtml}
  ${educationHtml}
  ${projectsHtml}
  ${skillsHtml}
  ${certificationsHtml}
  ${awardsHtml}
  ${volunteersHtml}
  ${languagesHtml}

  <div class="footer">
    Verified CasperID Profile • Powered by Decentralized Identity
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      notifyError('Unable to open print window. Please check your browser popup settings.');
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    if (printWindow.document.fonts) {
      printWindow.document.fonts.ready.then(() => {
        printWindow.print();
      });
    } else {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-right-12 duration-700 pb-20">
      {/* Immersive Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="size-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-text-sub hover:text-primary hover:border-primary/30 transition-all shadow-soft group active:scale-95"
            title="Exit Preview"
          >
            <span className="material-symbols-outlined text-[28px] group-hover:-translate-x-1 transition-transform">close</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-text-main tracking-tight leading-none">Public Profile Preview</h2>
            <p className="text-sm font-medium text-text-sub mt-1">This is how your profile appears to others in the Casper ecosystem.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex-1 md:flex-none h-12 px-6 bg-white border border-gray-100 rounded-2xl text-sm font-black text-text-main hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
            Share Link
          </button>
          <button
            onClick={handleExportCV}
            className="flex-1 md:flex-none h-12 px-8 bg-primary text-white rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Identity CV
          </button>
        </div>
      </div>

      {/* Hero Header Section - High Fidelity */}
      <ProfileDisplay data={data} />
    </div>
  );
};
