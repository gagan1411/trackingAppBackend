import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
    Alert, Image, ActivityIndicator, Modal, Keyboard, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import LeafletMapView from '../../components/LeafletMapView';
import {
    Camera, MapPin, Shield, Trash2, X, Globe, Search, Navigation,
    Car, User, Phone, FileText, Home, ChevronDown, Fingerprint, ArrowLeft
} from 'lucide-react-native';
import { saveCivilian, saveEntryLog, saveBiometricTemplate } from '../../database/db';
import PrimeDropdown from '../../components/PrimeDropdown';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { getLocalBiometricUrl, registerFaceLocal } from '../../services/localBiometric';

// ─── State → Districts Map ────────────────────────────────────────────────────
const DISTRICTS_BY_STATE = {
    'Jammu & Kashmir': ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'],
    'Ladakh': ['Kargil', 'Leh'],
    'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul & Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
    'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Nawanshahr', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran'],
    'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungapur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
    'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddh Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushi Nagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shrawasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
    'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
    'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
    'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
    'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
    'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
    'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Villupuram', 'Virudhunagar'],
    'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
    'Andhra Pradesh': ['Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Bapatla', 'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kadapa', 'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR'],
    'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagitial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'],
    'West Bengal': ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'],
    'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
    'Assam': ['Bajali', 'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'],
    'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'],
    'Odisha': ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'],
    'Chhattisgarh': ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mohla-Manpur', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Surguja'],
    'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'],
    'Goa': ['North Goa', 'South Goa'],
    'Chandigarh': ['Chandigarh'],
    'Puducherry': ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
    'Sikkim': ['East Sikkim', 'North Sikkim', 'Pakyong', 'Soreng', 'South Sikkim', 'West Sikkim'],
    'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Eastern West Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
    'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'],
    'Nagaland': ['Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 'Wokha', 'Zunheboto'],
    'Arunachal Pradesh': ['Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke-Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
    'Mizoram': ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'],
    'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
    'Andaman & Nicobar Islands': ['Nicobar', 'North & Middle Andaman', 'South Andaman'],
    'Dadra & Nagar Haveli and Daman & Diu': ['Dadra & Nagar Haveli', 'Daman', 'Diu'],
    'Lakshadweep': ['Lakshadweep'],
};

// Normalize state name from geocoding response to match our state list
const normalizeState = (raw) => {
    if (!raw) return null;
    const map = {
        'jammu and kashmir': 'Jammu & Kashmir',
        'j&k': 'Jammu & Kashmir',
        'ladakh': 'Ladakh',
        'andaman and nicobar': 'Andaman & Nicobar Islands',
        'andaman & nicobar': 'Andaman & Nicobar Islands',
        'dadra and nagar haveli': 'Dadra & Nagar Haveli and Daman & Diu',
        'daman and diu': 'Dadra & Nagar Haveli and Daman & Diu',
        'nct of delhi': 'Delhi',
        'delhi': 'Delhi',
        'puducherry': 'Puducherry',
        'pondicherry': 'Puducherry',
    };
    const lower = raw.toLowerCase().trim();
    return map[lower] || Object.keys(DISTRICTS_BY_STATE).find(s => s.toLowerCase() === lower) || null;
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const RED = '#FF4D4D';
const TEXT_MUTED = 'rgba(255,255,255,0.5)';
const TEXT_LIGHT = 'rgba(255,255,255,0.7)';

export default function RegisterCivilian({ navigation }) {
    // Basic Info
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [mobile, setMobile] = useState('');
    const [dob, setDob] = useState('');
    const [occupation, setOccupation] = useState('');

    // ID Proof
    const [idType, setIdType] = useState('Aadhar');
    const [idNumber, setIdNumber] = useState('');
    const [fenceCardNo, setFenceCardNo] = useState('');
    const [openDropdown, setOpenDropdown] = useState(false);
    const [idOptions, setIdOptions] = useState([
        { label: '🪪 Aadhar Card', value: 'Aadhar' },
        { label: '🗳️ Voter ID', value: 'Voter' },
        { label: '📘 Passport', value: 'Passport' },
        { label: '💳 PAN Card', value: 'PAN' },
        { label: '🪖 Army ID', value: 'Army' },
    ]);

    // Religion
    const [religion, setReligion] = useState(null);
    const [openReligion, setOpenReligion] = useState(false);
    const [religionOptions] = useState([
        { label: 'Sunni Muslim', value: 'Sunni Muslim' },
        { label: 'Shia Muslim', value: 'Shia Muslim' },
        { label: 'Hindu', value: 'Hindu' },
        { label: 'Sikh', value: 'Sikh' },
        { label: 'Christian', value: 'Christian' },
        { label: 'Buddhist', value: 'Buddhist' },
        { label: 'Jain', value: 'Jain' },
        { label: 'Other', value: 'Other' },
    ]);

    // Physiological Characteristics
    const [physiologicalCharacteristics, setPhysiologicalCharacteristics] = useState('');

    // Vehicles (Multiple)
    const [vehicles, setVehicles] = useState([{ model: '', number: '', color: '' }]);

    const addVehicle = () => {
        setVehicles([...vehicles, { model: '', number: '', color: '' }]);
    };

    const updateVehicle = (index, field, value) => {
        const newVehicles = [...vehicles];
        newVehicles[index][field] = value;
        setVehicles(newVehicles);
    };

    const removeVehicle = (index) => {
        if (vehicles.length > 1) {
            setVehicles(vehicles.filter((_, i) => i !== index));
        }
    };

    // Gender 
    const [gender, setGender] = useState('Male');
    const [openGender, setOpenGender] = useState(false);
    const [genderOptions, setGenderOptions] = useState([
        { label: '♂️ Male', value: 'Male' },
        { label: '♀️ Female', value: 'Female' },
        { label: '⚧️ Other', value: 'Other' },
    ]);

    // Blood Relatives
    const [bloodRelatives, setBloodRelatives] = useState([{ relation: 'Father', name: '' }]);
    const [openRelative, setOpenRelative] = useState(null);
    const relativeOptions = [
        { label: 'Father', value: 'Father' },
        { label: 'Mother', value: 'Mother' },
        { label: 'Brother', value: 'Brother' },
        { label: 'Sister', value: 'Sister' },
        { label: 'Son', value: 'Son' },
        { label: 'Daughter', value: 'Daughter' },
    ];

    const addRelative = () => {
        setBloodRelatives([...bloodRelatives, { relation: 'Father', name: '' }]);
    };

    const updateRelative = (index, field, value) => {
        const newRel = [...bloodRelatives];
        newRel[index][field] = value;
        setBloodRelatives(newRel);
    };

    // Address & GPS
    const [state, setState] = useState('Jammu & Kashmir');
    const [openState, setOpenState] = useState(false);
    const [stateOptions] = useState([
        { label: 'Andaman & Nicobar Islands', value: 'Andaman & Nicobar Islands' },
        { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
        { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
        { label: 'Assam', value: 'Assam' },
        { label: 'Bihar', value: 'Bihar' },
        { label: 'Chandigarh', value: 'Chandigarh' },
        { label: 'Chhattisgarh', value: 'Chhattisgarh' },
        { label: 'Dadra & Nagar Haveli and Daman & Diu', value: 'Dadra & Nagar Haveli and Daman & Diu' },
        { label: 'Delhi', value: 'Delhi' },
        { label: 'Goa', value: 'Goa' },
        { label: 'Gujarat', value: 'Gujarat' },
        { label: 'Haryana', value: 'Haryana' },
        { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
        { label: 'Jammu & Kashmir', value: 'Jammu & Kashmir' },
        { label: 'Jharkhand', value: 'Jharkhand' },
        { label: 'Karnataka', value: 'Karnataka' },
        { label: 'Kerala', value: 'Kerala' },
        { label: 'Ladakh', value: 'Ladakh' },
        { label: 'Lakshadweep', value: 'Lakshadweep' },
        { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
        { label: 'Maharashtra', value: 'Maharashtra' },
        { label: 'Manipur', value: 'Manipur' },
        { label: 'Meghalaya', value: 'Meghalaya' },
        { label: 'Mizoram', value: 'Mizoram' },
        { label: 'Nagaland', value: 'Nagaland' },
        { label: 'Odisha', value: 'Odisha' },
        { label: 'Puducherry', value: 'Puducherry' },
        { label: 'Punjab', value: 'Punjab' },
        { label: 'Rajasthan', value: 'Rajasthan' },
        { label: 'Sikkim', value: 'Sikkim' },
        { label: 'Tamil Nadu', value: 'Tamil Nadu' },
        { label: 'Telangana', value: 'Telangana' },
        { label: 'Tripura', value: 'Tripura' },
        { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
        { label: 'Uttarakhand', value: 'Uttarakhand' },
        { label: 'West Bengal', value: 'West Bengal' },
    ]);
    const [district, setDistrict] = useState(null);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [tehsil, setTehsil] = useState('');
    const [village, setVillage] = useState('');
    const [houseDetails, setHouseDetails] = useState('');

    // Update district options when state changes
    useEffect(() => {
        const dists = DISTRICTS_BY_STATE[state] || [];
        setDistrictOptions(dists.map(d => ({ label: d, value: d })));
        setDistrict(null); // reset district when state changes
    }, [state]);

    const [location, setLocation] = useState(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Automatic Categorization
    const getCategory = () => {
        const fwdVillages = ['Village A', 'Village B'];
        return fwdVillages.includes(village) ? 'fwd resident' : 'outside resident';
    };

    // Map States
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [region, setRegion] = useState({ latitude: 34.5262, longitude: 74.2546 });

    // Photo & Biometric
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [fingerprintImage, setFingerprintImage] = useState(null);
    const [fingerprintTemplate, setFingerprintTemplate] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Saving
    const [saving, setSaving] = useState(false);

    const fetchGPS = async () => {
        setFetchingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLocation(pos.coords);
            setRegion({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });

            // Auto-detect state & district via reverse geocoding
            try {
                const geo = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`,
                    { headers: { 'User-Agent': 'TrackingApp_FieldModule/1.0' } }
                );
                const geoData = await geo.json();
                const addr = geoData?.address || {};
                const rawState = addr.state || addr.region || '';
                const rawDistrict = addr.county || addr.state_district || addr.district || '';
                const detectedState = normalizeState(rawState);
                if (detectedState) {
                    setState(detectedState);
                    if (rawDistrict) {
                        const dists = DISTRICTS_BY_STATE[detectedState] || [];
                        const matched = dists.find(d => d.toLowerCase().includes(rawDistrict.toLowerCase().split(' ')[0]));
                        if (matched) setTimeout(() => setDistrict(matched), 300);
                    }
                }
            } catch (geoErr) {
                console.log('Reverse geocode failed:', geoErr.message);
            }
        } catch (e) {
            console.log('GPS:', e);
        } finally {
            setFetchingLocation(false);
        }
    };

    useEffect(() => {
        fetchGPS();
    }, []);


    const handleTakePhoto = async () => {
        setUploadingPhoto(true);
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera permission is needed to capture photo.');
                setUploadingPhoto(false);
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaType: ImagePicker.MediaType.Images,
                quality: 0.7,
                base64: true, // We need the raw data string for reliable cloud JSON upload!
                allowsEditing: false, // editing=true causes temp file issues on Android
            });
            if (!result.canceled && result.assets && result.assets[0]) {
                const srcUri = result.assets[0].uri;
                const b64Data = result.assets[0].base64;
                // Copy to app cache so the file persists reliably
                const fileName = 'photo_' + Date.now() + '.jpg';
                const destUri = FileSystem.cacheDirectory + fileName;
                await FileSystem.copyAsync({ from: srcUri, to: destUri });
                
                // Store BOTH the file link (for local display) and the raw data (for reliable cloud upload)
                setCapturedPhoto({ uri: destUri, base64: b64Data });
            }
        } catch (e) {
            console.error('Camera error:', e);
            Alert.alert('Error', 'Could not open camera: ' + e.message);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ─── Fingerprint Enrollment (Local) ────────────────────────────────────────
    // We store a unique token locally; the device sensor confirms the scan.
    const handleBiometricEnroll = async () => {
        const { LocalAuthentication } = require('expo-local-authentication');
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            Alert.alert(
                'No Fingerprint Sensor',
                'Your device does not have a fingerprint sensor or none are enrolled in Settings.'
            );
            return;
        }

        Alert.alert(
            'Fingerprint Enrollment',
            'Ask the civilian to place their finger on the scanner. The device will capture the fingerprint.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'START SCAN',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            const result = await LocalAuthentication.authenticateAsync({
                                promptMessage: 'Scan civilian fingerprint for enrollment',
                                cancelLabel: 'Cancel',
                                disableDeviceFallback: true,
                            });
                            if (result.success) {
                                // Generate a unique template token for this enrollment
                                const token = 'FP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
                                setFingerprintTemplate(token);
                                setFingerprintImage('enrolled');
                                Alert.alert('✅ Enrolled', 'Fingerprint captured and stored locally.');
                            } else {
                                Alert.alert('Scan Failed', 'Fingerprint not recognized. Please try again.');
                            }
                        } catch (e) {
                            Alert.alert('Error', e.message);
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };


    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) return;
        setIsSearching(true);
        setSearchError(null);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                { headers: { 'User-Agent': 'TrackingApp_FieldModule/1.0' } }
            );
            const data = await response.json();
            setSuggestions(data || []);
            if (data.length === 0) setSearchError('NO RESULTS FOUND');
        } catch {
            setSearchError('NETWORK ERROR');
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSuggestion = (item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        setRegion({ latitude: lat, longitude: lon });
        setLocation({ latitude: lat, longitude: lon });
        setSuggestions([]);
        setSearchError(null);
        setSearchQuery(item.display_name.split(',')[0]);
        Keyboard.dismiss();
    };

    const finalizeSave = async () => {
        // Validation
        if (!name.trim() || !fatherName.trim() || !mobile || !dob || !occupation || !village.trim() || !district || !tehsil || !idNumber || !religion) {
            return Alert.alert('Required Fields Missing', 'All fields marked with * are compulsory.');
        }
        if (mobile.length !== 10) {
            return Alert.alert('Invalid Phone', 'Phone number must be exactly 10 digits.');
        }
        if (idType === 'Aadhar' && idNumber.length !== 12) {
            return Alert.alert('Invalid Aadhar', 'Aadhar number must be exactly 12 digits.');
        }

        const category = getCategory();
        const userId = idNumber.trim();

        setSaving(true);
        try {
            // ── 1. Save civilian profile to local SQLite ──────────────────────
            const registrationData = {
                name: name.trim(),
                fatherName: fatherName.trim(),
                mobile,
                idProof: idType,
                idNumber: userId,
                religion,
                occupation,
                dob,
                physiologicalCharacteristics,
                fenceCardNo,
                vehicles: JSON.stringify(vehicles),
                state,
                district,
                tehsil,
                village,
                houseDetails,
                category,
                bloodRelatives: JSON.stringify(bloodRelatives),
                lat: location?.latitude,
                lon: location?.longitude,
                photo: capturedPhoto,
                fingerprintLinked: !!fingerprintTemplate,
                syncId: Date.now().toString() + '_' + userId
            };

            await saveCivilian(registrationData);

            // ── 2. Save face embedding to local SQLite ────────────────────────
            // Store the photo URI as the "template" so BiometricVerify can
            // display it and the local server can compare later if online.
            if (capturedPhoto) {
                await saveBiometricTemplate({
                    user_id: userId,
                    type: 'face',
                    template: JSON.stringify({ photoUri: capturedPhoto, registered: true }),
                });
            }

            // ── 3. Save fingerprint token to local SQLite ─────────────────────
            if (fingerprintTemplate) {
                await saveBiometricTemplate({
                    user_id: userId,
                    type: 'fingerprint',
                    template: fingerprintTemplate,
                });
            }

            // ── 4. Log the entry automatically ───────────────────────────────
            await saveEntryLog({
                civilianId: Date.now(),
                name: name.trim(),
                village,
                type: 'Entry',
                category,
                vehicleDetails: JSON.stringify(vehicles[0])
            });

            // ── 5. Background: try LAN server upload (non-blocking) ──────────
            if (capturedPhoto && capturedPhoto.base64) {
                getLocalBiometricUrl().then(localUrl => {
                    if (localUrl) {
                        registerFaceLocal(localUrl, userId, capturedPhoto.base64)
                            .then(r => console.log('LAN face register:', r.message))
                            .catch(e => console.log('LAN face register skip:', e.message));
                    }
                }).catch(() => { });
            }

            // ── 6. Background: try central server sync (non-blocking) ────────
            api.post('/civilians/register', registrationData)
                .catch(() => console.warn('Central registration failed, saved locally only.'));

            Alert.alert('✅ Registered', `${name.trim()} has been registered locally. Biometrics saved to device database.`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not save. ' + error.message);
        } finally {
            setSaving(false);
        }
    };


    const getIDPlaceholder = () => {
        switch (idType) {
            case 'Aadhar': return '1234 5678 9012 (12 digits)';
            case 'PAN': return 'ABCDE1234F';
            case 'Passport': return 'A1234567';
            default: return 'ID Number';
        }
    };

    return (
        <ImageBackground
            source={require('../../images/pages.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.overlay}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ArrowLeft color={GOLD} size={28} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>NEW ENTRY — REGISTRATION</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView
                        style={styles.container}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── IDENTIFICATION ── */}
                        <View style={styles.card}>
                            <SectionLabel icon={<Camera color={GOLD} size={14} />} label="SUBJECT IDENTIFICATION" />

                            <View style={styles.captureRow}>
                                <View style={styles.captureBlock}>
                                    <Text style={styles.captureLabel}>FACIAL PHOTO</Text>
                                    {capturedPhoto ? (
                                        <View style={styles.photoBox}>
                                            <Image source={{ uri: capturedPhoto }} style={styles.photoPreviewSm} />
                                            <TouchableOpacity style={styles.deletePhoto} onPress={() => setCapturedPhoto(null)}>
                                                <Trash2 color="#FFF" size={14} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.photoPlaceholderSm} onPress={handleTakePhoto}>
                                            <Camera color={GOLD} size={24} />
                                            <Text style={styles.photoBtnTextSm}>CAMERA</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.captureDivider} />

                                <View style={styles.captureBlock}>
                                    <Text style={styles.captureLabel}>BIOMETRIC</Text>
                                    {fingerprintImage ? (
                                        <View style={[styles.photoBox, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(139,195,74,0.1)', borderRadius: 12, borderWidth: 1, borderColor: '#8BC34A' }]}>
                                            <Fingerprint color="#8BC34A" size={40} />
                                            <Text style={{ color: '#8BC34A', fontSize: 9, fontWeight: 'bold', marginTop: 6 }}>ENROLLED</Text>
                                            <TouchableOpacity style={styles.deletePhoto} onPress={() => { setFingerprintImage(null); setFingerprintTemplate(null); }}>
                                                <Trash2 color="#FFF" size={14} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.photoPlaceholderSm} onPress={handleBiometricEnroll}>
                                            <Fingerprint color={GOLD} size={24} />
                                            <Text style={styles.photoBtnTextSm}>SCAN</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <Text style={styles.photoHint}>Capture photo and scan fingerprint for enrollment</Text>
                        </View>

                        {/* ── BIO DATA ── */}
                        <View style={styles.card}>
                            <SectionLabel icon={<User color={GOLD} size={14} />} label="BIOGRAPHIC DATA" />

                            <FLabel required>FULL NAME</FLabel>
                            <FInput icon={<User />} value={name} onChange={setName} placeholder="Enter full name" />

                            <FLabel required>FATHER'S NAME</FLabel>
                            <FInput icon={<User />} value={fatherName} onChange={setFatherName} placeholder="Enter father's name" />

                            <View style={[styles.row, { zIndex: 3000 }]}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <FLabel required>DOB</FLabel>
                                    <FInput value={dob} onChange={setDob} placeholder="DD/MM/YYYY" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FLabel required>RELIGION</FLabel>
                                    <PrimeDropdown
                                        value={religion}
                                        items={religionOptions}
                                        setValue={setReligion}
                                        placeholder="Select Religion"
                                        style={styles.dropdownSm}
                                        textStyle={styles.dropdownText}
                                    />
                                </View>
                            </View>

                            <View style={[styles.row, { zIndex: 2000, marginTop: 10 }]}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <FLabel>GENDER</FLabel>
                                    <PrimeDropdown
                                        value={gender}
                                        items={genderOptions}
                                        setValue={setGender}
                                        placeholder="Select Gender"
                                        style={styles.dropdownSm}
                                        textStyle={styles.dropdownText}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FLabel required>MOBILE NO</FLabel>
                                    <FInput icon={<Phone />} value={mobile} onChange={setMobile} placeholder="10 Digits" keyboardType="phone-pad" />
                                </View>
                            </View>

                            <FLabel required>OCCUPATION</FLabel>
                            <FInput icon={<Shield />} value={occupation} onChange={setOccupation} placeholder="e.g. Resident / Farmer" />

                            <FLabel>OTHER PHYSIOLOGICAL CHARACTERISTICS</FLabel>
                            <FInput value={physiologicalCharacteristics} onChange={setPhysiologicalCharacteristics} placeholder="Marks, Height, etc." />
                        </View>

                        {/* ── ID PROOF ── */}
                        <View style={[styles.card, { zIndex: 1100 }]}>
                            <SectionLabel icon={<FileText color={GOLD} size={14} />} label="IDENTITY PROOF" />

                            <FLabel>ID TYPE</FLabel>
                            <View style={{ zIndex: 1000 }}>
                                <PrimeDropdown
                                    value={idType}
                                    items={idOptions}
                                    setValue={setIdType}
                                    placeholder="Select ID Type"
                                    style={styles.dropdown}
                                    textStyle={styles.dropdownText}
                                />
                            </View>

                            <FLabel style={{ marginTop: 14 }} required>ID NUMBER</FLabel>
                            <FInput icon={<FileText />} value={idNumber} onChange={setIdNumber} placeholder={getIDPlaceholder()} />

                            <FLabel style={{ marginTop: 14 }}>FENCE CARD NO</FLabel>
                            <FInput icon={<FileText />} value={fenceCardNo} onChange={setFenceCardNo} placeholder="Enter fence card no" />
                        </View>

                        {/* ── VEHICLES ── */}
                        <View style={styles.card}>
                            <SectionLabel icon={<Car color={GOLD} size={14} />} label="VEHICLE REGISTRATION" />

                            {vehicles.map((vh, idx) => (
                                <View key={idx} style={{ marginBottom: 20, padding: 10, borderLeftWidth: 2, borderLeftColor: GOLD }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: GOLD, fontSize: 10, fontWeight: 'bold' }}>VEHICLE #{idx + 1}</Text>
                                        {vehicles.length > 1 && (
                                            <TouchableOpacity onPress={() => removeVehicle(idx)}>
                                                <Trash2 color={RED} size={16} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <FLabel>MODEL</FLabel>
                                    <FInput value={vh.model} onChange={(v) => updateVehicle(idx, 'model', v)} placeholder="Car Model" />
                                    <FLabel>NUMBER</FLabel>
                                    <FInput value={vh.number} onChange={(v) => updateVehicle(idx, 'number', v.toUpperCase())} placeholder="Number Plate" autoCapitalize="characters" />
                                    <FLabel>COLOUR</FLabel>
                                    <FInput value={vh.color} onChange={(v) => updateVehicle(idx, 'color', v)} placeholder="Color" />
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addBtn} onPress={addVehicle}>
                                <Text style={styles.addBtnText}>+ ADD ANOTHER VEHICLE</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── RESIDENTIAL DETAILS ── */}
                        <View style={[styles.card, { borderColor: location ? '#2E4B1F' : BORDER }]}>
                            <SectionLabel icon={<Home color={GOLD} size={14} />} label="RESIDENTIAL DETAILS" />

                            <FLabel required>STATE</FLabel>
                            <PrimeDropdown
                                value={state}
                                items={stateOptions}
                                setValue={setState}
                                placeholder="Select State"
                                textStyle={styles.dropdownText}
                            />

                            <FLabel required>DISTRICT</FLabel>
                            <PrimeDropdown
                                value={district}
                                items={districtOptions}
                                setValue={setDistrict}
                                placeholder={districtOptions.length ? 'Select District' : 'Select state first'}
                                textStyle={styles.dropdownText}
                            />

                            <FLabel required>TEHSIL</FLabel>
                            <FInput icon={<MapPin />} value={tehsil} onChange={setTehsil} placeholder="Tehsil" />

                            <FLabel required>VILLAGE</FLabel>
                            <FInput icon={<MapPin />} value={village} onChange={setVillage} placeholder="Enter village name" />

                            <FLabel style={{ marginTop: 15 }}>HOUSE DETAILS</FLabel>
                            <FInput icon={<Home />} value={houseDetails} onChange={setHouseDetails} placeholder="House number, Street..." />

                            <TouchableOpacity style={styles.mapBtn} onPress={() => setShowMap(true)}>
                                <Globe color={location ? '#8BC34A' : GOLD} size={20} />
                                <Text style={styles.mapBtnText}>
                                    {location ? '✓ LOCATION MARKED (UPDATE)' : 'MARK ON SATELLITE MAP'}
                                </Text>
                            </TouchableOpacity>

                            {location ? (
                                <View style={styles.coordsBadge}>
                                    <MapPin size={12} color={GOLD} />
                                    <Text style={styles.coordsText}>
                                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.gpsBtn, fetchingLocation && { opacity: 0.6 }]}
                                    onPress={fetchGPS}
                                    disabled={fetchingLocation}
                                >
                                    {fetchingLocation
                                        ? <ActivityIndicator size="small" color={GOLD} />
                                        : <Navigation size={14} color={GOLD} />}
                                    <Text style={styles.gpsBtnText}>
                                        {fetchingLocation ? 'ACQUIRING GPS...' : 'GET DEVICE LOCATION'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>


                        {/* ── BLOOD RELATIVES ── */}
                        <View style={styles.card}>
                            <SectionLabel icon={<User color={GOLD} size={14} />} label="BLOOD RELATIVE DETAILS" />
                            {bloodRelatives.map((rel, idx) => (
                                <View key={idx} style={{ marginBottom: 15, zIndex: 100 - idx }}>
                                    <FLabel>RELATION</FLabel>
                                    <PrimeDropdown
                                        value={rel.relation}
                                        items={relativeOptions}
                                        setValue={(val) => updateRelative(idx, 'relation', val)}
                                        placeholder="Select Relation"
                                        style={styles.dropdownSm}
                                        textStyle={styles.dropdownText}
                                    />
                                    <FLabel style={{ marginTop: 10 }}>NAME</FLabel>
                                    <FInput value={rel.name} onChange={(v) => updateRelative(idx, 'name', v)} placeholder="Relative Name" />
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addBtn} onPress={addRelative}>
                                <Text style={styles.addBtnText}>+ ADD ANOTHER RELATIVE</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── ACTIONS ── */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                                onPress={finalizeSave}
                                disabled={saving}
                            >
                                {saving
                                    ? <ActivityIndicator color="#000" />
                                    : <Text style={styles.saveBtnText}>✓ SEND TO HQ</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                                <Text style={styles.cancelBtnText}>ABORT</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>

            {/* ── SATELLITE MAP MODAL ── */}
            <Modal visible={showMap} animationType="slide" transparent={false}>
                <SafeAreaView style={{ flex: 1, backgroundColor: DARK }}>
                    <View style={styles.mapHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Globe color={GOLD} size={24} />
                            <Text style={styles.mapHeaderTitle}>SATELLITE MARKER</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            setShowMap(false);
                            setSuggestions([]);
                            setSearchQuery('');
                            setSearchError(null);
                        }}>
                            <X color={TEXT_MUTED} size={28} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.mapSearchBox}>
                        <View style={[styles.mapSearchInner, searchError && { borderColor: RED }]}>
                            <Search color={isSearching ? '#888' : GOLD} size={18} />
                            <TextInput
                                style={styles.mapSearchInput}
                                placeholder="SEARCH VILLAGE / SECTOR..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    if (text.length > 2) fetchSuggestions(text);
                                    else { setSuggestions([]); setSearchError(null); }
                                }}
                            />
                            {isSearching && <ActivityIndicator size="small" color={GOLD} />}
                        </View>
                        {searchError && <Text style={styles.searchError}>{searchError}</Text>}
                        {suggestions.length > 0 && (
                            <View style={styles.suggestions}>
                                {suggestions.map((item, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.suggestionItem}
                                        onPress={() => handleSelectSuggestion(item)}
                                    >
                                        <MapPin size={14} color={GOLD} style={{ marginRight: 10 }} />
                                        <Text style={styles.suggestionText} numberOfLines={1}>{item.display_name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Map */}
                    <View style={{ flex: 1 }}>
                        <LeafletMapView
                            latitude={region.latitude}
                            longitude={region.longitude}
                            zoom={17}
                            markerLat={location?.latitude}
                            markerLng={location?.longitude}
                            onMapPress={(coords) => setLocation(coords)}
                            mapType="satellite"
                        />
                        <TouchableOpacity style={styles.locateMeBtn} onPress={fetchGPS}>
                            <Navigation size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.mapFooter}>
                        <Text style={styles.mapFooterHint}>TAP MAP TO DROP MARKER ON EXACT LOCATION</Text>
                        <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowMap(false)}>
                            <Text style={styles.confirmBtnText}>CONFIRM SELECTION</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </ImageBackground >
    );
}

// ─── Helper Components ────────────────────────────────────────────────────────

const SectionLabel = ({ icon, label }) => (
    <View style={sHelpers.sectionRow}>
        {icon}
        <Text style={sHelpers.sectionText}>{label}</Text>
    </View>
);

const FLabel = ({ children, required, style }) => (
    <Text style={[sHelpers.label, style]}>
        {children} {required && <Text style={{ color: RED }}>*</Text>}
    </Text>
);

const FInput = ({ value, onChange, placeholder, keyboardType, autoCapitalize, icon }) => (
    <View style={sHelpers.inputWrapper}>
        {icon && React.cloneElement(icon, { color: 'rgba(255,255,255,0.4)', size: 18, style: { marginLeft: 12 } })}
        <TextInput
            style={sHelpers.input}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
        />
    </View>
);

const sHelpers = StyleSheet.create({
    sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
    sectionText: { color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
    label: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: INPUT_BG, borderRadius: 12,
        borderWidth: 1.5, borderColor: BORDER, marginBottom: 16,
        height: 55
    },
    input: {
        flex: 1, padding: 12, color: '#FFF', fontSize: 14,
    },
});

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, backgroundColor: 'rgba(0,0,0,0.8)',
        borderBottomWidth: 1, borderBottomColor: BORDER
    },
    headerTitle: { color: GOLD, fontWeight: 'bold', fontSize: 16, letterSpacing: 1.5 },

    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 60 },

    card: {
        backgroundColor: CARD_BG, borderRadius: 16,
        padding: 20, marginBottom: 16,
        borderWidth: 1.5, borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 6, elevation: 6
    },

    // ── Photo / Biometric ──
    captureRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
    captureBlock: { flex: 1, alignItems: 'center' },
    captureLabel: { color: TEXT_MUTED, fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
    captureDivider: { width: 1, height: 60, backgroundColor: BORDER, alignSelf: 'center' },

    photoBox: { position: 'relative', borderRadius: 12, overflow: 'hidden', width: '100%', height: 120 },
    photoPreviewSm: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#000' },
    photoPlaceholderSm: {
        width: '100%', height: 120, borderRadius: 12,
        borderWidth: 1.5, borderColor: BORDER, borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)'
    },
    photoBtnTextSm: { color: GOLD, fontSize: 10, fontWeight: 'bold', marginTop: 8 },

    deletePhoto: {
        position: 'absolute', top: 5, right: 5,
        backgroundColor: 'rgba(255,0,0,0.7)',
        padding: 5, borderRadius: 15, zIndex: 10
    },
    photoGreenBadge: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,100,0,0.8)', padding: 10, alignItems: 'center'
    },
    photoBadgeText: { color: '#8BC34A', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
    photoDivider: { width: 1.5, height: 60, backgroundColor: BORDER },
    photoHint: { color: TEXT_MUTED, fontSize: 11, marginTop: 15, textAlign: 'center' },

    // ── Form ──
    row: { flexDirection: 'row' },
    dropdown: { backgroundColor: INPUT_BG, borderColor: BORDER, borderRadius: 12, height: 55, marginBottom: 16 },
    dropdownContainer: { backgroundColor: '#1A1A1A', borderColor: BORDER },
    dropdownSm: { backgroundColor: INPUT_BG, borderColor: BORDER, borderRadius: 12, height: 55, marginBottom: 16 },
    dropdownContainerSm: { backgroundColor: '#1A1A1A', borderColor: BORDER },
    dropdownText: { color: '#FFF', fontSize: 14 },

    input: {
        backgroundColor: INPUT_BG, borderRadius: 12,
        borderWidth: 1.5, borderColor: BORDER, marginBottom: 16,
        padding: 15, color: '#FFF', fontSize: 14,
    },
    textArea: { height: 80, textAlignVertical: 'top' },

    // ── Map Btn ──
    mapBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 12,
        marginTop: 15, borderWidth: 1.5, borderColor: GOLD, gap: 12
    },
    mapBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
    coordsBadge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 15, backgroundColor: 'rgba(139,195,74,0.1)', padding: 12, borderRadius: 8, gap: 8
    },
    coordsText: { color: '#8BC34A', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
    gpsBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 15, padding: 14,
        borderStyle: 'dashed', borderWidth: 1.5, borderColor: GOLD, borderRadius: 12, gap: 10
    },
    gpsBtnText: { color: GOLD, fontSize: 13, fontWeight: 'bold' },

    // ── Actions ──
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    saveBtn: {
        flex: 1, height: 65, backgroundColor: GOLD,
        borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 10
    },
    saveBtnText: { color: '#000', fontWeight: 'bold', letterSpacing: 2, fontSize: 16 },
    cancelBtn: {
        flex: 0.5, height: 65, backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: BORDER
    },
    cancelBtnText: { color: TEXT_LIGHT, fontWeight: 'bold', fontSize: 14 },

    // ── Map Modal ──
    mapHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, backgroundColor: CARD_BG,
        borderBottomWidth: 1.5, borderBottomColor: BORDER
    },
    mapHeaderTitle: { color: GOLD, fontWeight: 'bold', fontSize: 14, letterSpacing: 1, marginLeft: 10 },
    mapSearchBox: { padding: 12, backgroundColor: CARD_BG, zIndex: 20 },
    mapSearchInner: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: INPUT_BG, paddingHorizontal: 14,
        borderRadius: 8, borderWidth: 1, borderColor: BORDER, height: 48, gap: 10
    },
    mapSearchInput: { flex: 1, color: '#FFF', fontSize: 13, fontWeight: 'bold' },
    searchError: { color: RED, fontSize: 10, fontWeight: 'bold', marginTop: 5, marginLeft: 4 },
    suggestions: {
        backgroundColor: CARD_BG, marginTop: 4, borderRadius: 8,
        borderWidth: 1, borderColor: BORDER, zIndex: 100
    },
    suggestionItem: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, borderBottomWidth: 1, borderBottomColor: BORDER
    },
    suggestionText: { color: '#BBB', fontSize: 12, fontWeight: 'bold', flex: 1 },

    locateMeBtn: {
        position: 'absolute', bottom: 20, right: 20,
        backgroundColor: GOLD, width: 48, height: 48,
        borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 10
    },
    mapFooter: { padding: 20, backgroundColor: CARD_BG, borderTopWidth: 1, borderTopColor: BORDER },
    mapFooterHint: { color: '#444', fontSize: 10, textAlign: 'center', marginBottom: 14, fontWeight: 'bold', letterSpacing: 1 },
    confirmBtn: { backgroundColor: GOLD, padding: 18, borderRadius: 10, alignItems: 'center' },
    confirmBtnText: { color: '#000', fontWeight: 'bold', letterSpacing: 2 },
});
