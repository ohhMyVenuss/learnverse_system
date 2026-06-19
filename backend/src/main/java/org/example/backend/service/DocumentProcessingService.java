package org.example.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class DocumentProcessingService {

    public String extractTextFromPdf(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        PDDocument document = Loader.loadPDF(bytes);
        try {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } finally {
            document.close();
        }
    }

    public String extractTextFromWord(MultipartFile file) throws IOException {
        XWPFDocument document = new XWPFDocument(file.getInputStream());
        try {
            XWPFWordExtractor extractor = new XWPFWordExtractor(document);
            try {
                return extractor.getText();
            } finally {
                extractor.close();
            }
        } finally {
            document.close();
        }
    }

    public String processDocument(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("File name is null");
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        return switch (extension) {
            case "pdf" -> extractTextFromPdf(file);
            case "docx", "doc" -> extractTextFromWord(file);
            default -> throw new IllegalArgumentException("Unsupported file type: " + extension);
        };
    }

    public String getFileType(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return "UNKNOWN";
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        return extension.toUpperCase();
    }
    // text = "hahahahahahhahaaaaaaaaa"
//    -> JSon
    // tooi muoons
//    {
//        tien: 5 trieu
//    }
}

