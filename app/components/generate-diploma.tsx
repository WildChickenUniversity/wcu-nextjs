import { PDFDocument, StandardFonts, PDFFont, PDFField } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import downloadPDF from './download-pdf';

type DiplomaProps = {
  username: string;
  major: string;
  degree: string;
};

async function generateDiploma({ username, major, degree }: DiplomaProps) {
  // Fetch the PDF with form fields
  const formUrl = '/template_diploma.pdf';
  // const formUrl = "https://raw.githubusercontent.com/WildChickenUniversity/WildChickenUniversity/master/assets/template_diploma.pdf"
  const englishUnicode = /^[0-9a-zA-Z\s]+$/;
  const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  // Copyright (c) 2018, Fredrick R. Brennan (<copypaste@kittens.ph>)
  // https://github.com/ctrlcctrlv/chomsky, licensed under  OFL-1.1
  const chomskyFontUrl = '/fonts/Chomsky.otf';
  const chomskyFontByte = await fetch(chomskyFontUrl).then((res) =>
    res.arrayBuffer()
  );

  const chomskyFont = await pdfDoc.embedFont(chomskyFontByte);

  // Google Noto Serif Simplified Chinese 900
  const sourceHanSerifUrl =
    'fonts/noto-serif-sc-v16-chinese-simplified-900.ttf';
  const sourceHanSerifByte = await fetch(sourceHanSerifUrl).then((res) =>
    res.arrayBuffer()
  );

  const sourceHanSerif = await pdfDoc.embedFont(sourceHanSerifByte);

  // Get the form containing all the fields
  const form = pdfDoc.getForm();
  // Get all fields in the PDF by their names
  const majorField = form.getTextField('major');
  const majorLen = major.length;
  const nameField = form.getTextField('name');
  const degreeField = form.getTextField('degree');

  // idiot-proof
  // just please don't enter a super long major name :)
  const widthMajorField = 450;
  const widthDegreeField = 450;
  const widthNameField = 350;

  // Calculate expected widths based on a hypothetical average character width
  const averageCharWidth = 25; // Adjusted for a more reasonable average width per character
  const widthMajor = major.length * averageCharWidth;
  const widthName = username.length * averageCharWidth;
  const widthDegree = degree.length * averageCharWidth;

  // Adjust font size for 'major' field if necessary
  if (widthMajorField < widthMajor) {
    console.log('Major field too small');
    let fontSizeMajor = widthMajorField / major.length;
    majorField.setFontSize(fontSizeMajor); // Adjust the major field's font size
  }

  // Adjust font size for 'name' field if necessary
  if (widthNameField < widthName) {
    console.log('Name field too small');
    let fontSizeName = widthNameField / username.length; // Corrected to use username.length
    nameField.setFontSize(fontSizeName); // Adjust the name field's font size
  }

  // Adjust font size for 'degree' field if necessary
  if (widthDegreeField < widthDegree) {
    console.log('Degree field too small');
    let fontSizeDegree = widthDegreeField / degree.length;
    degreeField.setFontSize(fontSizeDegree); // Adjust the degree field's font size
  }

  // Fill in the name field
  majorField.setText(major);
  nameField.setText(username);
  degreeField.setText(degree);

  majorField.updateAppearances(
    englishUnicode.test(major) ? chomskyFont : sourceHanSerif
  );
  nameField.updateAppearances(
    englishUnicode.test(username) ? chomskyFont : sourceHanSerif
  );
  degreeField.updateAppearances(
    englishUnicode.test(degree) ? chomskyFont : sourceHanSerif
  );

  // Flatten the form fields
  form.flatten();
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  // Trigger the browser to download the PDF document
  downloadPDF(pdfBytes, `WCU_Diploma_${username.split(' ').join('_')}.pdf`);
}

export default generateDiploma;
