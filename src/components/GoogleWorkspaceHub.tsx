import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  logoutGoogle, 
  initAuth, 
  getAccessToken 
} from '../services/googleAuth';
import {
  listRecentEmails,
  sendEmailMessage,
  GmailMessageSummary,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CalendarEventItem,
  listTasks,
  createGoogleTask,
  updateGoogleTaskStatus,
  deleteGoogleTask,
  GoogleTaskItem,
  listChatSpaces,
  listChatMessages,
  sendChatMessage,
  ChatSpace,
  ChatMessage,
  listGoogleContacts,
  createGoogleContact,
  GoogleContactItem,
  listDriveFiles,
  uploadTextToDrive,
  deleteDriveFile,
  GoogleDriveFile
} from '../services/googleWorkspaceApi';
import { UserProfile, SavedDocument } from '../types';
import { 
  Mail, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  HardDrive, 
  LogOut, 
  Plus, 
  Trash2, 
  Send, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Lock, 
  FileText, 
  Sparkles,
  Phone,
  Clock,
  MapPin,
  X
} from 'lucide-react';

interface GoogleWorkspaceHubProps {
  userProfile: UserProfile;
  onSaveProfile?: (updated: UserProfile) => void;
}

type WorkspaceTab = 'gmail' | 'calendar' | 'tasks' | 'chat' | 'contacts' | 'drive';

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  userProfile,
  onSaveProfile,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('gmail');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // GMAIL State
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [showComposeEmail, setShowComposeEmail] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // CALENDAR State
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventSummary, setEventSummary] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventDurationMin, setEventDurationMin] = useState('60');

  // TASKS State
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  // CHAT State
  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // CONTACTS State
  const [contacts, setContacts] = useState<GoogleContactItem[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactOrg, setContactOrg] = useState('');

  // DRIVE State
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadContent, setUploadContent] = useState('');

  // Confirmation Modal for Destructive Operations (MANDATORY per Workspace guidelines)
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch data whenever user signs in or tab changes
  useEffect(() => {
    if (hasToken) {
      loadTabData();
    }
  }, [hasToken, activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (activeTab === 'gmail') {
        const msgs = await listRecentEmails(15, emailSearchQuery);
        setEmails(msgs);
      } else if (activeTab === 'calendar') {
        const evs = await listCalendarEvents(20);
        setEvents(evs);
      } else if (activeTab === 'tasks') {
        const tList = await listTasks();
        setTasks(tList);
      } else if (activeTab === 'chat') {
        const spaces = await listChatSpaces();
        setChatSpaces(spaces);
        if (spaces.length > 0 && !selectedSpace) {
          setSelectedSpace(spaces[0].name);
          const msgs = await listChatMessages(spaces[0].name);
          setChatMessages(msgs);
        }
      } else if (activeTab === 'contacts') {
        const cList = await listGoogleContacts();
        setContacts(cList);
      } else if (activeTab === 'drive') {
        const dFiles = await listDriveFiles(driveSearch);
        setDriveFiles(dFiles);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to load Workspace data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        setSuccessMessage('Successfully connected to Google Workspace.');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setHasToken(false);
    setEmails([]);
    setEvents([]);
    setTasks([]);
    setContacts([]);
    setDriveFiles([]);
  };

  /* =========================================================================
     MUTATION HANDLERS (with Mandatory Confirmation Modals)
     ========================================================================= */

  // 1. Send Email (Gmail)
  const handleRequestSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      setErrorMessage('Please fill out all email fields.');
      return;
    }

    setPendingConfirmation({
      title: 'Confirm Email Transmission',
      description: `Send email to "${composeTo}" with subject "${composeSubject}" from your authorized Gmail account?`,
      confirmLabel: 'Send Email',
      onConfirm: async () => {
        setLoading(true);
        try {
          await sendEmailMessage(composeTo, composeSubject, composeBody);
          setSuccessMessage('Email sent successfully!');
          setShowComposeEmail(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
          setTimeout(() => setSuccessMessage(null), 4000);
          await loadTabData();
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 2. Create Calendar Event
  const handleRequestCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSummary || !eventDateTime) {
      setErrorMessage('Please provide title and date/time.');
      return;
    }

    const startDate = new Date(eventDateTime);
    const endDate = new Date(startDate.getTime() + parseInt(eventDurationMin, 10) * 60000);

    setPendingConfirmation({
      title: 'Confirm Calendar Event Creation',
      description: `Add "${eventSummary}" on ${startDate.toLocaleString()} to your Google Calendar?`,
      confirmLabel: 'Add to Calendar',
      onConfirm: async () => {
        setLoading(true);
        try {
          await createCalendarEvent({
            summary: eventSummary,
            location: eventLocation,
            startDateTime: startDate.toISOString(),
            endDateTime: endDate.toISOString(),
          });
          setSuccessMessage('Calendar event created!');
          setShowAddEvent(false);
          setEventSummary('');
          setEventLocation('');
          setEventDateTime('');
          setTimeout(() => setSuccessMessage(null), 4000);
          await loadTabData();
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 3. Delete Calendar Event
  const handleRequestDeleteEvent = (eventId: string, summary: string) => {
    setPendingConfirmation({
      title: 'Confirm Event Deletion',
      description: `Are you sure you want to permanently remove "${summary}" from your Google Calendar?`,
      confirmLabel: 'Delete Event',
      isDanger: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteCalendarEvent(eventId);
          setSuccessMessage('Event deleted.');
          setTimeout(() => setSuccessMessage(null), 3000);
          await loadTabData();
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 4. Create Task
  const handleRequestCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    setPendingConfirmation({
      title: 'Confirm Task Creation',
      description: `Add task "${newTaskTitle}" to your Google Tasks list?`,
      confirmLabel: 'Create Task',
      onConfirm: async () => {
        setLoading(true);
        try {
          await createGoogleTask(newTaskTitle, newTaskNotes, newTaskDue || undefined);
          setSuccessMessage('Task created!');
          setShowAddTask(false);
          setNewTaskTitle('');
          setNewTaskNotes('');
          setNewTaskDue('');
          setTimeout(() => setSuccessMessage(null), 3000);
          await loadTabData();
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 5. Toggle Task Status
  const handleToggleTask = async (task: GoogleTaskItem) => {
    const nextStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    try {
      await updateGoogleTaskStatus(task.id, nextStatus);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // 6. Delete Task
  const handleRequestDeleteTask = (taskId: string, title: string) => {
    setPendingConfirmation({
      title: 'Confirm Task Deletion',
      description: `Delete task "${title}" from your Google Tasks?`,
      confirmLabel: 'Delete Task',
      isDanger: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteGoogleTask(taskId);
          setTasks(prev => prev.filter(t => t.id !== taskId));
          setSuccessMessage('Task deleted.');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 7. Send Chat Message
  const handleRequestSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace || !newChatMessage) return;

    setPendingConfirmation({
      title: 'Confirm Chat Transmission',
      description: `Send message to selected Google Chat space?`,
      confirmLabel: 'Send Message',
      onConfirm: async () => {
        setLoading(true);
        try {
          await sendChatMessage(selectedSpace, newChatMessage);
          setNewChatMessage('');
          setSuccessMessage('Message sent to Chat space!');
          setTimeout(() => setSuccessMessage(null), 3000);
          const msgs = await listChatMessages(selectedSpace);
          setChatMessages(msgs);
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 8. Create Contact
  const handleRequestCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName) return;

    setPendingConfirmation({
      title: 'Confirm Contact Creation',
      description: `Add "${contactName}" to your Google Contacts?`,
      confirmLabel: 'Save Contact',
      onConfirm: async () => {
        setLoading(true);
        try {
          await createGoogleContact({
            givenName: contactName,
            email: contactEmail || undefined,
            phone: contactPhone || undefined,
            organization: contactOrg || undefined,
          });
          setSuccessMessage('Contact saved to Google Contacts!');
          setShowAddContact(false);
          setContactName('');
          setContactEmail('');
          setContactPhone('');
          setContactOrg('');
          setTimeout(() => setSuccessMessage(null), 3000);
          await loadTabData();
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 9. Upload / Backup to Drive
  const handleRequestUploadToDrive = (fileName: string, content: string) => {
    setPendingConfirmation({
      title: 'Confirm Google Drive Backup',
      description: `Upload and save document "${fileName}" directly into your Google Drive?`,
      confirmLabel: 'Upload to Drive',
      onConfirm: async () => {
        setLoading(true);
        try {
          await uploadTextToDrive(fileName, content);
          setSuccessMessage(`"${fileName}" successfully saved to Google Drive!`);
          setShowUploadModal(false);
          setUploadFileName('');
          setUploadContent('');
          setTimeout(() => setSuccessMessage(null), 4000);
          await loadTabData();
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 10. Delete Drive File
  const handleRequestDeleteDriveFile = (fileId: string, fileName: string) => {
    setPendingConfirmation({
      title: 'Confirm File Deletion',
      description: `Permanently delete "${fileName}" from your Google Drive?`,
      confirmLabel: 'Delete File',
      isDanger: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteDriveFile(fileId);
          setDriveFiles(prev => prev.filter(f => f.id !== fileId));
          setSuccessMessage('File deleted from Drive.');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Quick Template Injector for Email
  const applyEmailTemplate = (type: 'shelter_appeal' | 'caseworker_snap' | 'vet_grant') => {
    if (type === 'shelter_appeal') {
      setComposeSubject(`Reasonable Accommodation Request: Companion / Service Pet (${userProfile.pets[0]?.name || 'Dog'})`);
      setComposeBody(
        `Dear Shelter Intake Coordinator,\n\nI am writing to formally request emergency lodging with a reasonable accommodation for my companion animal, ${userProfile.pets[0]?.name || 'Buddy'}, who is essential for my stability and mental wellness. All vaccinations are up to date and I have documentation ready.\n\nPlease let me know available intake times or immediate open beds.\n\nThank you,\n${userProfile.fullName || 'Client'}\nPhone: ${userProfile.phone || 'N/A'}`
      );
    } else if (type === 'caseworker_snap') {
      setComposeSubject('Expedited SNAP & Emergency Benefits Follow-Up');
      setComposeBody(
        `Hello,\n\nI am submitting my expedited SNAP/EBT and emergency assistance verification documents. I currently have zero income and need immediate food stamp eligibility determination.\n\nAttached/on file is my homeless ID fee waiver and identity record.\n\nBest regards,\n${userProfile.fullName || 'Client'}\nPhone: ${userProfile.phone || 'N/A'}`
      );
    } else {
      setComposeSubject('Emergency Veterinary Care Voucher Assistance Request');
      setComposeBody(
        `Dear Veterinary Care Support Team,\n\nI am requesting urgent veterinary care voucher assistance for my pet, ${userProfile.pets[0]?.name || 'Buddy'}. As an unhoused pet parent with zero income, any urgent clinic fee subsidies or care grants would be lifesaving.\n\nSincerely,\n${userProfile.fullName || 'Client'}`
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-12">
      
      {/* Top Banner & OAuth Sign-In Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 font-heading">Google Workspace Suite</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Official APIs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely connect your real Gmail, Google Calendar, Tasks, Chat, Contacts, and Drive accounts.
            </p>
          </div>
        </div>

        {/* Auth Action */}
        <div>
          {!currentUser ? (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs transition hover:border-slate-400 active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-7 h-7 rounded-full border border-slate-300" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.displayName || 'Google User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Disconnect Google Account"
                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Notifications */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs (Responsive CSS Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full min-w-0">
        <button
          onClick={() => setActiveTab('gmail')}
          className={`p-2.5 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'gmail'
              ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-4 h-4 text-rose-600" />
          <span>Gmail</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`p-2.5 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`p-2.5 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`p-2.5 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`p-2.5 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'contacts'
              ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`p-2.5 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'drive'
              ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <HardDrive className="w-4 h-4 text-purple-600" />
          <span>Drive</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      {!hasToken ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 font-heading">Connect Your Google Account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your Google account to enable live synchronization with Gmail, Calendar, Tasks, Chat, Contacts, and Google Drive.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            {isSigningIn ? 'Connecting...' : 'Authorize Google Workspace'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Header for Active Tab with Refresh & Add */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading capitalize flex items-center gap-2">
                {activeTab === 'gmail' && 'Gmail Inbox & Aid Messages'}
                {activeTab === 'calendar' && 'Google Calendar & Aid Appointments'}
                {activeTab === 'tasks' && 'Google Tasks & Checklists'}
                {activeTab === 'chat' && 'Google Chat Spaces & Messaging'}
                {activeTab === 'contacts' && 'Google Contacts & Caseworkers'}
                {activeTab === 'drive' && 'Google Drive Cloud Documents'}
              </h3>
              <p className="text-[11px] text-slate-500">Live synchronization with your personal Google account.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadTabData}
                disabled={loading}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                title="Refresh from Google"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {activeTab === 'gmail' && (
                <button
                  onClick={() => setShowComposeEmail(!showComposeEmail)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showComposeEmail ? 'Close Form' : 'Compose Email'}</span>
                </button>
              )}

              {activeTab === 'calendar' && (
                <button
                  onClick={() => setShowAddEvent(!showAddEvent)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddEvent ? 'Close Form' : 'Schedule Event'}</span>
                </button>
              )}

              {activeTab === 'tasks' && (
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddTask ? 'Close Form' : 'New Task'}</span>
                </button>
              )}

              {activeTab === 'contacts' && (
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddContact ? 'Close Form' : 'Add Contact'}</span>
                </button>
              )}

              {activeTab === 'drive' && (
                <button
                  onClick={() => {
                    setUploadFileName(`daisy_aid_profile_${Date.now()}.txt`);
                    setUploadContent(
                      `DAISY SECURE CLIENT RECORD\nName: ${userProfile.fullName || 'Unhoused Client'}\nPhone: ${userProfile.phone}\nEmail: ${userProfile.email}\nHousing Status: ${userProfile.housingStatus}\nCompanion Pets: ${userProfile.pets.map(p => p.name).join(', ')}\nCreated via Daisy App`
                    );
                    setShowUploadModal(true);
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Backup Profile to Drive</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: GMAIL */}
          {activeTab === 'gmail' && (
            <div className="space-y-4">
              
              {/* Compose Modal / Drawer */}
              {showComposeEmail && (
                <form onSubmit={handleRequestSendEmail} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-rose-950 font-heading">Compose Email via Gmail</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500">Insert Aid Template:</span>
                      <button
                        type="button"
                        onClick={() => applyEmailTemplate('shelter_appeal')}
                        className="px-2 py-0.5 bg-white border border-rose-200 text-rose-800 rounded text-[10px] hover:bg-rose-100 transition"
                      >
                        Shelter + Pet
                      </button>
                      <button
                        type="button"
                        onClick={() => applyEmailTemplate('caseworker_snap')}
                        className="px-2 py-0.5 bg-white border border-rose-200 text-rose-800 rounded text-[10px] hover:bg-rose-100 transition"
                      >
                        SNAP Expedited
                      </button>
                      <button
                        type="button"
                        onClick={() => applyEmailTemplate('vet_grant')}
                        className="px-2 py-0.5 bg-white border border-rose-200 text-rose-800 rounded text-[10px] hover:bg-rose-100 transition"
                      >
                        Vet Clinic Grant
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">To (Recipient Email) *</label>
                    <input
                      type="email"
                      value={composeTo}
                      onChange={e => setComposeTo(e.target.value)}
                      placeholder="caseworker@dshs.wa.gov, shelter@intake.org"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      value={composeSubject}
                      onChange={e => setComposeSubject(e.target.value)}
                      placeholder="Urgent Housing Accommodation / Benefit Application"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Message Body *</label>
                    <textarea
                      rows={5}
                      value={composeBody}
                      onChange={e => setComposeBody(e.target.value)}
                      placeholder="Write your email here..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-rose-500 font-sans"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowComposeEmail(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Review & Send Email</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Email List */}
              <div className="space-y-2">
                {emails.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No recent messages found.</p>
                    <p className="text-[11px] text-slate-400">Click Compose Email above or refresh.</p>
                  </div>
                ) : (
                  emails.map(email => (
                    <div
                      key={email.id}
                      className={`p-3 rounded-xl border transition ${
                        email.unread ? 'bg-rose-50/20 border-rose-200 font-semibold' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{email.from}</span>
                            {email.unread && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">
                                UNREAD
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 mt-0.5 truncate">{email.subject}</p>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{email.snippet}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{email.date ? new Date(email.date).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              
              {showAddEvent && (
                <form onSubmit={handleRequestCreateEvent} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                  <h4 className="text-xs font-bold text-blue-950 font-heading">Schedule Calendar Appointment</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Appointment Title *</label>
                      <input
                        type="text"
                        value={eventSummary}
                        onChange={e => setEventSummary(e.target.value)}
                        placeholder="SNAP Phone Interview, Shelter Intake, Vet Checkup"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location / Meeting Link</label>
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={e => setEventLocation(e.target.value)}
                        placeholder="DSHS Community Services Office / Phone"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={eventDateTime}
                        onChange={e => setEventDateTime(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                      <select
                        value={eventDurationMin}
                        onChange={e => setEventDurationMin(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-blue-500"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="120">2 Hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddEvent(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Review & Add Event</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Event Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {events.length === 0 ? (
                  <div className="col-span-2 p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No upcoming events on your Google Calendar.</p>
                  </div>
                ) : (
                  events.map(ev => {
                    const startStr = ev.start.dateTime || ev.start.date;
                    const dateObj = startStr ? new Date(startStr) : null;
                    return (
                      <div key={ev.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{ev.summary}</h4>
                            <button
                              onClick={() => handleRequestDeleteEvent(ev.id, ev.summary)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="Delete from Google Calendar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {dateObj && (
                            <p className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </p>
                          )}
                          {ev.location && (
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </p>
                          )}
                        </div>

                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold self-start"
                          >
                            <span>Open in Google Calendar</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              
              {showAddTask && (
                <form onSubmit={handleRequestCreateTask} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-950 font-heading">Add Google Task</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Task Title *</label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Bring birth certificate to DMV for Homeless Fee Waiver"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                      <input
                        type="text"
                        value={newTaskNotes}
                        onChange={e => setNewTaskNotes(e.target.value)}
                        placeholder="Caseworker phone number, required case ID"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={newTaskDue}
                        onChange={e => setNewTaskDue(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Create Task</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks Checklist */}
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No active tasks in Google Tasks.</p>
                  </div>
                ) : (
                  tasks.map(task => {
                    const isCompleted = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => handleToggleTask(task)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {task.title}
                            </p>
                            {task.notes && <p className="text-[10px] text-slate-500 truncate">{task.notes}</p>}
                            {task.due && (
                              <p className="text-[9px] text-indigo-600 font-bold mt-0.5">
                                Due: {new Date(task.due).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRequestDeleteTask(task.id, task.title)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition shrink-0"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 shrink-0">Select Space:</label>
                <select
                  value={selectedSpace}
                  onChange={async e => {
                    setSelectedSpace(e.target.value);
                    if (e.target.value) {
                      setLoading(true);
                      const msgs = await listChatMessages(e.target.value);
                      setChatMessages(msgs);
                      setLoading(false);
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-emerald-500 flex-1 max-w-sm"
                >
                  {chatSpaces.length === 0 ? (
                    <option value="">No Spaces Found</option>
                  ) : (
                    chatSpaces.map(sp => (
                      <option key={sp.name} value={sp.name}>
                        {sp.displayName || sp.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Message History */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 min-h-[200px] max-h-[300px] overflow-y-auto space-y-2">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No messages in this chat space yet.</p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-700">{msg.sender?.displayName || 'User'}</span>
                        <span>{msg.createTime ? new Date(msg.createTime).toLocaleTimeString() : ''}</span>
                      </div>
                      <p className="text-slate-800">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Composer */}
              <form onSubmit={handleRequestSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={e => setNewChatMessage(e.target.value)}
                  placeholder="Type a message to your caseworker space..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!selectedSpace || !newChatMessage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              
              {showAddContact && (
                <form onSubmit={handleRequestCreateContact} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-950 font-heading">Add Caseworker or Support Contact</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Name *</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="Sarah Jenkins (Housing Caseworker)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Organization / Shelter</label>
                      <input
                        type="text"
                        value={contactOrg}
                        onChange={e => setContactOrg(e.target.value)}
                        placeholder="DESC / Downtown Emergency Service Center"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="(206) 555-0199"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="caseworker@desc.org"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Save to Google Contacts</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contacts.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No Google Contacts found.</p>
                  </div>
                ) : (
                  contacts.map((c, i) => (
                    <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.displayName[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{c.displayName}</p>
                          {c.organization && <p className="text-[10px] text-slate-500 truncate">{c.organization}</p>}
                        </div>
                      </div>

                      {c.phone && (
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                          <Phone className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{c.phone}</span>
                        </p>
                      )}

                      {c.email && (
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              
              {/* Drive Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={driveSearch}
                    onChange={e => setDriveSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadTabData()}
                    placeholder="Search documents in your Google Drive..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-purple-500"
                  />
                </div>
                <button
                  onClick={loadTabData}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold"
                >
                  Search Drive
                </button>
              </div>

              {/* Upload Text Form */}
              {showUploadModal && (
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
                  <h4 className="text-xs font-bold text-purple-950 font-heading">Upload / Backup Document to Google Drive</h4>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">File Name *</label>
                    <input
                      type="text"
                      value={uploadFileName}
                      onChange={e => setUploadFileName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">File Content *</label>
                    <textarea
                      rows={4}
                      value={uploadContent}
                      onChange={e => setUploadContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-purple-500 font-mono text-[11px]"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestUploadToDrive(uploadFileName, uploadContent)}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Review & Upload to Drive</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Files Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {driveFiles.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <HardDrive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No files found in Google Drive.</p>
                  </div>
                ) : (
                  driveFiles.map(file => (
                    <div key={file.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-2">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-900 truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={() => handleRequestDeleteDriveFile(file.id, file.name)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition shrink-0"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {file.modifiedTime ? `Updated: ${new Date(file.modifiedTime).toLocaleDateString()}` : ''}
                        </p>
                      </div>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-purple-600 hover:underline flex items-center gap-1 font-semibold self-start"
                        >
                          <span>Open in Google Drive</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL FOR DESTRUCTIVE/MUTATING OPERATIONS */}
      {pendingConfirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                pendingConfirmation.isDanger ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {pendingConfirmation.isDanger ? <Trash2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 font-heading">{pendingConfirmation.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{pendingConfirmation.description}</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
              🔒 <strong>User Consent Required:</strong> This action directly communicates with your authorized Google Workspace account.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingConfirmation(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const onConf = pendingConfirmation.onConfirm;
                  setPendingConfirmation(null);
                  await onConf();
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition ${
                  pendingConfirmation.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {pendingConfirmation.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
