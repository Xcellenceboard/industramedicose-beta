import { NextRequest, NextResponse } from "next/server";
import { documentsStore, DocumentRecord } from "@/agents/store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const consultationId = searchParams.get("consultation_id");
    const documentId = searchParams.get("id");

    if (documentId) {
      const doc = documentsStore.getDocument(documentId);
      if (doc) {
        return NextResponse.json({ success: true, document: doc });
      }
      try {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("documents")
          .select("*")
          .eq("id", documentId)
          .single();
        if (data) {
          return NextResponse.json({ success: true, document: data });
        }
      } catch {
        // Fall through
      }
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (consultationId) {
      let docs = documentsStore.getDocumentsByConsultation(consultationId);

      // If empty in memory, try reading from Supabase
      if (docs.length === 0) {
        try {
          const supabase = createAdminClient();
          const { data } = await supabase
            .from("documents")
            .select("*")
            .eq("consultation_id", consultationId)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            docs = data as unknown as DocumentRecord[];
          }
        } catch {
          // Fall through
        }
      }

      return NextResponse.json({ success: true, documents: docs });
    }

    const allDocs = documentsStore.getAllDocuments();
    return NextResponse.json({ success: true, documents: allDocs });
  } catch (error: unknown) {
    console.error("[GET /api/documents] Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to list documents" },
      { status: 500 }
    );
  }
}
