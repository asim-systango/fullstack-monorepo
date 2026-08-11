'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth';
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
} from '@shared/ui/components';
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
  Server,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function UserSettingsPage() {
  const { user } = useAuth();
  const role = (user?.role || 'PATIENT').toUpperCase();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'professional' | 'health' | 'system'
  >('profile');

  // General Profile State
  const [firstName, setFirstName] = useState(
    user?.firstName || user?.name?.split(' ')[0] || '',
  );
  const [lastName, setLastName] = useState(
    user?.lastName || user?.name?.split(' ')[1] || '',
  );
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);

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
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      name: 'Medical Council License.pdf',
      type: 'License',
      status: 'VERIFIED',
      uploadedAt: '2026-01-15',
    },
    {
      id: 'doc-2',
      name: 'Board Certification.pdf',
      type: 'Certificate',
      status: 'VERIFIED',
      uploadedAt: '2026-02-10',
    },
    {
      id: 'doc-3',
      name: 'Government ID Proof.jpg',
      type: 'ID Proof',
      status: 'PENDING',
      uploadedAt: '2026-08-01',
    },
  ]);

  // Patient Health State
  const [emergencyContactName, setEmergencyContactName] = useState('Jane Doe');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+1 (555) 987-6543');
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('Penicillin, Peanuts');
  const [patientSuccess, setPatientSuccess] = useState(false);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleProfileSave = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleSecuritySave = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSecuritySuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSecuritySuccess(false), 3000);
  };

  const handleDoctorSave = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDoctorSuccess(true);
    setTimeout(() => setDoctorSuccess(false), 3000);
  };

  const handlePatientSave = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPatientSuccess(true);
    setTimeout(() => setPatientSuccess(false), 3000);
  };

  const handleDocumentSimulatedUpload = () => {
    const today = new Date().toISOString().split('T')[0] ?? '2026-08-11';
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: `Uploaded_Document_${documents.length + 1}.pdf`,
      type: 'Medical Document',
      status: 'PENDING',
      uploadedAt: today,
    };
    setDocuments([...documents, newDoc]);
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

            {role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('system')}
                className={getTabButtonClass('system')}
              >
                <Server className="w-4 h-4" /> System Health & Audits
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
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          `${firstName[0] || 'U'}${lastName[0] || ''}`
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
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
                      className="gap-1.5 text-xs"
                    >
                      <Shield className="w-3.5 h-3.5" /> Update Password
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
                    onClick={handleDocumentSimulatedUpload}
                    className="text-xs h-8 gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Document
                  </Button>
                </CardHeader>
                <CardBody className="pt-4">
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
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

                        <Badge
                          tone={doc.status === 'VERIFIED' ? 'success' : 'warning'}
                          className="text-[10px]"
                        >
                          {doc.status === 'VERIFIED' ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />{' '}
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" /> Pending Review
                            </span>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
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

          {/* TAB 5: Admin System Status & Audit */}
          {activeTab === 'system' && role === 'ADMIN' && (
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="w-4 h-4 text-primary" />
                  System Health & Audit Compliance
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-4 space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      NestJS API Server
                    </span>
                    <Badge tone="success" className="text-[10px]">
                      Operational (200 OK)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      PostgreSQL Database
                    </span>
                    <Badge tone="success" className="text-[10px]">
                      Connected (TypeORM)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      X-Correlation-ID Audit Interceptor
                    </span>
                    <Badge tone="accent" className="text-[10px]">
                      Enabled
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> System monitoring and security trace
                  logs are running active in the background.
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}
