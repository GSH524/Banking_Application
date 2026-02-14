import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { userAuth, userDB, userStorage } from '../firebaseUser';

export default function SignUp() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // File States
    const [profileImg, setProfileImg] = useState(null);
    const [idProofFile, setIdProofFile] = useState(null);
    const [previews, setPreviews] = useState({ profile: null, idProof: null });

    const [formData, setFormData] = useState({
        // Step 1: Personal
        firstName: '', lastName: '', dob: '', gender: '', mobile: '', email: '',
        occupation: '', annualIncome: '',
        // Step 2: Address & ID
        address: '', city: '', state: '', pincode: '',
        idProofType: '', idProofNumber: '',
        // Step 3: Account & Security
        accountType: 'Savings', initialDeposit: '',
        nomineeName: '', nomineeRelation: '',
        password: '', confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (!file) return;

        if (name === "profileImg") {
            setProfileImg(file);
            setPreviews(prev => ({ ...prev, profile: URL.createObjectURL(file) }));
        } else {
            setIdProofFile(file);
            // Preview logic for ID Document
            if (file.type.startsWith('image/')) {
                setPreviews(prev => ({ ...prev, idProof: URL.createObjectURL(file) }));
            } else {
                setPreviews(prev => ({ ...prev, idProof: 'pdf' })); // Flag for PDF icon
            }
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
        if (!formData.dob) newErrors.dob = 'DOB is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = '10 digits required';
        if (!/^.+@.+\..+$/.test(formData.email)) newErrors.email = 'Valid email required';
        if (!formData.occupation) newErrors.occupation = 'Occupation required';
        if (!profileImg) newErrors.profileImg = 'Profile photo required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.address.trim()) newErrors.address = 'Address required';
        if (!formData.city.trim()) newErrors.city = 'City required';
        if (!formData.state.trim()) newErrors.state = 'State required';
        if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = '6 digits';
        if (!formData.idProofType) newErrors.idProofType = 'Select ID type';
        if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID number required';
        if (!idProofFile) newErrors.idProofFile = 'Document upload required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        const deposit = Number(formData.initialDeposit);
        if (!formData.initialDeposit || deposit <= 0) newErrors.initialDeposit = 'Min ₹1 required';
        if (!formData.nomineeName.trim()) newErrors.nomineeName = 'Nominee required';
        if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords mismatch';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = currentStep === 1 ? validateStep1() : validateStep2();
        if (isValid) setCurrentStep(prev => prev + 1);
    };

    const uploadFile = async (file, path) => {
        const storageRef = ref(userStorage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;
        setSubmitting(true);
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(userAuth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. ONLY Upload Profile Image (ID Proof skipped as per request)
            const profileUrl = await uploadFile(profileImg, `users/${user.uid}/profile.jpg`);

            // 3. Prepare Profile Data (Note: idProofDoc is omitted)
            const userProfile = {
                ...formData,
                profilePic: profileUrl,
                balance: Number(formData.initialDeposit),
                status: "pending",
                createdAt: serverTimestamp()
            };

            // Cleanup sensitive fields
            delete userProfile.password;
            delete userProfile.confirmPassword;

            // 4. Save to Firestore
            await setDoc(doc(userDB, 'users', user.uid), userProfile);

            // 5. Create Admin Notification
            await addDoc(collection(userDB, 'notifications'), {
                type: 'new_user',
                message: `New KYC: ${userProfile.email}`,
                userId: user.uid,
                read: false,
                createdAt: serverTimestamp()
            });

            alert('Registration complete! Awaiting admin approval.');
            navigate('/login');
        } catch (error) {
            console.error("Submission Error:", error);
            setErrors({ general: error.message });
        } finally {
            setSubmitting(false);
        }
    };
    const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm";
    const labelClass = "block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider";
    const errorClass = "text-[10px] text-red-500 mt-1 block font-medium";

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white mb-2">Create Your Account</h1>
                        <p className="text-slate-400">Join VajraBank for secure and smart banking</p>
                    </div>

                    {/* Progress Bar with Labels */}
                    <div className="relative flex justify-between mb-12 max-w-sm mx-auto">
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-800 z-0" />
                        {[1, 2, 3].map(step => (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step <= currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                    {step}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step <= currentStep ? 'text-indigo-400' : 'text-slate-600'
                                    }`}>
                                    {step === 1 ? 'Personal' : step === 2 ? 'Identity' : 'Account'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>

                        {/* Step 1: Personal */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="flex flex-col items-center mb-4">
                                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group">
                                        {previews.profile ? <img src={previews.profile} className="w-full h-full object-cover" alt="Profile Preview" /> : <span className="text-slate-500 text-[10px] text-center px-2 uppercase font-bold">Upload Photo</span>}
                                        <input type="file" name="profileImg" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    </div>
                                    {errors.profileImg && <span className={errorClass}>{errors.profileImg}</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className={labelClass}>First Name *</label><input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="John" />{errors.firstName && <span className={errorClass}>{errors.firstName}</span>}</div>
                                    <div><label className={labelClass}>Last Name *</label><input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" />{errors.lastName && <span className={errorClass}>{errors.lastName}</span>}</div>
                                    <div><label className={labelClass}>Date of Birth *</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />{errors.dob && <span className={errorClass}>{errors.dob}</span>}</div>
                                    <div><label className={labelClass}>Gender *</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                        {errors.gender && <span className={errorClass}>{errors.gender}</span>}
                                    </div>
                                    <div><label className={labelClass}>Occupation *</label>
                                        <select name="occupation" value={formData.occupation} onChange={handleChange} className={inputClass}>
                                            <option value="">Select</option>
                                            <option value="Salaried">Salaried</option>
                                            <option value="Self-Employed">Self-Employed</option>
                                            <option value="Student">Student</option>
                                        </select>
                                        {errors.occupation && <span className={errorClass}>{errors.occupation}</span>}
                                    </div>
                                    <div><label className={labelClass}>Annual Income *</label><input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} className={inputClass} placeholder="₹" />{errors.annualIncome && <span className={errorClass}>{errors.annualIncome}</span>}</div>
                                    <div><label className={labelClass}>Mobile *</label><input name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} maxLength={10} />{errors.mobile && <span className={errorClass}>{errors.mobile}</span>}</div>
                                    <div><label className={labelClass}>Email *</label><input name="email" value={formData.email} onChange={handleChange} className={inputClass} />{errors.email && <span className={errorClass}>{errors.email}</span>}</div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Identity */}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                <div className="md:col-span-2"><label className={labelClass}>Residential Address *</label><input name="address" value={formData.address} onChange={handleChange} className={inputClass} />{errors.address && <span className={errorClass}>{errors.address}</span>}</div>
                                <div><label className={labelClass}>City *</label><input name="city" value={formData.city} onChange={handleChange} className={inputClass} />{errors.city && <span className={errorClass}>{errors.city}</span>}</div>
                                <div><label className={labelClass}>State *</label><input name="state" value={formData.state} onChange={handleChange} className={inputClass} />{errors.state && <span className={errorClass}>{errors.state}</span>}</div>
                                <div><label className={labelClass}>Pincode *</label><input name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} maxLength={6} />{errors.pincode && <span className={errorClass}>{errors.pincode}</span>}</div>
                                <div><label className={labelClass}>ID Proof Type *</label>
                                    <select name="idProofType" value={formData.idProofType} onChange={handleChange} className={inputClass}>
                                        <option value="">Select ID</option>
                                        <option value="Aadhaar">Aadhaar</option>
                                        <option value="PAN">PAN Card</option>
                                    </select>
                                    {errors.idProofType && <span className={errorClass}>{errors.idProofType}</span>}
                                </div>
                                <div><label className={labelClass}>ID Number *</label><input name="idProofNumber" value={formData.idProofNumber} onChange={handleChange} className={inputClass} />{errors.idProofNumber && <span className={errorClass}>{errors.idProofNumber}</span>}</div>

                                {formData.idProofType && (
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                            <label className={labelClass}>Upload {formData.idProofType} Document *</label>
                                            <input type="file" name="idProofFile" onChange={handleFileChange} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white cursor-pointer" accept=".pdf,.jpg,.jpeg,.png" />
                                            {errors.idProofFile && <span className={errorClass}>{errors.idProofFile}</span>}
                                        </div>

                                        {/* ID PREVIEW AREA */}
                                        {previews.idProof && (
                                            <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700 animate-in fade-in zoom-in-95">
                                                <div className="w-16 h-16 rounded bg-slate-900 border border-slate-600 flex items-center justify-center overflow-hidden">
                                                    {previews.idProof === 'pdf' ? (
                                                        <div className="text-center"><p className="text-red-500 font-black text-xs">PDF</p></div>
                                                    ) : (
                                                        <img src={previews.idProof} className="w-full h-full object-cover" alt="ID Preview" />
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold text-white truncate">{idProofFile?.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Ready for upload</p>
                                                </div>
                                                <button type="button" onClick={() => { setIdProofFile(null); setPreviews(p => ({ ...p, idProof: null })); }} className="text-[10px] text-red-400 font-bold hover:underline">REMOVE</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Account */}
                        {currentStep === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                <div><label className={labelClass}>Account Type</label>
                                    <select name="accountType" value={formData.accountType} onChange={handleChange} className={inputClass}>
                                        <option value="Savings">Savings</option>
                                        <option value="Current">Current</option>
                                    </select>
                                </div>
                                <div><label className={labelClass}>Initial Deposit (₹) *</label><input type="number" name="initialDeposit" value={formData.initialDeposit} onChange={handleChange} className={inputClass} />{errors.initialDeposit && <span className={errorClass}>{errors.initialDeposit}</span>}</div>

                                <div className="md:col-span-2 p-5 bg-slate-800/50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 border border-white/5">
                                    <div className="md:col-span-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Nominee Details</div>
                                    <div><label className={labelClass}>Nominee Name *</label><input name="nomineeName" value={formData.nomineeName} onChange={handleChange} className={inputClass} />{errors.nomineeName && <span className={errorClass}>{errors.nomineeName}</span>}</div>
                                    <div><label className={labelClass}>Relationship *</label><input name="nomineeRelation" value={formData.nomineeRelation} onChange={handleChange} className={inputClass} /></div>
                                </div>

                                <div className="relative">
                                    <label className={labelClass}>Create Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                    {errors.password && <span className={errorClass}>{errors.password}</span>}
                                </div>

                                <div className="relative">
                                    <label className={labelClass}>Confirm Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                    </div>
                                    {errors.confirmPassword && <span className={errorClass}>{errors.confirmPassword}</span>}
                                </div>
                                {errors.general && <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center rounded-lg">{errors.general}</div>}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-10 flex gap-4">
                            {currentStep > 1 && (
                                <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors text-sm">
                                    Previous
                                </button>
                            )}
                            <button
                                type={currentStep === 3 ? "submit" : "button"}
                                onClick={currentStep < 3 ? handleNext : undefined}
                                disabled={submitting}
                                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-widest"
                            >
                                {currentStep < 3 ? 'Next Step' : submitting ? 'KYC In Progress...' : 'Submit KYC'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-xs font-medium">
                        Already have an account? <Link to="/login" className="text-indigo-400 font-bold hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}