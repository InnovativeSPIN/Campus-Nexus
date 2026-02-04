export interface StudentBasicInfo {
  name: string;
  admissionNumber: string;
  rollNumber: string;
  registerNumber: string;
  fullName: string;
  department: string;
  year: "2nd" | "3rd" | "Final";
  semester: string;
  section: string;
  batch: string;
  admissionDate: string;
  natureOfResidence: string;
}

export interface StudentPersonalInfo {
  dob: string;
  gender: string;
  bloodGroup: string;
  motherTongue: string;
  email: string;
  linkedin: string;
  mobile: string;
  alternateMobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  nationality: string;
  religion: string;
  category: string;
  aadharNumber: string;
}

export interface Sibling {
  id: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  schoolCollege: string;
  classOrCourse: string;
  occupation: string;
}

export interface ParentInfo {
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  guardianName?: string;
  guardianOccupation?: string;
  guardianPhone?: string;
  siblings: Sibling[];
}

export interface ReferenceInfo {
  name: string;
  phone: string;
  address: string;
  occupation: string;
}

export interface StudentPhotos {
  studentPhoto: string;
  familyPhoto: string;
}

export interface StudentProfile {
  id: string;
  basicInfo: StudentBasicInfo;
  personalInfo: StudentPersonalInfo;
  parentInfo: ParentInfo;
  referenceInfo: ReferenceInfo;
  photos: StudentPhotos;
  pendingChanges: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    status: "pending" | "approved" | "rejected";
  }>;
}

const departments = ["CSE", "ECE", "IT", "AI&DS", "MECH", "CIVIL"];
const indianNames = [
  { first: "Arun", last: "Kumar" },
  { first: "Priya", last: "Devi" },
  { first: "Karthik", last: "R" },
  { first: "Anjali", last: "Singh" },
  { first: "Rohan", last: "Verma" },
  { first: "Divya", last: "Sharma" },
  { first: "Arjun", last: "Patel" },
  { first: "Neha", last: "Gupta" },
  { first: "Vikram", last: "Nair" },
  { first: "Pooja", last: "Iyer" },
];

const cities = ["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Pune", "Coimbatore", "Madurai", "Salem", "Tiruppur"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const religions = ["Hindu", "Christian", "Muslim", "Sikh", "Buddhist"];
const categories = ["General", "OBC", "SC", "ST"];

function generateStudents(year: "2nd" | "3rd" | "Final", startIndex: number): StudentProfile[] {
  const students: StudentProfile[] = [];
  const yearNum = year === "2nd" ? 2 : year === "3rd" ? 3 : 4;

  for (let i = 0; i < 10; i++) {
    const nameIndex = (startIndex + i) % indianNames.length;
    const name = indianNames[nameIndex];
    const dept = departments[i % departments.length];
    const id = `S${String(startIndex + i + 1).padStart(3, "0")}`;
    const dob = `${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${2000 + Math.floor(Math.random() * 5)}`;

    students.push({
      id,
      basicInfo: {
        name: `${name.first} ${name.last}`,
        admissionNumber: `${dept}${yearNum}${String(i + 1).padStart(3, "0")}`,
        rollNumber: `${String(yearNum)}.${String(i + 1).padStart(2, "0")}`,
        registerNumber: `REG${yearNum}${String(startIndex + i + 1).padStart(4, "0")}`,
        fullName: `${name.first} ${name.last}`,
        department: dept,
        year,
        semester: String(yearNum * 2 - (Math.random() > 0.5 ? 1 : 0)),
        section: String.fromCharCode(65 + (i % 3)),
        batch: `20${21 - yearNum}`,
        admissionDate: `${20 + Math.floor(Math.random() * 4)}-08-15`,
        natureOfResidence: Math.random() > 0.5 ? "Day Scholar" : "Hosteller",
      },
      personalInfo: {
        dob,
        gender: Math.random() > 0.5 ? "Male" : "Female",
        bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        motherTongue: "Tamil",
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@university.ac.in`,
        linkedin: `linkedin.com/in/${name.first.toLowerCase()}${name.last.toLowerCase()}`,
        mobile: `+91${String(Math.floor(Math.random() * 9000000000) + 6000000000)}`,
        alternateMobile: `+91${String(Math.floor(Math.random() * 9000000000) + 6000000000)}`,
        address: `${String(Math.floor(Math.random() * 500) + 1)}, ${cities[Math.floor(Math.random() * cities.length)]} Main Street`,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: "Tamil Nadu",
        pincode: `${String(Math.floor(Math.random() * 90000) + 600000)}`,
        nationality: "Indian",
        religion: religions[Math.floor(Math.random() * religions.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        aadharNumber: `${String(Math.floor(Math.random() * 1000000000000)).padStart(12, "0")}`,
      },
      parentInfo: {
        fatherName: `${name.first} Senior`,
        fatherOccupation: ["Engineer", "Doctor", "Business Owner", "Teacher", "Government Officer"][Math.floor(Math.random() * 5)],
        fatherPhone: `+91${String(Math.floor(Math.random() * 9000000000) + 6000000000)}`,
        motherName: `${name.first}'s Mother`,
        motherOccupation: ["Housewife", "Teacher", "Nurse", "Business Owner"][Math.floor(Math.random() * 4)],
        motherPhone: `+91${String(Math.floor(Math.random() * 9000000000) + 6000000000)}`,
        siblings: Array.from({ length: Math.floor(Math.random() * 3) }, (_, sibIdx) => {
          const sibName = indianNames[Math.floor(Math.random() * indianNames.length)];
          return {
            id: `sib-${i}-${sibIdx}`,
            name: `${sibName.first} ${sibName.last}`,
            age: String(Math.floor(Math.random() * 10) + 15),
            phone: `+91${String(Math.floor(Math.random() * 9000000000) + 6000000000)}`,
            email: `${sibName.first.toLowerCase()}.${sibName.last.toLowerCase()}@email.com`,
            schoolCollege: ["DPS School", "St. Mary's School", "Cambridge College", "Oxford Institute"][Math.floor(Math.random() * 4)],
            classOrCourse: ["10th", "12th", "B.Tech", "M.Sc"][Math.floor(Math.random() * 4)],
            occupation: Math.random() > 0.6 ? "Student" : ["Freelancer", "Software Developer", "Consultant"][Math.floor(Math.random() * 3)],
          };
        }),
      },
      referenceInfo: {
        name: "Prof. " + (Math.random() > 0.5 ? "Dr. Ramesh Kumar" : "Dr. Priya Sharma"),
        phone: `+91${String(Math.floor(Math.random() * 9000000000) + 6000000000)}`,
        address: "Department Office, University Campus",
        occupation: "Faculty Reference",
      },
      photos: {
        studentPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + id,
        familyPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + id + "family",
      },
      pendingChanges: [],
    });
  }

  return students;
}

export const menteeStudents: StudentProfile[] = [
  ...generateStudents("2nd", 0),
  ...generateStudents("3rd", 10),
  ...generateStudents("Final", 20),
];

export function getStudentsByYear(year: "2nd" | "3rd" | "Final"): StudentProfile[] {
  return menteeStudents.filter((s) => s.basicInfo.year === year);
}

export function getStudentById(id: string): StudentProfile | undefined {
  return menteeStudents.find((s) => s.id === id);
}
