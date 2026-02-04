
import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [showProfileToast, setShowProfileToast] = useState(false);

  const members = [
    { name: 'Alex Larsson', email: 'alex@innovatelab.io', role: 'Admin', active: '2 mins ago', initial: 'AL', color: 'bg-primary/10 text-primary' },
    { name: 'Sarah Kim', email: 'sarah.k@innovatelab.io', role: 'Developer', active: '4 hours ago', initial: 'SK', color: 'bg-blue-100 text-blue-600' },
    { name: 'James Wu', email: 'j.wu@innovatelab.io', role: 'Viewer', active: 'Yesterday', initial: 'JW', color: 'bg-green-100 text-green-600' },
    { name: 'Maria Esparza', email: 'maria@innovatelab.io', role: 'Developer', active: '3 days ago', initial: 'ME', color: 'bg-orange-100 text-orange-600' },
  ];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setIsInviteModalOpen(false);
    }, 2000);
  };

  const handleSaveProfile = () => {
    setShowProfileToast(true);
    setTimeout(() => setShowProfileToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Toast for invite success */}
      {inviteSent && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-text-main text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
            <span className="material-symbols-outlined text-green-400">send</span>
            <span className="font-bold text-sm">Invitation sent successfully!</span>
          </div>
        </div>
      )}

      {/* Toast for profile save */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${showProfileToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-text-main/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <span className="material-symbols-outlined text-green-400 !text-xl">verified</span>
          <p className="text-sm font-bold">Organization profile updated.</p>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Invite Member</h3>
                <p className="text-sm text-text-muted">Invite a teammate to collaborate on Innovate Lab.</p>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-text-muted hover:text-text-main">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Email Address</label>
                <input required type="email" className="w-full rounded-xl border-border-muted bg-background-light p-3 text-sm focus:ring-primary focus:border-primary" placeholder="teammate@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Assigned Role</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'admin', label: 'Admin', desc: 'Full access to all settings' },
                    { id: 'dev', label: 'Developer', desc: 'Manage API keys & integrations' },
                    { id: 'viewer', label: 'Viewer', desc: 'Read-only access to analytics' }
                  ].map((role) => (
                    <label key={role.id} className="flex items-start gap-3 p-4 rounded-xl border border-border-muted hover:border-primary/50 cursor-pointer transition-colors group">
                      <input type="radio" name="role" defaultChecked={role.id === 'dev'} className="mt-1 text-primary focus:ring-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main leading-none mb-1">{role.label}</span>
                        <span className="text-xs text-text-muted">{role.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-text-muted">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Organization Settings</h2>
        <p className="text-text-muted">Manage your organization profile, team members, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">corporate_fare</span>
              <h3 className="text-lg font-bold text-text-main">Organization Profile</h3>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Organization Name', type: 'text', value: 'Innovate Lab' },
                { label: 'Industry', type: 'select', value: 'Technology & Web3', options: ['Technology & Web3', 'Financial Services', 'Healthcare', 'E-commerce'] },
                { label: 'Website', type: 'url', value: 'https://innovatelab.io' },
                { label: 'Contact Email', type: 'email', value: 'admin@innovatelab.io' },
              ].map((field, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{field.label}</label>
                  {field.type === 'select' ? (
                    <select className="w-full rounded-lg border border-border-muted bg-background-light/50 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      {field.options?.map((opt, j) => <option key={j}>{opt}</option>)}
                    </select>
                  ) : (
                    <input className="w-full rounded-lg border border-border-muted bg-background-light/50 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" type={field.type} defaultValue={field.value} />
                  )}
                </div>
              ))}
              <button 
                onClick={handleSaveProfile}
                className="mt-4 w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-text-main">Team Management</h3>
              <p className="text-sm text-text-muted">Manage your team members and their access levels.</p>
            </div>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined !text-lg">person_add</span> Invite Member
            </button>
          </div>
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-muted bg-background-light/50">
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {members.map((m, i) => (
                  <tr key={i} className="hover:bg-background-light/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${m.color}`}>{m.initial}</div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-main">{m.name}</span>
                          <span className="text-xs text-text-muted">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        m.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        m.role === 'Developer' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-sm">{m.active}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-text-muted hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined !text-xl">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
