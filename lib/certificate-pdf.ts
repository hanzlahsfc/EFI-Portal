import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import type { Certificate } from "@/lib/types";

const red = rgb(0.757, 0.067, 0.086);
const asphalt = rgb(0.082, 0.09, 0.106);
const muted = rgb(0.361, 0.38, 0.408);

function drawCentered(page: PDFPage, text: string, y: number, size: number, font: PDFFont, color = asphalt) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

function fitSize(text: string, font: PDFFont, maxWidth: number, start: number) {
  let size = start;
  while (size > 16 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

export async function renderCertificate(cert: Certificate) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const page = pdf.addPage([841.89, 595.28]);
  const width = page.getWidth();
  const height = page.getHeight();
  const display = await pdf.embedFont(fs.readFileSync(path.join(process.cwd(), "assets/fonts/barlow-condensed-bold.ttf")));
  const body = await pdf.embedFont(fs.readFileSync(path.join(process.cwd(), "assets/fonts/barlow-regular.ttf")));
  const logo = await pdf.embedPng(fs.readFileSync(path.join(process.cwd(), "public/brand/efi-logo.png")));

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 16, y: 16, width: width - 32, height: height - 32, borderColor: asphalt, borderWidth: 3 });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: red, borderWidth: 1.25 });

  const logoWidth = 92;
  const logoHeight = logoWidth * (logo.height / logo.width);
  page.drawImage(logo, { x: (width - logoWidth) / 2, y: height - 36 - logoHeight, width: logoWidth, height: logoHeight });

  drawCentered(page, "EFI FUTURE INTELLIGENCE INSTITUTE", height - 168, 16, display);
  drawCentered(page, "CERTIFICATE OF COMPLETION", height - 214, 34, display, red);
  drawCentered(page, "This certifies that", height - 252, 13, body, muted);

  const name = cert.studentName.toUpperCase();
  drawCentered(page, name, height - 304, fitSize(name, display, 640, 42), display);
  drawCentered(page, "has completed the lab course", height - 338, 13, body, muted);

  const course = cert.courseName.toUpperCase();
  drawCentered(page, course, height - 378, fitSize(course, display, 640, 26), display);

  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(cert.issuedAt));
  drawCentered(page, `${cert.rollNumber}    ·    ${date}    ·    Lahore`, height - 424, 13, body, muted);
  drawCentered(page, cert.serial, height - 456, 14, display, red);
  drawCentered(page, "53B, Aitchison Society, Lahore", 46, 11, body, muted);

  return pdf.save();
}
