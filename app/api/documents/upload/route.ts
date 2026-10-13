import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { documentsStore, DocumentRecord } from "@/agents/store";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const patientId = (formData.get("patient_id") as string) || "demo-patient-001";
    const consultationId = (formData.get("consultation_id") as string) || "c-demo-default";
    const consentGiven = formData.get("consent_given");
    const sampleType = formData.get("sample_type") as string | null;

    // 1. Consent Verification (Requirement 2: require consent to be given)
    const isConsentValid =
      consentGiven === "true" ||
      formData.get("consent") === "true";

    if (!isConsentValid) {
      return NextResponse.json(
        {
          error:
            "Patient consent is required before uploading and processing medical documents. Please ensure clinical consent is verified.",
        },
        { status: 403 }
      );
    }

    // 2. File Presence & Validation
    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded. Please attach a valid prescription, report, or discharge summary." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds the 10 MB limit (File size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).` },
        { status: 400 }
      );
    }

    const mimeType = file.type || "image/jpeg";
    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload JPG, PNG, WEBP, or PDF documents." },
        { status: 400 }
      );
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const storagePath = `${patientId}/${consultationId}/${Date.now()}-${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload to private Supabase Storage bucket "medical-docs"
    let uploadedToSupabase = false;
    let signedUrl: string | null = null;

    try {
      const supabase = createAdminClient();
      const { error: uploadError } = await supabase.storage
        .from("medical-docs")
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError) {
        uploadedToSupabase = true;
        const { data: signData } = await supabase.storage
          .from("medical-docs")
          .createSignedUrl(storagePath, 3600);
        signedUrl = signData?.signedUrl || null;
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload warning (using resilient fallback store):", storageErr);
    }

    // Fallback URL if using public sample or local fallback
    let publicUrl = signedUrl;
    if (!publicUrl && sampleType) {
      publicUrl = `/samples/sample-${sampleType === "cbc" ? "cbc-report" : sampleType === "discharge" ? "discharge-summary" : sampleType === "hba1c" ? "hba1c-report" : "prescription"}.jpg`;
    } else if (!publicUrl) {
      // Data URL for preview if offline
      publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    // 4. Create row in documents with status 'uploaded'
    const docRecord: DocumentRecord = {
      id: docId,
      consultation_id: consultationId,
      patient_id: patientId,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: mimeType,
      ocr_text: null,
      extracted: null,
      status: "uploaded",
      confidence: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      public_url: publicUrl,
    };

    // Store in process fallback store
    documentsStore.saveDocument(docRecord);

    // Attempt remote Supabase DB write
    try {
      const supabase = createAdminClient();
      await supabase.from("documents").insert({
        id: docId,
        consultation_id: consultationId,
        patient_id: patientId,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: mimeType,
        status: "uploaded",
        confidence: null,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: mimeType,
        size_bytes: file.size,
        status: "uploaded",
        public_url: publicUrl,
        uploaded_to_storage: uploadedToSupabase,
      },
    });
  } catch (error: unknown) {
    console.error("[POST /api/documents/upload] Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}
