"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MODELS } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";

const MAX_CARS = 5;
const MAX_ALERTS_PER_CAR = 3;

function fail(message: string): never {
  redirect(`/mycar?error=${encodeURIComponent(message)}`);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function addCar(formData: FormData) {
  const { supabase } = await requireUser();
  const model = MODELS.find((m) => m.id === String(formData.get("model_id")));
  const gradeIndex = Number(formData.get("grade_index"));
  const year = Number(formData.get("year"));
  const km = Number(String(formData.get("km") ?? "").replace(/[,，\s]/g, ""));
  const sohRaw = String(formData.get("soh") ?? "").trim();
  const soh = sohRaw === "" ? null : Number(sohRaw);

  if (!model) fail("車種を選んでください");
  if (!Number.isInteger(gradeIndex) || gradeIndex < 0 || gradeIndex >= model.grades.length) fail("グレードを選んでください");
  if (!Number.isInteger(year) || year < model.yearFrom || year > model.yearTo) fail("年式が正しくありません");
  if (!Number.isFinite(km) || km < 0 || km > 500000) fail("走行距離は 0〜500,000 の数字で入力してください");
  if (soh !== null && (!Number.isInteger(soh) || soh < 30 || soh > 100)) fail("バッテリー状態（SOH）は 30〜100 の整数で入力してください");

  const { count } = await supabase.from("cars").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_CARS) fail(`デモでは登録できる車は${MAX_CARS}台までです`);

  const { error } = await supabase
    .from("cars")
    .insert({ model_id: model.id, grade_index: gradeIndex, year, km: Math.round(km), soh });
  if (error) fail("車を登録できませんでした。時間をおいて、もう一度お試しください");
  revalidatePath("/mycar");
}

export async function deleteCar(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("cars").delete().eq("id", String(formData.get("car_id")));
  revalidatePath("/mycar");
}

export async function addAlert(formData: FormData) {
  const { supabase } = await requireUser();
  const carId = String(formData.get("car_id"));
  const direction = String(formData.get("direction"));
  const threshold = Number(formData.get("threshold"));

  if (direction !== "above" && direction !== "below") fail("条件を選んでください");
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 5000) fail("金額は 1〜5,000 万円の整数で入力してください");

  const { count } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("car_id", carId);
  if ((count ?? 0) >= MAX_ALERTS_PER_CAR) fail(`1台につきアラートは${MAX_ALERTS_PER_CAR}件までです`);

  const { error } = await supabase
    .from("alerts")
    .insert({ car_id: carId, direction, threshold_man_yen: threshold });
  if (error) fail("アラートを登録できませんでした");
  revalidatePath("/mycar");
}

export async function deleteAlert(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("alerts").delete().eq("id", String(formData.get("alert_id")));
  revalidatePath("/mycar");
}
