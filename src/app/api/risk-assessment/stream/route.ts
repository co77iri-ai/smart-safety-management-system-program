import { VertexAI, SchemaType } from "@google-cloud/vertexai";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import crypto from "node:crypto";

function parseJsonFlexible(text: string): Array<Record<string, unknown>> {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as Array<Record<string, unknown>>;
    return [parsed as Record<string, unknown>];
  } catch {}
  const arrStart = text.indexOf("[");
  const arrEnd = text.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    const block = text.substring(arrStart, arrEnd + 1);
    try {
      const parsed = JSON.parse(block);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {}
  }
  const objStart = text.indexOf("{");
  const objEnd = text.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    const block = text.substring(objStart, objEnd + 1);
    try {
      const parsed = JSON.parse(block);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {}
  }
  return [];
}

function normalizeModelId(modelId: string): string {
  const project = process.env.GCP_PROJECT_ID!;
  const location = process.env.GCP_LOCATION!;
  if (!modelId) throw new Error("Model ID not set");
  if (modelId.startsWith("projects/")) return modelId;
  if (modelId.startsWith("publishers/")) {
    return `projects/${project}/locations/${location}/${modelId}`;
  }
  return modelId;
}

async function callModelStrict(
  vertexAI: VertexAI,
  modelId: string,
  fileUri: string,
  mimeType: string
) {
  const model = vertexAI.getGenerativeModel({
    model: normalizeModelId(modelId),
    systemInstruction: `너는 산업안전 위험평가 보조자다. 입력 PDF에서 위험성평가 절차(제8조)를 찾아 단계별 핵심을 JSON으로만 요약한다. 설명/마크다운 금지.
항상 JSON만 출력한다. 주어진 정보를 바탕으로 {가능성, 중대성, 위험성, 세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수}만 키로 갖는 JSON을 반환하라. 설명/문장/마크다운 금지.
가능성, 중대성, 위험성은 위헝성평가절차(제8조)에 따라 단계별 운영수칙을 준수하여 평가해야한다.
AI측 추론 결과인 너의 위험성평가 결과는 기존 보고서의 점수와 동일한 결과를 출력해서는 아니되며, 스스로 산업안전 위험평가 보조자로써 독창적이고 객관적인 시각에서 새로운 위험성평가 결과를 "위험성평가 절차(제8조)"에 의하여 추론한 후 결과를 {가능성, 중대성, 위험성, 세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수}만 가진 JSON 형태로 반환해야만 한다.
만약 주어진 정보 내 위험성평가가 필요한 항목이 여러개일경우, {가능성, 중대성, 위험성, 세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수}만 가진 JSON 객체가 배열로 감싸진 결과물을 반환해야한다. 만약 주어진 정보 내 위험성평가가 필요한 항목이 하나뿐일 경우, 결과 형식의 일관성 보장을 위해 JSON 객체를 배열로 감싸서 반환해야한다.
반환해야할 추론 결과값에서 "가능성, 중대성, 위험성"은 정해진 기준에 따라 독창적인 결과를 추론하여 반환해야하고, 나머지 "세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수" 항목은 주어진 정보에 적혀진 그대로 인용하여 결과를 작성 후 반환해야한다.`,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            가능성: { type: SchemaType.NUMBER },
            중대성: { type: SchemaType.NUMBER },
            위험성: { type: SchemaType.NUMBER },
            세부작업: { type: SchemaType.STRING },
            위험분류: { type: SchemaType.STRING },
            위험상황결과: { type: SchemaType.STRING },
            // 새 필드: 기존 보고서 점수
            기존보고서의가능성점수: { type: SchemaType.NUMBER },
            기존보고서의중대성점수: { type: SchemaType.NUMBER },
            기존보고서의위험성점수: { type: SchemaType.NUMBER },
          },
          required: [
            "가능성",
            "중대성",
            "위험성",
            "세부작업",
            "위험분류",
            "위험상황결과",
            "기존보고서의가능성점수",
            "기존보고서의중대성점수",
            "기존보고서의위험성점수",
          ],
        },
      },
    },
  });
  const parts = [
    { fileData: { fileUri, mimeType } },
    {
      text: '업로드된 파일(표 포함 가능)을 분석하여 위험성 평가 결과를 JSON 배열로만 반환하세요. 각 행은 {"가능성":number,"중대성":number,"위험성":number,"세부작업":string,"위험분류":string,"위험상황결과":string,"기존보고서의가능성점수":number,"기존보고서의중대성점수":number,"기존보고서의위험성점수":number} 형식입니다. 헤더는 제외하고 데이터 행만 추출하세요.',
    },
  ];
  const resp = await model.generateContent({
    contents: [{ role: "user", parts }],
  });
  const text = resp.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = parseJsonFlexible(text);
  return parsed;
}

async function callModelRelax(
  vertexAI: VertexAI,
  modelId: string,
  fileUri: string,
  mimeType: string
) {
  const model = vertexAI.getGenerativeModel({
    model: normalizeModelId(modelId),
    systemInstruction: `너는 산업안전 위험평가 보조자다. 입력 PDF에서 위험성평가 절차(제8조)를 찾아 단계별 핵심을 JSON으로만 요약한다. 설명/마크다운 금지.
항상 JSON만 출력한다. 주어진 정보를 바탕으로 {가능성, 중대성, 위험성, 세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수}만 키로 갖는 JSON을 반환하라. 설명/문장/마크다운 금지.
가능성, 중대성, 위험성은 위헝성평가절차(제8조)에 따라 단계별 운영수칙을 준수하여 평가해야한다.
AI측 추론 결과인 너의 위험성평가 결과는 기존 보고서의 점수와 동일한 결과를 출력해서는 아니되며, 스스로 산업안전 위험평가 보조자로써 독창적이고 객관적인 시각에서 새로운 위험성평가 결과를 "위험성평가 절차(제8조)"에 의하여 추론한 후 결과를 {가능성, 중대성, 위험성, 세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수}만 가진 JSON 형태로 반환해야만 한다.
만약 주어진 정보 내 위험성평가가 필요한 항목이 여러개일경우, {가능성, 중대성, 위험성, 세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수}만 가진 JSON 객체가 배열로 감싸진 결과물을 반환해야한다. 만약 주어진 정보 내 위험성평가가 필요한 항목이 하나뿐일 경우, 결과 형식의 일관성 보장을 위해 JSON 객체를 배열로 감싸서 반환해야한다.
반환해야할 추론 결과값에서 "가능성, 중대성, 위험성"은 정해진 기준에 따라 독창적인 결과를 추론하여 반환해야하고, 나머지 "세부작업, 위험분류, 위험상황결과, 기존보고서의가능성점수, 기존보고서의중대성점수, 기존보고서의위험성점수" 항목은 주어진 정보에 적혀진 그대로 인용하여 결과를 작성 후 반환해야한다.`,
  });
  const parts = [
    { fileData: { fileUri, mimeType } },
    {
      text: '업로드된 파일(표 포함 가능)을 분석하여 위험성 평가 결과를 JSON 배열로만 반환하세요. 각 행은 {"가능성":number,"중대성":number,"위험성":number,"세부작업":string,"위험분류":string,"위험상황결과":string,"기존보고서의가능성점수":number,"기존보고서의중대성점수":number,"기존보고서의위험성점수":number} 형식입니다. 헤더는 제외하고 데이터 행만 추출하세요.',
    },
  ];
  const resp = await model.generateContent({
    contents: [{ role: "user", parts }],
  });
  const combined =
    resp.response.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .filter(Boolean)
      .join(" ") ?? "";
  const parsed = parseJsonFlexible(combined);
  return parsed;
}

async function callWithFileUri(
  vertexAI: VertexAI,
  fileUri: string,
  mimeType: string
) {
  const tuned = process.env.TUNED_MODEL_ID!; // 멀티모달 튜닝 모델(문제시 실패 가능)
  const vision =
    process.env.VISION_MODEL_ID || "publishers/google/models/gemini-2.5-pro"; // 퍼블리셔 비전 모델

  // 1) 튜닝 모델(엄격)
  try {
    return await callModelStrict(vertexAI, tuned, fileUri, mimeType);
  } catch {}
  // 2) 튜닝 모델(완화)
  try {
    return await callModelRelax(vertexAI, tuned, fileUri, mimeType);
  } catch {}
  // 3) 비전 모델(엄격)
  try {
    return await callModelStrict(vertexAI, vision, fileUri, mimeType);
  } catch {}
  // 4) 비전 모델(완화)
  return await callModelRelax(vertexAI, vision, fileUri, mimeType);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return new Response("No file uploaded", { status: 400 });

    const allowed = new Set([
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ]);
    const mimeType = file.type || "application/octet-stream";
    if (!allowed.has(mimeType))
      return new Response("Unsupported file type", { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Auth
    const credentialsJson = Buffer.from(
      process.env.GCP_SERVICE_ACCOUNT_CREDENTIALS!,
      "base64"
    ).toString("utf-8");
    const credentials = JSON.parse(credentialsJson);

    const vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID!,
      location: process.env.GCP_LOCATION!,
      googleAuthOptions: { credentials },
    });
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID!,
      credentials,
    });

    // Upload to GCS
    const bucketName = process.env.GCS_BUCKET_NAME!;
    const bucket = storage.bucket(bucketName);
    const [exists] = await bucket.exists();
    if (!exists)
      return new Response(`Bucket not found: ${bucketName}`, { status: 400 });

    const objectName = `risk/${Date.now()}_${crypto.randomUUID()}`;
    const gcsFile = bucket.file(objectName);
    await gcsFile.save(buffer, {
      contentType: mimeType,
      resumable: false,
      validation: false,
    });
    const fileUri = `gs://${bucketName}/${objectName}`;

    let results: Array<Record<string, unknown>> = [];
    try {
      results = await callWithFileUri(vertexAI, fileUri, mimeType);
    } finally {
      try {
        await gcsFile.delete();
      } catch {}
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
