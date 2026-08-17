'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { changePasswordApi } from '@/features/auth/services';
import { apiClient } from '@/lib/api';
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
  Field,
  TextInput,
  Select,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@shared/ui/components';
import { viewDocument, downloadDocument } from '@/lib/document-utils';
import {
  User,
  Shield,
  FileText,
  UploadCloud,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Camera,
  Stethoscope,
  Heart,
  Save,
  AlertCircle,
  Clock,
  Loader2,
  Eye,
  Download,
  Trash2,
  XCircle,
} from 'lucide-react';

function getDocBadgeTone(status: string): 'success' | 'danger' | 'warning' {
  if (status === 'VERIFIED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'warning';
}

function renderDocStatusContent(status: string) {
  if (status === 'VERIFIED') {
    return (
      <span className="flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="flex items-center gap-1">
        <XCircle className="w-3 h-3 text-destructive" /> Rejected
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <Clock className="w-3 h-3 text-amber-500" /> Pending Review
    </span>
  );
}

export default function UserSettingsPage() {
  const { user } = useAuth();
  const updateUser = useAuthStore((state) => state.updateUser);
  const role = (user?.role || 'PATIENT').toUpperCase();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'professional' | 'health'
  >('profile');

  // General Profile State
  const [firstName, setFirstName] = useState(
    user?.firstName || user?.name?.split(' ')[0] || '',
  );
  const [lastName, setLastName] = useState(
    user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
  );
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.avatarUrl || null,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Doctor Professional State
  const [specialization, setSpecialization] = useState('Cardiology');
  const [qualification, setQualification] = useState('MD, FACC');
  const [consultationFee, setConsultationFee] = useState(150);
  const [experienceYears, setExperienceYears] = useState(10);
  const [biography, setBiography] = useState(
    'Board-certified medical specialist dedicated to patient-centered care.',
  );
  const [doctorSuccess, setDoctorSuccess] = useState(false);

  // Doctor Documents State
  type DocItem = {
    id: string;
    name: string;
    type: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    uploadedAt: string;
    url: string;
  };
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocItem[]>([]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.name?.split(' ')[0] || '');
      setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || '');
      setPhone(user.phone || '');
      if (user.avatarUrl) {
        setProfileImage(user.avatarUrl);
      }

      if ((user.role || '').toUpperCase() === 'DOCTOR') {
        apiClient
          .get('/doctors/me')
          .then((res) => {
            const doc = res.data?.data || res.data;
            if (doc) {
              if (doc.id) setDoctorId(doc.id);
              if (doc.specialization) setSpecialization(doc.specialization);
              if (doc.qualification) setQualification(doc.qualification);
              if (doc.consultationFee !== undefined)
                setConsultationFee(doc.consultationFee);
              if (doc.experienceYears !== undefined)
                setExperienceYears(doc.experienceYears);
              if (doc.biography) setBiography(doc.biography);
              if (doc.profileImage) setProfileImage(doc.profileImage);

              let loadedDocs: DocItem[] = [];
              if (Array.isArray(doc.documents)) {
                loadedDocs = doc.documents;
              } else if (typeof doc.documents === 'string') {
                try {
                  const parsed = JSON.parse(doc.documents);
                  if (Array.isArray(parsed)) loadedDocs = parsed;
                } catch {
                  // ignore parse error
                }
              }
              if (loadedDocs.length > 0) setDocuments(loadedDocs);
            }
          })
          .catch((err) => {
            console.error('Failed to load doctor profile in settings:', err);
          });
      }
    }
  }, [user]);

  // Patient Health State
  const [emergencyContactName, setEmergencyContactName] = useState('Jane Doe');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+1 (555) 987-6543');
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('Penicillin, Peanuts');
  const [patientSuccess, setPatientSuccess] = useState(false);

  // Cloudinary Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);
    try {
      // 1. Request upload URL from backend
      const requestRes = await apiClient.post('/uploads/request-url', {
        name: file.name,
        contentType: file.type || 'image/png',
        size: file.size,
      });
      const data = requestRes.data?.data || requestRes.data;
      const rawUploadURL = data.uploadURL || '';
      const uploadURL = rawUploadURL.replace(/^\/api/, '');

      // 2. Direct upload to file endpoint (streams to Cloudinary)
      const uploadRes = await apiClient.post(uploadURL, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });
      const uploadData = uploadRes.data?.data || uploadRes.data;
      const objectPath = uploadData?.objectPath;

      if (objectPath) {
        setProfileImage(objectPath);

        // Save immediately to backend user profile
        const profileRes = await apiClient.patch('/auth/profile', {
          avatarUrl: objectPath,
        });
        const updatedUser = profileRes.data?.data || profileRes.data;
        if (updatedUser) {
          updateUser(updatedUser);
        }
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err: unknown) {
      console.error('Failed to upload image:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    try {
      const res = await apiClient.patch('/auth/profile', {
        firstName,
        lastName,
        phone,
        avatarUrl: profileImage,
      });
      const updatedUser = res.data?.data || res.data;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Failed to save profile:', err);
      setUploadError('Failed to save profile changes.');
    }
  };

  const handleSecuritySave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (!currentPassword) {
      setSecurityError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long.');
      return;
    }
    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[@$!%*?&#^()_-]/.test(newPassword)
    ) {
      setSecurityError(
        'New password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
      });
      setSecuritySuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(false), 4000);
    } catch (err: unknown) {
      console.error('Failed to change password:', err);
      const apiErr = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        'Failed to update password. Please check your current password.';
      setSecurityError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDoctorSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDoctorSuccess(false);
    try {
      if (role === 'DOCTOR') {
        const meRes = await apiClient.get('/doctors/me');
        const doctorMe = meRes.data?.data || meRes.data;
        if (doctorMe && doctorMe.id) {
          await apiClient.patch(`/doctors/${doctorMe.id}`, {
            specialization,
            qualification,
            consultationFee: Number(consultationFee),
            experienceYears: Number(experienceYears),
            biography,
            profileImage,
          });
        }
      }
      setDoctorSuccess(true);
      setTimeout(() => setDoctorSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save doctor practice details:', err);
    }
  };

  const handlePatientSave = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPatientSuccess(true);
    setTimeout(() => setPatientSuccess(false), 3000);
  };

  const renderAvatarContent = (): React.ReactNode => {
    if (isUploadingImage) {
      return <Loader2 className="w-6 h-6 animate-spin text-primary" />;
    }
    if (profileImage) {
      return (
        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
      );
    }
    return <span>{`${firstName[0] || 'U'}${lastName[0] || ''}`}</span>;
  };

  // Document Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docCategory, setDocCategory] = useState('Medical Council License');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const handleConfirmDocumentUpload = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setDocumentError('Please select a document file to upload');
      return;
    }

    setIsUploadingDocument(true);
    setDocumentError(null);
    try {
      const requestRes = await apiClient.post('/uploads/request-url', {
        name: selectedFile.name,
        contentType: selectedFile.type || 'application/pdf',
        size: selectedFile.size,
      });
      const data = requestRes.data?.data || requestRes.data;
      const rawUploadURL = data.uploadURL || '';
      const uploadURL = rawUploadURL.replace(/^\/api/, '');

      const uploadRes = await apiClient.post(uploadURL, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type || 'application/octet-stream',
        },
      });

      const uploadData = uploadRes.data?.data || uploadRes.data;
      const objectPath = uploadData?.objectPath || data.objectPath;
      const today = new Date().toISOString().split('T')[0] ?? '2026-08-11';

      const newDoc: DocItem = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        type: docCategory,
        status: 'PENDING',
        uploadedAt: today,
        url: objectPath,
      };

      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);

      // Save updated documents to backend DoctorProfile
      if (role === 'DOCTOR') {
        try {
          let targetDocId = doctorId;
          if (!targetDocId) {
            const meRes = await apiClient.get('/doctors/me');
            const doctorMe = meRes.data?.data || meRes.data;
            if (doctorMe && doctorMe.id) {
              targetDocId = doctorMe.id;
              setDoctorId(targetDocId);
            }
          }
          if (targetDocId) {
            await apiClient.patch(`/doctors/${targetDocId}`, {
              documents: updatedDocs,
            });
          }
        } catch (err) {
          console.error('Failed to sync document with backend profile:', err);
        }
      }

      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to upload document:', err);
      setDocumentError('Failed to upload document. Please try again.');
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleRemoveDocument = async (docId: string) => {
    const updatedDocs = documents.filter((d) => d.id !== docId);
    setDocuments(updatedDocs);
    if (role === 'DOCTOR') {
      try {
        let targetDocId = doctorId;
        if (!targetDocId) {
          const meRes = await apiClient.get('/doctors/me');
          const doctorMe = meRes.data?.data || meRes.data;
          if (doctorMe && doctorMe.id) {
            targetDocId = doctorMe.id;
            setDoctorId(targetDocId);
          }
        }
        if (targetDocId) {
          await apiClient.patch(`/doctors/${targetDocId}`, {
            documents: updatedDocs,
          });
        }
      } catch (err) {
        console.error('Failed to remove document on backend:', err);
      }
    }
  };

  const getTabButtonClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
      isActive
        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
    }`;
  };

  return (
    <Page>
      <PageHeader
        title="Account & Profile Settings"
        description="Update your personal details, profile avatar, security password, and role-specific credential documents."
      />

      {/* Main Settings Wrapper */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-card p-3 rounded-xl border border-border/80 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={getTabButtonClass('profile')}
            >
              <User className="w-4 h-4" /> Personal Profile
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={getTabButtonClass('security')}
            >
              <Lock className="w-4 h-4" /> Password & Security
            </button>

            {(role === 'DOCTOR' || role === 'ADMIN') && (
              <button
                onClick={() => setActiveTab('professional')}
                className={getTabButtonClass('professional')}
              >
                <Stethoscope className="w-4 h-4" /> Professional Credentials & Documents
              </button>
            )}

            {role === 'PATIENT' && (
              <button
                onClick={() => setActiveTab('health')}
                className={getTabButtonClass('health')}
              >
                <Heart className="w-4 h-4" /> Emergency Contact & Medical Info
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: Personal Profile */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-primary" />
                  Personal Information & Profile Avatar
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-5">
                <form onSubmit={handleProfileSave} className="space-y-6 text-xs">
                  {/* Avatar Upload Preview */}
                  <div className="flex items-center gap-5 pb-4 border-b border-border/40">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/20 overflow-hidden shadow-inner">
                        {renderAvatarContent()}
                      </div>
                      <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform disabled:opacity-50">
                        {isUploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {firstName} {lastName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge tone="accent" className="text-[10px]">
                          Role: {role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {uploadError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name">
                      <TextInput
                        type="text"
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFirstName(e.target.value)
                        }
                        required
                      />
                    </Field>

                    <Field label="Last Name">
                      <TextInput
                        type="text"
                        value={lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setLastName(e.target.value)
                        }
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email Address (Account Identifier)">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <TextInput
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="pl-9 bg-muted/40 text-muted-foreground"
                        />
                      </div>
                    </Field>

                    <Field label="Phone Number">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <TextInput
                          type="tel"
                          value={phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPhone(e.target.value)
                          }
                          className="pl-9"
                        />
                      </div>
                    </Field>
                  </div>

                  {profileSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Personal profile updated
                      successfully!
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="gap-1.5 text-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Profile Changes
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* TAB 2: Password & Security */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4 text-primary" />
                  Password & Security Settings
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-5">
                <form
                  onSubmit={handleSecuritySave}
                  className="space-y-4 text-xs max-w-md"
                >
                  <Field label="Current Password">
                    <TextInput
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentPassword(e.target.value)
                      }
                      required
                    />
                  </Field>

                  <Field label="New Password">
                    <TextInput
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPassword(e.target.value)
                      }
                      required
                    />
                  </Field>

                  <Field label="Confirm New Password">
                    <TextInput
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                      }
                      required
                    />
                  </Field>

                  {securityError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {securityError}
                    </div>
                  )}

                  {securitySuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Security password changed
                      successfully!
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingPassword}
                      className="gap-1.5 text-xs"
                    >
                      {isUpdatingPassword ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Shield className="w-3.5 h-3.5" />
                      )}
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* TAB 3: Doctor Professional & Documents (Doctor & Admin) */}
          {activeTab === 'professional' && (role === 'DOCTOR' || role === 'ADMIN') && (
            <div className="space-y-6">
              {/* Doctor Medical Bio & Fees Form */}
              <Card>
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Medical Practice Details
                  </CardTitle>
                </CardHeader>
                <CardBody className="pt-5">
                  <form onSubmit={handleDoctorSave} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Medical Specialization">
                        <TextInput
                          type="text"
                          value={specialization}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSpecialization(e.target.value)
                          }
                        />
                      </Field>

                      <Field label="Qualification & Degrees">
                        <TextInput
                          type="text"
                          value={qualification}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setQualification(e.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Consultation Fee (₹)">
                        <TextInput
                          type="number"
                          value={consultationFee}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setConsultationFee(Number(e.target.value))
                          }
                        />
                      </Field>

                      <Field label="Years of Clinical Experience">
                        <TextInput
                          type="number"
                          value={experienceYears}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setExperienceYears(Number(e.target.value))
                          }
                        />
                      </Field>
                    </div>

                    <Field label="Clinical Biography">
                      <textarea
                        value={biography}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setBiography(e.target.value)
                        }
                        rows={3}
                        className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </Field>

                    {doctorSuccess && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Medical practice profile
                        saved!
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Practice Details
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>

              {/* Document Upload Center */}
              <Card>
                <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Doctor Credential Documents
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDocumentError(null);
                      setSelectedFile(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="text-xs h-8 gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Document
                  </Button>
                </CardHeader>
                <CardBody className="pt-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border/60 rounded-xl bg-muted/10">
                      <FileText className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                      <p className="text-xs font-medium text-foreground">
                        No documents uploaded yet
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Upload your medical license or certification to complete
                        verification.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc, idx) => (
                        <div
                          key={doc.id || `doc-${idx}-${doc.name || 'item'}`}
                          className="p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{doc.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Type: {doc.type} &bull; Uploaded on {doc.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              tone={getDocBadgeTone(doc.status)}
                              className="text-[10px]"
                            >
                              {renderDocStatusContent(doc.status)}
                            </Badge>

                            {doc.url && (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewDocument(doc.url)}
                                  className="h-7 px-2 text-[11px] gap-1"
                                  title="View Document"
                                >
                                  <Eye className="w-3.5 h-3.5 text-primary" /> View
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void downloadDocument(doc.name, doc.url)}
                                  className="h-7 px-2 text-[11px] gap-1"
                                  title="Download Document"
                                >
                                  <Download className="w-3.5 h-3.5 text-foreground" />{' '}
                                  Download
                                </Button>
                              </>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              title="Remove Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {/* TAB 4: Patient Health & Emergency Info */}
          {activeTab === 'health' && role === 'PATIENT' && (
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="w-4 h-4 text-destructive" />
                  Emergency Contact & Medical Details
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-5">
                <form onSubmit={handlePatientSave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Emergency Contact Person">
                      <TextInput
                        type="text"
                        value={emergencyContactName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmergencyContactName(e.target.value)
                        }
                      />
                    </Field>

                    <Field label="Emergency Contact Phone">
                      <TextInput
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmergencyContactPhone(e.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Blood Group">
                      <select
                        value={bloodType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setBloodType(e.target.value)
                        }
                        className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="A+">A Positive (A+)</option>
                        <option value="A-">A Negative (A-)</option>
                        <option value="B+">B Positive (B+)</option>
                        <option value="B-">B Negative (B-)</option>
                        <option value="O+">O Positive (O+)</option>
                        <option value="O-">O Negative (O-)</option>
                        <option value="AB+">AB Positive (AB+)</option>
                        <option value="AB-">AB Negative (AB-)</option>
                      </select>
                    </Field>

                    <Field label="Known Allergies & Conditions">
                      <TextInput
                        type="text"
                        value={allergies}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAllergies(e.target.value)
                        }
                      />
                    </Field>
                  </div>

                  {patientSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Emergency contact details
                      saved!
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="gap-1.5 text-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Emergency Info
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Credential Document Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Upload Credential Document
          </DialogTitle>
          <DialogDescription>
            Select document category and attach your medical license, board certification,
            or government ID proof for verification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmDocumentUpload}>
          <DialogBody className="space-y-4">
            {documentError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{documentError}</span>
              </div>
            )}

            <Field label="Document Category" required>
              <Select
                value={docCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDocCategory(e.target.value)
                }
                className="w-full text-xs"
              >
                <option value="Medical Council License">Medical Council License</option>
                <option value="Board Certification">Board Certification</option>
                <option value="Government ID Proof">Government ID Proof</option>
                <option value="Medical Registration Certificate">
                  Medical Registration Certificate
                </option>
                <option value="Specialist Qualification">Specialist Qualification</option>
              </Select>
            </Field>

            <Field label="Select Document File (PDF, Image, DOC)" required>
              <div className="border-2 border-dashed border-border/80 rounded-xl p-6 text-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                      setDocumentError(null);
                    }
                  }}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-xs font-medium text-foreground">
                      Click or drag to select document file
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Supported formats: PDF, PNG, JPG, DOC (Max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploadingDocument}
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUploadingDocument || !selectedFile}
              className="gap-2 text-xs"
            >
              {isUploadingDocument ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Storage...
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" /> Confirm & Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Page>
  );
}
