# Academic/Personal Details Form - Developer Documentation

## 🎯 Overview
Enhanced form in `PersonalInfo.tsx` with comprehensive validation, dropdown selects, and real-time error handling.

## 📦 Dropdown Constants

```typescript
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MOTHER_TONGUES = ['Tamil', 'English', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Odia', 'Assamese', 'Other'];
const RELIGIONS = ['Hindu', 'Christian', 'Muslim', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST'];
const RESIDENCE_TYPES = ['Hosteler', 'Day Scholar'];
const NATIONALITIES = ['Indian', 'Other'];
```

## 🔍 Validation Rules

### Contact Section
```javascript
Email:
- Required
- Must match email format (^[^\s@]+@[^\s@]+\.[^\s@]+$)

Phone:
- Required
- Exactly 10 digits

Alternate Phone:
- Optional
- If provided, must be exactly 10 digits

LinkedIn URL:
- Optional
- If provided, must start with http/https
```

### Academic Section
```javascript
Date of Birth:
- Required
- Must result in age between 15-40 years

Blood Group:
- Required
- Must select from dropdown

Mother Tongue:
- Required
- Must select from dropdown

Nationality:
- Required
- Must select from dropdown

Religion:
- Required
- Must select from dropdown

Category:
- Required
- Must select from dropdown

Residence Type:
- Required
- Must select from dropdown
```

### Address Section
```javascript
Street Address:
- Required
- Any length

City:
- Required
- Any length

State:
- Required
- Any length

Pincode:
- Required
- Exactly 6 digits
```

## 🎨 UI Components Used

### Select (Dropdown)
```tsx
<Select 
  value={formValues.fieldName || ''} 
  onValueChange={(value) => setFormValues((prev) => ({ ...prev, fieldName: value }))}
>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    {OPTIONS.map(opt => (
      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Input (Text Field)
```tsx
<Input 
  value={formValues.fieldName || ''} 
  onChange={(e) => setFormValues((prev) => ({ ...prev, fieldName: e.target.value }))}
  placeholder="Placeholder text"
  className={formErrors.fieldName ? 'border-destructive' : ''}
/>
```

### Error Display
```tsx
{formErrors.fieldName && (
  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" />
    {formErrors.fieldName}
  </p>
)}
```

## 🔧 Key Functions

### validateForm()
Validates entire form based on current editSection
- Returns: `boolean` (true if valid, false if errors)
- Side effects: Sets `formErrors` state and shows `showValidationAlert`

### handleSave()
1. Checks if editSection exists
2. Calls `validateForm()`
3. If invalid, return early (prevent submission)
4. If valid, proceed with API call

### handleEditClick(section)
1. Sets formValues from personalData
2. Sets editSection
3. Clears formErrors
4. Hides validation alert

### closeEditDialog()
1. Clears editSection
2. Clears formErrors
3. Hides validation alert

## 🚀 Adding New Fields

To add a new field to the form:

1. **Add to defaultPersonalData:**
```typescript
const defaultPersonalData = {
  // ... existing fields
  newField: '',
};
```

2. **Add to validation (if needed):**
```typescript
if (editSection === 'academic') {
  if (!formValues.newField) errors.newField = 'Field is required';
}
```

3. **Add to form JSX:**
```tsx
<div>
  <Label className={formErrors.newField ? 'text-destructive' : ''}>
    New Field {formErrors.newField && <span className="text-destructive">*</span>}
  </Label>
  <Input 
    value={formValues.newField || ''} 
    onChange={(e) => setFormValues((prev) => ({ ...prev, newField: e.target.value }))}
    className={formErrors.newField ? 'border-destructive' : ''}
  />
  {formErrors.newField && <p className="text-xs text-destructive mt-1"><AlertCircle className="w-3 h-3" />{formErrors.newField}</p>}
</div>
```

4. **Add to payload in handleSave():**
```typescript
if (editSection === 'academic') {
  payload.newField = formValues.newField;
}
```

## 📊 State Management

```typescript
// Form data displayed on profile
personalData: {
  email: '',
  phone: '',
  // ... all fields
}

// Current values in edit form
formValues: {
  email: '',
  phone: '',
  // ... all fields
}

// Validation errors
formErrors: {
  [fieldName]: 'Error message'
}

// UI states
editSection: 'contact' | 'academic' | 'address' | null
showValidationAlert: boolean
saving: boolean
loading: boolean
```

## 🔄 Data Flow

1. **Load Profile**: `getMyProfile()` API call → `personalData` set
2. **Open Edit**: `handleEditClick()` → `formValues` = `personalData`, `editSection` set
3. **User Edits**: `onChange` handlers → `formValues` updated
4. **Submit Press**: `handleSave()` → `validateForm()` check
5. **Valid**: `updateMyProfile()` API call → `personalData` updated
6. **Invalid**: Show validation alert with errors
7. **Close Dialog**: `closeEditDialog()` → Clear state

## ⚠️ Error Handling

- API errors shown via toast notification
- Validation errors shown inline and in alert panel
- Both destructive variant for clear visibility
- AlertCircle icon for immediate recognition
- Descriptive messages guiding user to fix

## 📱 Responsive Design

- Form uses grid layout with responsive spacing
- Dialog has max-width: sm (640px)
- Mobile-friendly with single column stack

## 🎯 Best Practices

1. Always validate before submission
2. Show all errors at once (not field by field)
3. Highlight invalid fields with visual cues
4. Provide actionable error messages
5. Disable submit while saving
6. Clear errors when opening form
7. Use consistent error styling (destructive color)

---

**Last Updated**: March 24, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
