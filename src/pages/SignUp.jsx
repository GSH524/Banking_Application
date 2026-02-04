import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { userAuth, userDB } from '../firebaseUser';

export default function SignUp() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', dob: '', gender: '', mobile: '', email: '',
        address: '', city: '', state: '', pincode: '', idProofType: '', idProofNumber: '',
        accountType: 'Savings', initialDeposit: '', username: '', password: '', confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile must be 10 digits';
        if (!/^.+@.+\..+$/.test(formData.email)) newErrors.email = 'Valid email is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
        if (!formData.idProofType) newErrors.idProofType = 'ID proof type is required';
        if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID proof number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.accountType) newErrors.accountType = 'Account type is required';
        const deposit = Number(formData.initialDeposit);
        if (!formData.initialDeposit || deposit <= 0) newErrors.initialDeposit = 'Initial deposit must be > ₹0';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = currentStep === 1 ? validateStep1() : validateStep2();
        if (isValid && currentStep < 3) setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;
        setSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(userAuth, formData.email, formData.password);
            const user = userCredential.user;
            const userProfile = { ...formData, balance: Number(formData.initialDeposit), status: "pending", transactions: [], loans: [], createdAt: serverTimestamp() };
            delete userProfile.password; delete userProfile.confirmPassword;

            await setDoc(doc(userDB, 'users', user.uid), userProfile);
            await addDoc(collection(userDB, 'notifications'), {
                type: 'new_user', message: `New account request from: ${userProfile.email}`,
                userId: user.uid, read: false, createdAt: serverTimestamp()
            });
            alert('Account request sent to admin for approval.');
            navigate('/login');
        } catch (error) {
            setErrors({ general: error.message });
            setSubmitting(false);
        }
    };

    const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const labelClass = "block text-sm font-medium text-slate-400 mb-1.5";
    const errorClass = "text-xs text-red-500 mt-1 block";

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-white mb-2">Create Your Account</h1>
                        <p className="text-slate-400">Join VajraBank for secure and smart banking</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative flex justify-between mb-12 max-w-sm mx-auto">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                        {[1, 2, 3].map(step => (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                                    step <= currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
                                }`}>
                                    {step}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                    step <= currentStep ? 'text-indigo-400' : 'text-slate-600'
                                }`}>
                                    {step === 1 ? 'Personal' : step === 2 ? 'Identity' : 'Account'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
                        {/* Step 1: Personal */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="John" />
                                    {errors.firstName && <span className={errorClass}>{errors.firstName}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" />
                                    {errors.lastName && <span className={errorClass}>{errors.lastName}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Date of Birth *</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
                                    {errors.dob && <span className={errorClass}>{errors.dob}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Gender *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {errors.gender && <span className={errorClass}>{errors.gender}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Mobile Number *</label>
                                    <input name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} placeholder="10 Digit Number" maxLength={10} />
                                    {errors.mobile && <span className={errorClass}>{errors.mobile}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Email Address *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" />
                                    {errors.email && <span className={errorClass}>{errors.email}</span>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Address */}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Residential Address *</label>
                                    <input name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street, Building, Flat" />
                                    {errors.address && <span className={errorClass}>{errors.address}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>City *</label>
                                    <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                                    {errors.city && <span className={errorClass}>{errors.city}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Pincode *</label>
                                    <input name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} maxLength={6} />
                                    {errors.pincode && <span className={errorClass}>{errors.pincode}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>ID Type *</label>
                                    <select name="idProofType" value={formData.idProofType} onChange={handleChange} className={inputClass}>
                                        <option value="">Select ID</option>
                                        <option value="Aadhaar">Aadhaar</option>
                                        <option value="PAN">PAN Card</option>
                                    </select>
                                    {errors.idProofType && <span className={errorClass}>{errors.idProofType}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>ID Number *</label>
                                    <input name="idProofNumber" value={formData.idProofNumber} onChange={handleChange} className={inputClass} />
                                    {errors.idProofNumber && <span className={errorClass}>{errors.idProofNumber}</span>}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Account */}
                        {currentStep === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className={labelClass}>Account Type</label>
                                    <select name="accountType" value={formData.accountType} onChange={handleChange} className={inputClass}>
                                        <option value="Savings">Savings</option>
                                        <option value="Current">Current</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Initial Deposit (₹) *</label>
                                    <input type="number" name="initialDeposit" value={formData.initialDeposit} onChange={handleChange} className={inputClass} />
                                    {errors.initialDeposit && <span className={errorClass}>{errors.initialDeposit}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Create Password *</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} />
                                    {errors.password && <span className={errorClass}>{errors.password}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Confirm Password *</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} />
                                    {errors.confirmPassword && <span className={errorClass}>{errors.confirmPassword}</span>}
                                </div>
                                {errors.general && <div className="md:col-span-2 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">{errors.general}</div>}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-10 flex gap-4">
                            {currentStep > 1 && (
                                <button type="button" onClick={handlePrevious} className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors">
                                    Previous
                                </button>
                            )}
                            <button 
                                type={currentStep === 3 ? "submit" : "button"} 
                                onClick={currentStep < 3 ? handleNext : undefined} 
                                disabled={submitting}
                                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {currentStep < 3 ? 'Next Step' : submitting ? 'Creating Account...' : 'Finish & Submit'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Already have an account? <Link to="/login" className="text-indigo-400 font-bold hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}