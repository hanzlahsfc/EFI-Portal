export function cleanEmail(value: FormDataEntryValue | null) {
  const email = String(value ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function cleanName(value: FormDataEntryValue | null) {
  const name = String(value ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 80) return null;
  return name;
}

export function cleanPhone(value: FormDataEntryValue | null) {
  const phone = String(value ?? "").trim();
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return phone;
}

export function cleanCnic(value: FormDataEntryValue | null) {
  const cnic = String(value ?? "").trim();
  if (!cnic) return "";
  if (cnic.replace(/\D/g, "").length !== 13) return null;
  return cnic;
}

export function cleanPassword(value: FormDataEntryValue | null) {
  const password = String(value ?? "");
  if (password.length < 8 || password.length > 80) return null;
  return password;
}
